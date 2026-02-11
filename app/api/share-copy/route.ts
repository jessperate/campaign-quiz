import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

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

    const data = await redis.get(`quiz:${userId}`);

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Results not found for the given userId." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const parsed = JSON.parse(data);

    const firstName = parsed.firstName || "";
    const lastName = parsed.lastName || "";
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

    // X / Twitter
    const twitterText = `I just discovered I'm "The ${archetypeName}" — ${tagline} Take the quiz to find your Content Engineer archetype!`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(sharePageUrl)}`;

    // LinkedIn
    const linkedinText = [
      `I just took the Content Engineer quiz and I'm "The ${archetypeName}" — ${tagline}`,
      ``,
      `Most likely to: ${mostLikelyTo}`,
      `Typically spending time: ${typicallySpending}`,
      `Favorite phrase: "${favoritePhrase}"`,
      ``,
      `Find your archetype:`,
      sharePageUrl,
    ].join("\n");
    const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedinText)}`;

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
