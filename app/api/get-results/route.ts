import { NextRequest, NextResponse } from "next/server";
import { getQuizRecord, isPublicQuizRecord } from "@/lib/quiz-store";
import { getCardTheme, getCardImages, getResultsPageTheme } from "@/lib/card-themes";
import { getTwitterCopy } from "@/lib/share-copy";

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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const parsed = await getQuizRecord(userId);

    if (!isPublicQuizRecord(parsed)) {
      return NextResponse.json(
        { success: false, error: "Results not found for the given userId." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Normalize old archetype IDs (trendsetter→maverick, etc.) for existing records
    if (parsed.archetype?.id) {
      parsed.archetype.id = normalizeArchetypeId(parsed.archetype.id);
    }

    // Resolve base URL for absolute image paths
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";

    // Enrich with card theme colors and image URLs
    const archetypeId = parsed.archetype?.id || "";
    const theme = getCardTheme(archetypeId);
    const resultsPageTheme = getResultsPageTheme(archetypeId);
    const images = getCardImages(archetypeId, baseUrl);

    const role = parsed.role || "ic";
    const twitterShareText = getTwitterCopy(archetypeId, role);
    const shareUrl = `${baseUrl}/share?userId=${userId}`;

    return NextResponse.json(
      {
        success: true,
        ...parsed,
        // Pre-built share data for Webflow
        twitterShareText,
        shareUrl,
        // Card theme colors (for building the card natively in Webflow)
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
        // Results page colors (background, text, buttons)
        resultsPageTheme,
        // All image/SVG asset URLs (absolute)
        images,
        // Captured flat card images (populated after user visits results page)
        stippleImageUrl: parsed.stippleImageUrl || null,
        cardImageUrl: parsed.cardUrl || null,
        ogImageUrl: parsed.ogImageUrl || null,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in get-results:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
