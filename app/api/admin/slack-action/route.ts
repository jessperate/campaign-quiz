import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redis } from "@/lib/redis";

function verifySlackSignature(request: NextRequest, body: string): boolean {
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) return false;

  const timestamp = request.headers.get("x-slack-request-timestamp") || "";
  const slackSig = request.headers.get("x-slack-signature") || "";

  // Reject requests older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const baseString = `v0:${timestamp}:${body}`;
  const hmac = crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex");
  const computedSig = `v0=${hmac}`;

  return crypto.timingSafeEqual(Buffer.from(computedSig), Buffer.from(slackSig));
}

export async function POST(request: NextRequest) {
  const body = await request.text();

  if (!verifySlackSignature(request, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const params = new URLSearchParams(body);
  const payload = JSON.parse(params.get("payload") || "{}");

  const action = payload.actions?.[0];
  if (!action) {
    return NextResponse.json({ error: "No action" }, { status: 400 });
  }

  const userId = action.value;
  const actionId = action.action_id;
  const responseUrl = payload.response_url;
  const userName = payload.user?.name || "Someone";

  if (actionId === "remove_user") {
    // Delete from Redis
    const deleted = await redis.del(`quiz:${userId}`);

    // Update the Slack message to show it was removed
    if (responseUrl) {
      const originalBlocks = payload.message?.blocks || [];
      // Keep the info and image blocks, replace the actions block
      const updatedBlocks = originalBlocks
        .filter((b: { type: string }) => b.type !== "actions")
        .concat([
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: deleted > 0
                  ? `:no_entry: *This submission has been removed from the site* — by ${userName}`
                  : `:warning: Record already removed — ${userName}`,
              },
            ],
          },
        ]);

      fetch(responseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace_original: true, blocks: updatedBlocks }),
      }).catch((err) => console.error("Slack response_url error:", err));
    }
  } else if (actionId === "keep_user") {
    // Update the Slack message to show it was approved
    if (responseUrl) {
      const originalBlocks = payload.message?.blocks || [];
      const updatedBlocks = originalBlocks
        .filter((b: { type: string }) => b.type !== "actions")
        .concat([
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `:white_check_mark: *Approved* by ${userName}`,
              },
            ],
          },
        ]);

      fetch(responseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace_original: true, blocks: updatedBlocks }),
      }).catch((err) => console.error("Slack response_url error:", err));
    }
  }

  // Slack expects a 200 within 3 seconds
  return new NextResponse(null, { status: 200 });
}
