import { Metadata } from 'next';
import { archetypes } from '@/lib/archetypes';
import type { ArchetypeId } from '@/lib/quiz-data';
import Redis from 'ioredis';
import ResultsClient from '../results/ResultsClient';

const redis = new Redis(process.env.REDIS_URL!);

interface SharePageProps {
  searchParams: Promise<{
    userId?: string;
    // Legacy params (fallback)
    archetype?: string;
    cardUrl?: string;
    stat1?: string;
    stat2?: string;
    stat3?: string;
  }>;
}

async function getShareData(params: Awaited<SharePageProps['searchParams']>) {
  // If userId is present, fetch everything from Redis
  if (params.userId) {
    const data = await redis.get(`quiz:${params.userId}`);
    if (data) {
      const parsed = JSON.parse(data);
      const archetypeId = (parsed.archetype?.id || parsed.archetypeId || 'vision') as ArchetypeId;
      const archetype = archetypes[archetypeId];
      return {
        archetypeId,
        archetype,
        ogImageUrl: parsed.ogImageUrl || parsed.cardUrl || null,
        cardUrl: parsed.cardUrl || null,
        stat1: parsed.bullets?.mostLikelyTo || '',
        stat2: parsed.bullets?.typicallySpending || '',
        stat3: parsed.bullets?.favoritePhrase || '',
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        company: parsed.company || '',
      };
    }
  }

  // Fallback to legacy query params
  const archetypeId = (params.archetype || 'vision') as ArchetypeId;
  const archetype = archetypes[archetypeId];
  return {
    archetypeId,
    archetype,
    ogImageUrl: params.cardUrl || null,
    cardUrl: params.cardUrl || null,
    stat1: params.stat1 ? decodeURIComponent(params.stat1) : '',
    stat2: params.stat2 ? decodeURIComponent(params.stat2) : '',
    stat3: params.stat3 ? decodeURIComponent(params.stat3) : '',
    firstName: '',
    lastName: '',
    company: '',
  };
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const data = await getShareData(params);

  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://campaign-quiz.vercel.app';

  const quizUrl = `${baseUrl}/quiz`;

  const title = data.firstName
    ? `${data.firstName} ${data.lastName} is "The ${data.archetype?.name || 'Champion'}" — Content Engineer Archetype`
    : `I'm "The ${data.archetype?.name || 'Champion'}" — What's Your Content Engineer Archetype?`;

  const descriptionParts: string[] = [];
  if (data.stat1) descriptionParts.push(`Most likely to: ${data.stat1}`);
  if (data.stat2) descriptionParts.push(`Typically spending time: ${data.stat2}`);
  if (data.stat3) descriptionParts.push(`Favorite phrase: "${data.stat3}"`);
  if (descriptionParts.length > 0) {
    descriptionParts.push('Take the quiz to find your Content Engineer archetype!');
  }
  const description = descriptionParts.length > 0
    ? descriptionParts.join(' | ')
    : `${data.archetype?.roleContent?.ic?.tagline || 'Find your archetype'}. Take the quiz to discover your Content Engineer archetype!`;

  // Prefer static pre-uploaded OG image (fast CDN URL, instant for LinkedIn crawlers).
  // Fall back to dynamic /api/og-image endpoint if no pre-uploaded image exists yet.
  const imageUrl = data.ogImageUrl
    ? data.ogImageUrl
    : params.userId
      ? `${baseUrl}/api/og-image?userId=${params.userId}`
      : null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: quizUrl,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `The ${data.archetype?.name || 'Champion'} - Content Engineer Archetype Card`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default function SharePage() {
  return <ResultsClient />;
}
