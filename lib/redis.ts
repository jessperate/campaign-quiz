import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { quizRedis?: Redis };

export function getRedis(): Redis {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured.");
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.REDIS_REQUIRE_TLS === "true" &&
    !process.env.REDIS_URL.startsWith("rediss://")
  ) {
    throw new Error("REDIS_REQUIRE_TLS is enabled, but REDIS_URL is not using rediss://.");
  }

  if (!globalForRedis.quizRedis) {
    globalForRedis.quizRedis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
    });
  }

  return globalForRedis.quizRedis;
}
