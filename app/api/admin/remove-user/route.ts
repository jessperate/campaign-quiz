import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function DELETE(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const deleted = await redis.del(`quiz:${userId}`);

  return NextResponse.json({
    success: true,
    deleted: deleted > 0,
    message: deleted > 0 ? `Removed quiz:${userId}` : `No record found for ${userId}`,
  });
}
