#!/usr/bin/env node

import Redis from "ioredis";

const apply = process.argv.includes("--apply");
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("REDIS_URL is required.");
  process.exit(1);
}

async function scanQuizKeys(redis) {
  const keys = [];
  let cursor = "0";

  do {
    const [nextCursor, batch] = await redis.scan(
      cursor,
      "MATCH",
      "quiz:*",
      "COUNT",
      250,
    );
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0");

  return keys;
}

async function main() {
  const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

  try {
    await redis.connect();
    const keys = await scanQuizKeys(redis);

    if (keys.length === 0) {
      console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", total: 0 }));
      return;
    }

    const ttlPipeline = redis.pipeline();
    for (const key of keys) ttlPipeline.ttl(key);
    const ttlResults = await ttlPipeline.exec();

    let expiring = 0;
    let persistent = 0;
    let missing = 0;

    for (const [error, ttl] of ttlResults || []) {
      if (error) throw error;
      if (ttl === -1) persistent += 1;
      else if (ttl === -2) missing += 1;
      else if (typeof ttl === "number" && ttl >= 0) expiring += 1;
    }

    let changed = 0;
    if (apply && expiring > 0) {
      const persistPipeline = redis.pipeline();
      for (const key of keys) persistPipeline.persist(key);
      const persistResults = await persistPipeline.exec();
      for (const [error, result] of persistResults || []) {
        if (error) throw error;
        if (result === 1) changed += 1;
      }
    }

    console.log(
      JSON.stringify({
        mode: apply ? "apply" : "dry-run",
        total: keys.length,
        expiring,
        persistent,
        missing,
        changed,
      }),
    );
  } finally {
    redis.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
