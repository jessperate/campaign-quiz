import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { archetypes } from '@/lib/archetypes';
import type { ArchetypeId } from '@/lib/quiz-data';

interface SharePageProps {
  searchParams: Promise<{
    archetype?: string;
    cardUrl?: string;
    stat1?: string;
    stat2?: string;
    stat3?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const archetypeId = (params.archetype || 'vision') as ArchetypeId;
  const archetype = archetypes[archetypeId];
  const cardUrl = params.cardUrl;

  const stat1 = params.stat1 ? decodeURIComponent(params.stat1) : '';
  const stat2 = params.stat2 ? decodeURIComponent(params.stat2) : '';
  const stat3 = params.stat3 ? decodeURIComponent(params.stat3) : '';

  const title = `I'm "The ${archetype?.name || 'Champion'}" - What's Your Content Engineer Archetype?`;
  const description = stat1 && stat2 && stat3
    ? `🎯 Most likely to: ${stat1}\n⏰ Typically spending time: ${stat2}\n💬 Favorite phrase: ${stat3}\n\nTake the quiz to find yours!`
    : `${archetype?.roleContent?.ic?.tagline || 'Find your archetype'}. Take the quiz to discover your Content Engineer archetype!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://campaign-quiz.vercel.app/quiz',
      images: cardUrl ? [
        {
          url: cardUrl,
          width: 1080,
          height: 1080,
          alt: `The ${archetype?.name || 'Champion'} - Content Engineer Archetype Card`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cardUrl ? [cardUrl] : [],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const params = await searchParams;
  const archetypeId = (params.archetype || 'vision') as ArchetypeId;
  const archetype = archetypes[archetypeId];
  const cardUrl = params.cardUrl;

  const stat1 = params.stat1 ? decodeURIComponent(params.stat1) : '';
  const stat2 = params.stat2 ? decodeURIComponent(params.stat2) : '';
  const stat3 = params.stat3 ? decodeURIComponent(params.stat3) : '';

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
          {cardUrl && (
            <div className="mb-8">
              <img
                src={cardUrl}
                alt={`The ${archetype?.name} card`}
                className="w-full max-w-sm mx-auto rounded-xl shadow-2xl"
              />
            </div>
          )}

          <h1 className="text-[#0D3D1F] text-3xl md:text-4xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
            The {archetype?.name || 'Champion'}
          </h1>

          <p className="text-[#0D3D1F]/70 text-lg mb-6 italic">
            &quot;{archetype?.roleContent?.ic?.tagline}&quot;
          </p>

          {(stat1 || stat2 || stat3) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left">
              {stat1 && (
                <div className="mb-3">
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Most likely to...</p>
                  <p className="text-[#0D3D1F]">{stat1}</p>
                </div>
              )}
              {stat2 && (
                <div className="mb-3">
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Typically spending time...</p>
                  <p className="text-[#0D3D1F]">{stat2}</p>
                </div>
              )}
              {stat3 && (
                <div>
                  <p className="text-[#0D3D1F]/50 text-xs uppercase">Favorite phrase...</p>
                  <p className="text-[#0D3D1F]">{stat3}</p>
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
