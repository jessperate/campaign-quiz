import { getRedis } from "@/lib/redis";
import type { QuizRecord } from "@/lib/quiz-store";

const SAFEGUARDS_STARTED_AT = Date.parse("2026-07-17T21:30:00.000Z");

function parseInfo(raw: string): Record<string, string> {
  return Object.fromEntries(
    raw
      .split("\r\n")
      .filter((line) => line && !line.startsWith("#") && line.includes(":"))
      .map((line) => {
        const separator = line.indexOf(":");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

export async function runQuizIntegrityCheck() {
  const redis = getRedis();
  const keys = new Set<string>();
  let cursor = "0";
  do {
    const [nextCursor, pageKeys] = await redis.scan(cursor, "MATCH", "quiz:*", "COUNT", 250);
    cursor = nextCursor;
    for (const key of pageKeys) keys.add(key);
  } while (cursor !== "0");

  const keyList = [...keys];
  const records: QuizRecord[] = [];
  const expiringKeys: string[] = [];

  for (let offset = 0; offset < keyList.length; offset += 250) {
    const batch = keyList.slice(offset, offset + 250);
    const pipeline = redis.pipeline();
    for (const key of batch) {
      pipeline.ttl(key);
      pipeline.get(key);
    }
    const results = await pipeline.exec();
    if (!results) throw new Error("Redis integrity pipeline returned no results.");

    for (let index = 0; index < batch.length; index += 1) {
      const ttlResult = results[index * 2];
      const valueResult = results[index * 2 + 1];
      if (ttlResult[0]) throw ttlResult[0];
      if (valueResult[0]) throw valueResult[0];

      const ttl = Number(ttlResult[1]);
      if (ttl >= 0) expiringKeys.push(batch[index]);
      if (valueResult[1]) {
        try {
          records.push(JSON.parse(String(valueResult[1])) as QuizRecord);
        } catch {
          // Malformed records are counted below via the key/record difference.
        }
      }
    }
  }

  let autoPersisted = 0;
  if (expiringKeys.length && process.env.INTEGRITY_AUTO_PERSIST !== "false") {
    const pipeline = redis.pipeline();
    for (const key of expiringKeys) pipeline.persist(key);
    const results = await pipeline.exec();
    autoPersisted = results?.filter(([error, value]) => !error && value === 1).length || 0;
  }

  const recentRecords = records.filter((record) => {
    const createdAt = typeof record.createdAt === "string" ? Date.parse(record.createdAt) : 0;
    return createdAt >= SAFEGUARDS_STARTED_AT;
  });
  const archiveFailed = recentRecords.filter((record) => record.archive?.status === "failed").length;
  const archiveMissing = recentRecords.filter((record) => record.archive?.status !== "complete").length;
  const removedRecords = records.filter((record) => record.hidden || record.removed).length;
  const malformedRecords = keyList.length - records.length;

  const portraitRecords = records.filter((record) => record.stippleImageUrl || record.headshotUrl).slice(0, 5);
  const portraitChecks = await Promise.all(
    portraitRecords.map(async (record) => {
      const url = record.stippleImageUrl || record.headshotUrl || "";
      try {
        const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8_000) });
        return response.ok;
      } catch {
        return false;
      }
    }),
  );
  const brokenPortraitSamples = portraitChecks.filter((ok) => !ok).length;

  let serverInfo: Record<string, string> = {};
  try {
    const [memory, persistence, stats, replication] = await Promise.all([
      redis.info("memory"),
      redis.info("persistence"),
      redis.info("stats"),
      redis.info("replication"),
    ]);
    serverInfo = {
      ...parseInfo(memory),
      ...parseInfo(persistence),
      ...parseInfo(stats),
      ...parseInfo(replication),
    };
  } catch {
    // Some managed plans restrict INFO sections. Core key checks still run.
  }

  const minExpectedKeys = Number(process.env.QUIZ_MIN_EXPECTED_RECORDS || 900);
  const tlsEnabled = Boolean(process.env.REDIS_URL?.startsWith("rediss://"));
  const issues: string[] = [];
  if (keyList.length < minExpectedKeys) issues.push("record-count-below-floor");
  if (expiringKeys.length) issues.push("expiring-keys-detected");
  if (malformedRecords) issues.push("malformed-records");
  if (archiveFailed) issues.push("archive-failures");
  if (archiveMissing) issues.push("recent-records-without-archive");
  if (brokenPortraitSamples) issues.push("broken-portrait-samples");
  if (!tlsEnabled) issues.push("redis-tls-disabled");
  if (serverInfo.aof_enabled === "0") issues.push("redis-aof-disabled");
  if (serverInfo.maxmemory_policy && serverInfo.maxmemory_policy !== "noeviction") {
    issues.push("redis-eviction-policy-not-noeviction");
  }

  return {
    ok: issues.length === 0,
    checkedAt: new Date().toISOString(),
    issues,
    records: {
      keys: keyList.length,
      parsed: records.length,
      removed: removedRecords,
      minimumExpected: minExpectedKeys,
      expiringDetected: expiringKeys.length,
      autoPersisted,
      malformed: malformedRecords,
    },
    archives: {
      recentRecords: recentRecords.length,
      failed: archiveFailed,
      missing: archiveMissing,
    },
    portraits: {
      sampled: portraitChecks.length,
      broken: brokenPortraitSamples,
    },
    redis: {
      tlsEnabled,
      aofEnabled: serverInfo.aof_enabled ?? "unknown",
      evictionPolicy: serverInfo.maxmemory_policy ?? "unknown",
      usedMemory: serverInfo.used_memory_human ?? "unknown",
      maxMemory: serverInfo.maxmemory_human ?? "unknown",
      evictedKeys: serverInfo.evicted_keys ?? "unknown",
      role: serverInfo.role ?? "unknown",
      connectedReplicas: serverInfo.connected_slaves ?? "unknown",
    },
  };
}
