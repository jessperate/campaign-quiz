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

    // Fire-and-forget Slack notification when stipple image is saved (card is ready)
    if (fieldName === "stippleImageUrl" && process.env.SLACK_WEBHOOK_URL) {
      const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://campaign-quiz.vercel.app";
      const name = [parsed.firstName, parsed.lastName].filter(Boolean).join(" ");
      const archetype = parsed.archetype?.name || "";
      const company = parsed.company || "";
      const shareUrl = `${baseUrl}/share?userId=${userId}`;
      const ogImageUrl = `${baseUrl}/api/og-image?userId=${userId}`;

      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${name}*${company ? ` from ${company}` : ""} just got their Marketype: *${archetype}*`,
              },
            },
            {
              type: "image",
              image_url: ogImageUrl,
              alt_text: `${name}'s Marketype card`,
            },
            {
              type: "actions",
              block_id: `moderation_${userId}`,
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "View Card" },
                  url: shareUrl,
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "Remove" },
                  style: "danger",
                  action_id: "remove_user",
                  value: userId,
                },
                {
                  type: "button",
                  text: { type: "plain_text", text: "Keep" },
                  action_id: "keep_user",
                  value: userId,
                },
              ],
            },
          ],
        }),
      }).catch((err) => console.error("Slack webhook error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving card URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
