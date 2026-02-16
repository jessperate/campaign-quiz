import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, cardUrl, field } = await request.json();

    if (!userId || !cardUrl) {
      return NextResponse.json({ error: "Missing userId or cardUrl" }, { status: 400 });
    }

    // Read existing data, add cardUrl, write back with same TTL
    const existing = await redis.get(`quiz:${userId}`);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const parsed = typeof existing === "string" ? JSON.parse(existing) : existing;
    // Use custom field name if provided, otherwise default to cardUrl
    const fieldName = field || "cardUrl";
    parsed[fieldName] = cardUrl;

    // Get remaining TTL and preserve it
    const ttl = await redis.ttl(`quiz:${userId}`);
    if (ttl > 0) {
      await redis.set(`quiz:${userId}`, JSON.stringify(parsed), "EX", ttl);
    } else {
      await redis.set(`quiz:${userId}`, JSON.stringify(parsed));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving card URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
