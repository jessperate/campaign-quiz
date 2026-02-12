import { NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const cards: Array<{
      userId: string;
      firstName: string;
      lastName: string;
      company: string;
      archetypeId: string;
      archetypeName: string;
      shortName: string;
      headshotUrl: string;
      stippleImageUrl: string;
      mostLikelyTo: string;
      typicallySpending: string;
      favoritePhrase: string;
      createdAt: string;
    }> = [];

    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "quiz:*", "COUNT", 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        for (const key of keys) {
          pipeline.get(key);
        }
        const results = await pipeline.exec();

        if (results) {
          for (const [err, val] of results) {
            if (err || !val) continue;
            try {
              const data = JSON.parse(val as string);
              if (data.archetype?.id) {
                cards.push({
                  userId: data.userId,
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  company: data.company || "",
                  archetypeId: data.archetype?.id || "",
                  archetypeName: data.archetype?.name || "",
                  shortName: data.archetype?.shortName || "",
                  headshotUrl: data.stippleImageUrl || data.headshotUrl || "",
                  stippleImageUrl: data.stippleImageUrl || "",
                  mostLikelyTo: data.bullets?.mostLikelyTo || "",
                  typicallySpending: data.bullets?.typicallySpending || "",
                  favoritePhrase: data.bullets?.favoritePhrase || "",
                  createdAt: data.createdAt || "",
                });
              }
            } catch {
              // Skip malformed entries
            }
          }
        }
      }
    } while (cursor !== "0");

    // Sort by most recent first
    cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ cards }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    return NextResponse.json({ cards: [] }, { headers: CORS_HEADERS });
  }
}
