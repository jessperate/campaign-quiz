import type { Metadata } from "next";
import Redis from "ioredis";
import { getShareCopy, ARCHETYPE_TAGLINES } from "@/lib/share-copy";
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
    const { firstName, lastName, archetype } = parsed;
    const role = parsed.role || "ic";
    const archetypeId = archetype?.id || "vision";
    const archetypeName = archetype?.name || "Champion";
    const tagline = ARCHETYPE_TAGLINES[archetypeId] || "Find your archetype.";
    const copy = getShareCopy(archetypeId, role);

    const title = firstName
      ? `${firstName} ${lastName} took the AirOps Content Engineer quiz and got The ${archetypeName} — "${tagline}"`
      : `I took the AirOps Content Engineer quiz and got The ${archetypeName} — "${tagline}"`;

    let description: string;
    if (copy) {
      description = [
        `Most likely to: ${copy.mostLikelyTo}`,
        `Spend time: ${copy.spendTime}`,
        `Favorite phrase: "${copy.favoritePhrase}"`,
        copy.cta,
      ].join(" · ");
    } else {
      description = `${tagline} Take the quiz to find your Content Engineer archetype!`;
    }

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";
    const shareBaseUrl = process.env.NEXT_PUBLIC_SHARE_BASE_URL || baseUrl;

    const ogImageUrl = `${baseUrl}/api/og-image?userId=${userId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${shareBaseUrl}/results?userId=${userId}`,
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
