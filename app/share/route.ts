import type { ArchetypeId } from '@/lib/quiz-data';
import { archetypes } from '@/lib/archetypes';
import { getShareCopy, ARCHETYPE_TAGLINES } from '@/lib/share-copy';
import Redis from 'ioredis';
import { NextRequest } from 'next/server';

const redis = new Redis(process.env.REDIS_URL!);

function getBaseUrl() {
  return process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://campaign-quiz.vercel.app';
}

function getShareBaseUrl() {
  return process.env.NEXT_PUBLIC_SHARE_BASE_URL || 'https://www.airops.com';
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get('userId') || '';
  const baseUrl = getBaseUrl();
  const shareBaseUrl = getShareBaseUrl();

  let archetypeId: ArchetypeId = 'vision';
  let role = 'ic';
  let ogImageUrl: string | null = null;
  let firstName = '';
  let lastName = '';

  if (userId) {
    try {
      const data = await redis.get(`quiz:${userId}`);
      if (data) {
        const parsed = JSON.parse(data);
        archetypeId = (parsed.archetype?.id || 'vision') as ArchetypeId;
        role = parsed.role || 'ic';
        ogImageUrl = parsed.ogImageUrl || parsed.cardUrl || null;
        firstName = parsed.firstName || '';
        lastName = parsed.lastName || '';
      }
    } catch {
      // fall through to defaults
    }
  }

  if (!ogImageUrl) {
    const paramArchetype = searchParams.get('archetype');
    const paramCardUrl = searchParams.get('cardUrl');
    if (paramArchetype) archetypeId = paramArchetype as ArchetypeId;
    if (paramCardUrl) ogImageUrl = paramCardUrl;
  }

  const archetype = archetypes[archetypeId];
  const archetypeName = archetype?.name || 'Champion';
  const tagline = ARCHETYPE_TAGLINES[archetypeId] || 'Find your archetype.';
  const copy = getShareCopy(archetypeId, role);

  const title = firstName
    ? `${firstName} ${lastName} is The ${archetypeName} — "${tagline}"`
    : `I'm The ${archetypeName} — "${tagline}"`;

  let description: string;
  if (copy) {
    description = `Most likely to: ${copy.mostLikelyTo}. ${copy.cta}`;
  } else {
    description = `${tagline} Take the quiz to find your archetype!`;
  }

  const imageUrl = ogImageUrl
    ? ogImageUrl
    : userId
      ? `${baseUrl}/api/og-image?userId=${userId}`
      : `${baseUrl}/api/og-image`;

  const resultsUrl = userId
    ? `${shareBaseUrl}/results?userId=${userId}`
    : `${shareBaseUrl}/win`;

  const html = `<!DOCTYPE html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(resultsUrl)}" />
  <meta property="og:image" content="${esc(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(`The ${archetypeName} - Content Engineer Archetype Card`)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(imageUrl)}" />
</head>
<body style="margin:0;background:#0a0a0a;color:white;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <p>Redirecting to your results...</p>
  <script>window.location.replace(${JSON.stringify(resultsUrl)});</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
