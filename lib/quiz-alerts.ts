export async function sendQuizAlert(title: string, details: Record<string, unknown>) {
  const webhookUrl = process.env.INTEGRITY_SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, reason: "missing-webhook" };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${title}\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``,
    }),
  });

  if (!response.ok) {
    throw new Error(`Slack alert failed with ${response.status}.`);
  }
  return { sent: true };
}
