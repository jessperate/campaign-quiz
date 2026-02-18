const Redis = require("ioredis");
const { list, del } = require("@vercel/blob");

async function run() {
  const redis = new Redis(process.env.REDIS_URL);
  console.log("Connected to Redis");

  // Step 1: Collect all active blob URLs from Redis
  let cursor = "0";
  const activeUrls = new Set();
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", "quiz:*", "COUNT", 100);
    cursor = next;
    for (const key of keys) {
      const val = await redis.get(key);
      if (!val) continue;
      const d = JSON.parse(val);
      if (d.headshotUrl) activeUrls.add(d.headshotUrl);
      if (d.stippleImageUrl) activeUrls.add(d.stippleImageUrl);
      if (d.ogImageUrl) activeUrls.add(d.ogImageUrl);
      if (d.cardImageUrl) activeUrls.add(d.cardImageUrl);
    }
  } while (cursor !== "0");
  redis.disconnect();

  console.log("Active blob URLs in Redis:", activeUrls.size);

  // Step 2: List all blobs and find orphans
  const orphanUrls = [];
  let totalBlobs = 0;
  let totalOrphanBytes = 0;
  let listCursor = undefined;

  do {
    const result = await list({ cursor: listCursor, limit: 1000 });
    for (const blob of result.blobs) {
      totalBlobs++;
      if (!activeUrls.has(blob.url)) {
        orphanUrls.push(blob.url);
        totalOrphanBytes += blob.size;
      }
    }
    listCursor = result.hasMore ? result.cursor : undefined;
  } while (listCursor);

  console.log("Total blobs:", totalBlobs);
  console.log("Orphan blobs to delete:", orphanUrls.length);
  console.log("Space to free:", (totalOrphanBytes / 1024 / 1024).toFixed(2), "MB");

  if (process.argv.includes("--dry-run")) {
    console.log("\nDry run - not deleting. Remove --dry-run to actually delete.");
    return;
  }

  // Step 3: Delete orphans in batches of 100
  let deleted = 0;
  for (let i = 0; i < orphanUrls.length; i += 100) {
    const batch = orphanUrls.slice(i, i + 100);
    await del(batch);
    deleted += batch.length;
    console.log(`Deleted ${deleted}/${orphanUrls.length}`);
  }

  console.log("Done! Freed", (totalOrphanBytes / 1024 / 1024).toFixed(2), "MB");
}

run().catch(e => { console.error(e); process.exit(1); });
