import { NextRequest, NextResponse } from "next/server";
import { restoreQuizRecord, softDeleteQuizRecord } from "@/lib/quiz-store";

function isAuthorized(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  return Boolean(secret && process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET);
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const removed = await softDeleteQuizRecord(userId, "admin-api");

  return NextResponse.json({
    success: true,
    removed,
    reversible: true,
    message: removed ? `Hidden quiz:${userId}` : `No record found for ${userId}`,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const restored = await restoreQuizRecord(userId, "admin-api");
  return NextResponse.json({ success: true, restored });
}
