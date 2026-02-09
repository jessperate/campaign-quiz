import type { Metadata } from "next";
import Redis from "ioredis";
import ResultsClient from "./ResultsClient";

const redis = new Redis(process.env.REDIS_URL!);

interface Props {
  searchParams: Promise<{ userId?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const userId = params.userId;

  if (!userId) {
    return {
      title: "Your Results | Content Engineer Quiz",
      description: "Discover your Content Engineer archetype.",
    };
  }

  try {
    const data = await redis.get(`quiz:${userId}`);
    if (!data) {
      return {
        title: "Your Results | Content Engineer Quiz",
      };
    }

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const { firstName, lastName, archetype, bullets, ogImageUrl: savedOgImage, cardUrl: savedCardUrl } = parsed;
    const title = `${firstName} ${lastName} is "The ${archetype.name}" — Content Engineer Archetype`;

    const descriptionParts: string[] = [];
    if (archetype.tagline) descriptionParts.push(archetype.tagline);
    if (bullets?.mostLikelyTo) descriptionParts.push(`Most likely to: ${bullets.mostLikelyTo}`);
    if (bullets?.favoritePhrase) descriptionParts.push(`Favorite phrase: "${bullets.favoritePhrase}"`);
    const description = descriptionParts.join(' | ') || archetype.tagline;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";

    // Prefer the pre-rendered blob image, fall back to dynamic server-side generation
    const ogImageUrl = savedOgImage || savedCardUrl || `${baseUrl}/api/og-image?userId=${userId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/quiz`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: "Your Results | Content Engineer Quiz",
    };
  }
}

export default function ResultsPage() {
  return <ResultsClient />;
}
