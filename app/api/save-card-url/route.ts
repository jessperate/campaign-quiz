import { NextRequest, NextResponse } from "next/server";
import { updateQuizRecord } from "@/lib/quiz-store";

const ALLOWED_CARD_FIELDS = new Set([
  "cardUrl",
  "cardImageUrl",
  "stippleImageUrl",
  "ogImageUrl",
]);

export async function POST(request: NextRequest) {
  try {
    const { userId, cardUrl, field } = await request.json();

    if (!userId || !cardUrl) {
      return NextResponse.json({ error: "Missing userId or cardUrl" }, { status: 400 });
    }

    // Use custom field name if provided, otherwise default to cardUrl
    const fieldName = field || "cardUrl";
    if (!ALLOWED_CARD_FIELDS.has(fieldName)) {
      return NextResponse.json({ error: "Unsupported card field" }, { status: 400 });
    }

    // The Lua-backed merge is atomic and SET removes any accidental TTL.
    const updated = await updateQuizRecord(userId, { [fieldName]: cardUrl });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving card URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
