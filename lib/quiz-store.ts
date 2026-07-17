import { getRedis } from "@/lib/redis";

export type QuizRecord = Record<string, unknown> & {
  userId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  role?: string;
  wantsDemo?: boolean;
  headshotUrl?: string;
  stippleImageUrl?: string;
  cardUrl?: string;
  cardImageUrl?: string;
  ogImageUrl?: string;
  linkedinProfileImageUrl?: string;
  enriched?: boolean;
  createdAt?: string;
  archetype?: { id?: string; name?: string; shortName?: string; tagline?: string };
  bullets?: { mostLikelyTo?: string; typicallySpending?: string; favoritePhrase?: string };
  archive?: { status?: string; [key: string]: unknown };
  hidden?: boolean;
  removed?: boolean;
  removedAt?: string;
  removedBy?: string;
};

const ATOMIC_MERGE_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if not value then return false end
local record = cjson.decode(value)
local patch = cjson.decode(ARGV[1])
for key, patchValue in pairs(patch) do
  record[key] = patchValue
end
local encoded = cjson.encode(record)
redis.call('SET', KEYS[1], encoded)
return encoded
`;

export function quizKey(userId: string): string {
  return `quiz:${userId}`;
}

export async function getQuizRecord(userId: string): Promise<QuizRecord | null> {
  const value = await getRedis().get(quizKey(userId));
  return value ? (JSON.parse(value) as QuizRecord) : null;
}

export function isPublicQuizRecord(record: QuizRecord | null): record is QuizRecord {
  return Boolean(record && !record.hidden && !record.removed);
}

export async function createQuizRecord(record: QuizRecord): Promise<void> {
  const result = await getRedis().set(quizKey(record.userId), JSON.stringify(record), "NX");
  if (result !== "OK") {
    throw new Error(`Quiz record ${record.userId} already exists.`);
  }
}

export async function updateQuizRecord(
  userId: string,
  patch: Record<string, unknown>,
): Promise<QuizRecord | null> {
  const value = await getRedis().eval(
    ATOMIC_MERGE_SCRIPT,
    1,
    quizKey(userId),
    JSON.stringify(patch),
  );
  return value ? (JSON.parse(String(value)) as QuizRecord) : null;
}

export async function softDeleteQuizRecord(userId: string, actor: string): Promise<boolean> {
  const updated = await updateQuizRecord(userId, {
    hidden: true,
    removed: true,
    removedAt: new Date().toISOString(),
    removedBy: actor,
  });
  return Boolean(updated);
}

export async function restoreQuizRecord(userId: string, actor: string): Promise<boolean> {
  const updated = await updateQuizRecord(userId, {
    hidden: false,
    removed: false,
    restoredAt: new Date().toISOString(),
    restoredBy: actor,
  });
  return Boolean(updated);
}

export async function ensureQuizRecordIsPermanent(userId: string): Promise<boolean> {
  return (await getRedis().persist(quizKey(userId))) === 1;
}
