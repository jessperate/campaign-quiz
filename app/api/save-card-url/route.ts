import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const { userId, cardUrl, field } = await request.json();

    if (!userId || !cardUrl) {
      return NextResponse.json({ error: "Missing userId or cardUrl" }, { status: 400 });
    }

    // Read existing data, add cardUrl, and keep the result indefinitely.
    const existing = await redis.get(`quiz:${userId}`);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const parsed = typeof existing === "string" ? JSON.parse(existing) : existing;
    // Use custom field name if provided, otherwise default to cardUrl
    const fieldName = field || "cardUrl";
    parsed[fieldName] = cardUrl;

    await redis.set(`quiz:${userId}`, JSON.stringify(parsed));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving card URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
