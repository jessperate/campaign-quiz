import Redis from "ioredis";
import { archiveQuizRecord } from "../lib/quiz-archive.ts";

const APPLY = process.argv.includes("--apply");
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  connectTimeout: 10_000,
});

const MERGE_ARCHIVE_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if not value then return false end
local record = cjson.decode(value)
record['archive'] = cjson.decode(ARGV[1])
redis.call('SET', KEYS[1], cjson.encode(record))
return true
`;

try {
  const keys = await redis.keys("quiz:*");
  const values = keys.length ? await redis.mget(...keys) : [];
  const pending = [];

  for (let index = 0; index < keys.length; index += 1) {
    if (!values[index]) continue;
    const record = JSON.parse(values[index]);
    if (record.archive?.status === "complete") continue;
    pending.push({ key: keys[index], record });
  }

  if (!APPLY) {
    console.log(JSON.stringify({ mode: "dry-run", total: keys.length, pending: pending.length }, null, 2));
    process.exit(0);
  }

  let archived = 0;
  let failed = 0;
  for (let offset = 0; offset < pending.length; offset += 5) {
    const batch = pending.slice(offset, offset + 5);
    const results = await Promise.allSettled(
      batch.map(async ({ key, record }) => {
        const result = await archiveQuizRecord(record);
        if (result.status !== "complete") throw new Error(result.reason);
        const archive = { ...result, archivedAt: new Date().toISOString() };
        await redis.eval(MERGE_ARCHIVE_SCRIPT, 1, key, JSON.stringify(archive));
      }),
    );
    archived += results.filter((result) => result.status === "fulfilled").length;
    failed += results.filter((result) => result.status === "rejected").length;
  }

  console.log(JSON.stringify({
    mode: "apply",
    total: keys.length,
    attempted: pending.length,
    archived,
    failed,
  }, null, 2));
} finally {
  await redis.quit().catch(() => redis.disconnect());
}
