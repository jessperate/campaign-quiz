import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { archetypes } from '@/lib/archetypes';
import type { ArchetypeId } from '@/lib/quiz-data';
import Redis from 'ioredis';

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

  const title = `I'm "The ${data.archetype?.name || 'Champion'}" - What's Your Content Engineer Archetype?`;
  const description = data.stat1 && data.stat2 && data.stat3
    ? `🎯 Most likely to: ${data.stat1}\n⏰ Typically spending time: ${data.stat2}\n💬 Favorite phrase: ${data.stat3}\n\nTake the quiz to find yours!`
    : `${data.archetype?.roleContent?.ic?.tagline || 'Find your archetype'}. Take the quiz to discover your Content Engineer archetype!`;

  const imageUrl = data.ogImageUrl || data.cardUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://campaign-quiz.vercel.app/quiz',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1080,
          height: 1080,
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

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams;
  const data = await getShareData(params);

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/quiz-bg-v3.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          {/* Card preview */}
          {(data.ogImageUrl || data.cardUrl) && (
            <div className="mb-8">
              <img
                src={data.ogImageUrl || data.cardUrl || ''}
                alt={`The ${data.archetype?.name} card`}
                className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
              />
            </div>
          )}

          <h1 className="text-[#0D3D1F] text-3xl md:text-4xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
            The {data.archetype?.name || 'Champion'}
          </h1>

          <p className="text-[#0D3D1F]/70 text-lg mb-6 italic">
            &quot;{data.archetype?.roleContent?.ic?.tagline}&quot;
          </p>

          {(data.stat1 || data.stat2 || data.stat3) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left">
              {data.stat1 && (
                <div className="mb-3">
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Most likely to...</p>
                  <p className="text-[#0D3D1F]">{data.stat1}</p>
                </div>
              )}
              {data.stat2 && (
                <div className="mb-3">
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Typically spending time...</p>
                  <p className="text-[#0D3D1F]">{data.stat2}</p>
                </div>
              )}
              {data.stat3 && (
                <div>
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Favorite phrase...</p>
                  <p className="text-[#0D3D1F]">{data.stat3}</p>
                </div>
              )}
            </div>
          )}

          <Link
            href="/quiz"
            className="inline-flex items-center px-8 py-4 bg-[#0D3D1F] text-white rounded-full text-lg font-bold hover:bg-[#0D3D1F]/90 transition-all"
          >
            Take the Quiz
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
