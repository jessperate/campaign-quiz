const Redis = require("ioredis");

async function run() {
  const redis = new Redis(process.env.REDIS_URL);
  const pong = await redis.ping();
  console.log("Connected:", pong);

  let cursor = "0";
  const urls = new Set();
  let userCount = 0;

  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", "quiz:*", "COUNT", 100);
    cursor = next;
    for (const key of keys) {
      userCount++;
      const val = await redis.get(key);
      if (!val) continue;
      const d = JSON.parse(val);
      if (d.headshotUrl && d.headshotUrl.includes("blob.vercel")) urls.add(d.headshotUrl);
      if (d.stippleImageUrl && d.stippleImageUrl.includes("blob.vercel")) urls.add(d.stippleImageUrl);
      if (d.ogImageUrl && d.ogImageUrl.includes("blob.vercel")) urls.add(d.ogImageUrl);
      if (d.cardImageUrl && d.cardImageUrl.includes("blob.vercel")) urls.add(d.cardImageUrl);
    }
  } while (cursor !== "0");

  console.log("Total users in Redis:", userCount);
  console.log("Active blob URLs referenced:", urls.size);

  // Print all active URLs
  for (const u of urls) {
    console.log("ACTIVE:", u);
  }

  redis.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
