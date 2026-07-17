import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";
import { getCardTheme, getCardImages, getResultsPageTheme } from "@/lib/card-themes";

// Map old archetype IDs to new ones for existing Redis data
const ARCHETYPE_ID_MAP: Record<string, string> = {
  trendsetter: "maverick",
  tastemaker: "craft",
  goGoGoer: "spark",
  clutch: "flex",
};
function normalizeArchetypeId(id: string): string {
  return ARCHETYPE_ID_MAP[id] || id;
}

export const dynamic = "force-dynamic";

// In-memory cache with 60s TTL to avoid re-scanning Redis on every request
let cachedResponse: { cards: Array<Record<string, unknown>>; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;

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
    const redis = getRedis();
    // Return cached response if fresh
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({ cards: cachedResponse.cards }, { headers: CORS_HEADERS });
    }

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
              // A generated stipple portrait is optional. The card renderers already
              // fall back to the uploaded headshot and then to archetype artwork, so
              // requiring stippleImageUrl here makes otherwise valid submissions
              // disappear from every carousel when image generation fails.
              //
              // Keep explicit moderation/recovery flags out of public feeds.
              if (
                data.archetype?.id &&
                data.firstName &&
                !data.hidden &&
                !data.removed
              ) {
                const archetypeId = normalizeArchetypeId(data.archetype?.id || "");
                const theme = getCardTheme(archetypeId);
                const images = getCardImages(archetypeId, baseUrl);
                const resultsPageTheme = getResultsPageTheme(archetypeId);
                const portraitUrl =
                  data.stippleImageUrl ||
                  data.headshotUrl ||
                  `${baseUrl}/images/card-no-image-${archetypeId}.svg`;

                cards.push({
                  userId: data.userId,
                  firstName: data.firstName || "",
                  lastName: data.lastName || "",
                  company: data.company || "",
                  archetypeId,
                  archetypeName: data.archetype?.name || "",
                  shortName: data.archetype?.shortName || "",
                  // Webflow's /win loader still filters on headshotUrl before it
                  // renders a card. Always provide the designed archetype portrait
                  // fallback so valid records are not discarded a second time.
                  headshotUrl: portraitUrl,
                  stippleImageUrl: data.stippleImageUrl || "",
                  mostLikelyTo: data.bullets?.mostLikelyTo || "",
                  typicallySpending: data.bullets?.typicallySpending || "",
                  favoritePhrase: data.bullets?.favoritePhrase || "",
                  role: data.role || "ic",
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

    // Cache the result
    cachedResponse = { cards, timestamp: Date.now() };

    return NextResponse.json({ cards }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    return NextResponse.json({ cards: [] }, { headers: CORS_HEADERS });
  }
}
