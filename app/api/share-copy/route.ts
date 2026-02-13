import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { getTwitterCopy } from "@/lib/share-copy";

const redis = new Redis(process.env.REDIS_URL!);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SHARE_CTAS: Record<string, string> = {
  vision: "AI search is rewriting the rules. Find out what kind of player you are. \u{1F447}",
  glue: "AI search needs new playbooks. Find out what kind of player you are. \u{1F447}",
  trendsetter: "Find out what kind of player you are. \u{1F447}",
  goGoGoer: "AI search rewards speed. Find out what kind of player you are. \u{1F447}",
  tastemaker: "In a world of AI slop, taste wins. Find out what kind of player you are. \u{1F447}",
  clutch: "Find out what kind of player you are. \u{1F447}",
  heart: "Find out what kind of player you are. \u{1F447}",
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

    const data = await redis.get(`quiz:${userId}`);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Results not found for the given userId." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const parsed = JSON.parse(data);

    const archetypeId = parsed.archetype?.id || "trendsetter";
    const archetypeName = parsed.archetype?.name || "Champion";
    const tagline = parsed.archetype?.tagline || "";
    const mostLikelyTo = parsed.bullets?.mostLikelyTo || "";
    const typicallySpending = parsed.bullets?.typicallySpending || "";
    const favoritePhrase = parsed.bullets?.favoritePhrase || "";

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";

    const sharePageUrl = `${baseUrl}/share?userId=${userId}`;
    const quizUrl = `${baseUrl}/quiz`;
    const closingCta = SHARE_CTAS[archetypeId] || SHARE_CTAS.trendsetter;

    // Shared body (bullets + CTA)
    const shareBody = [
      `I took the AirOps Content Engineer quiz and got The ${archetypeName} -- ${tagline}`,
      ``,
      `- Most likely to: ${mostLikelyTo}`,
      `- Spend time: ${typicallySpending}`,
      `- Favorite phrase: ${favoritePhrase}`,
      ``,
      closingCta,
    ].join("\n");

    // X / Twitter — use pre-written copy if available, fallback to shareBody
    const role = parsed.role || "ic";
    const twitterCopy = getTwitterCopy(archetypeId, role) || shareBody;
    const twitterText = `${twitterCopy}\n\nTake the @airopshq marketer archetype quiz here \u{1F447}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(sharePageUrl)}`;

    // LinkedIn — use share-offsite to guarantee OG card preview.
    // Text is provided separately for the client to copy to clipboard.
    const linkedinText = shareBody;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl)}`;

    return NextResponse.json(
      {
        success: true,
        sharePageUrl,
        quizUrl,
        twitter: {
          text: twitterText,
          intentUrl: twitterUrl,
        },
        linkedin: {
          text: linkedinText,
          intentUrl: linkedinUrl,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in share-copy:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
