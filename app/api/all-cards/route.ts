import { NextResponse } from "next/server";
import Redis from "ioredis";
import { getCardTheme, getCardImages, getResultsPageTheme } from "@/lib/card-themes";

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
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";

    const cards: Array<Record<string, unknown>> = [];

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
              if (data.archetype?.id && data.stippleImageUrl && data.firstName && data.company) {
                const archetypeId = data.archetype?.id || "";
                const theme = getCardTheme(archetypeId);
                const images = getCardImages(archetypeId, baseUrl);
                const resultsPageTheme = getResultsPageTheme(archetypeId);

                cards.push({
                  userId: data.userId,
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  company: data.company || "",
                  archetypeId,
                  archetypeName: data.archetype?.name || "",
                  shortName: data.archetype?.shortName || "",
                  headshotUrl: data.stippleImageUrl || data.headshotUrl || "",
                  stippleImageUrl: data.stippleImageUrl || "",
                  mostLikelyTo: data.bullets?.mostLikelyTo || "",
                  typicallySpending: data.bullets?.typicallySpending || "",
                  favoritePhrase: data.bullets?.favoritePhrase || "",
                  createdAt: data.createdAt || "",
                  theme: {
                    cardBorder: theme.cardBorder,
                    cardBg: theme.cardBg,
                    artBg: theme.artBg,
                    artBorder: theme.artBorder,
                    statsBg: theme.statsBg,
                    statsBorder: theme.statsBorder,
                    labelColor: theme.labelColor,
                    dotColor: theme.dotColor,
                    dotBorder: theme.dotBorder,
                    headshotBg: theme.headshotBg,
                    headshotBorder: theme.headshotBorder,
                    fallbackInitialColor: theme.fallbackInitialColor,
                    pattern: theme.pattern,
                    patternFill: theme.patternFill,
                    patternStroke: theme.patternStroke,
                  },
                  resultsPageTheme,
                  images,
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
    cards.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());

    return NextResponse.json({ cards }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    return NextResponse.json({ cards: [] }, { headers: CORS_HEADERS });
  }
}
