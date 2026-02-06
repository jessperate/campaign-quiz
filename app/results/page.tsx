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
    const { firstName, lastName, archetype } = parsed;
    const title = `${firstName} ${lastName} is The ${archetype.name}`;
    const description = archetype.tagline;

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";

    const ogImageUrl = `${baseUrl}/api/og-image?userId=${userId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
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
