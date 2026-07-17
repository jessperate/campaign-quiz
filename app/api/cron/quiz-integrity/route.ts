import { NextRequest, NextResponse } from "next/server";
import { sendQuizAlert } from "@/lib/quiz-alerts";
import { runQuizIntegrityCheck } from "@/lib/quiz-integrity";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  const adminSecret = request.headers.get("x-admin-secret");
  return Boolean(
    (process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`) ||
      (process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET),
  );
}

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET && !process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Monitor secret is not configured." }, { status: 503 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await runQuizIntegrityCheck();
    if (!report.ok || process.env.INTEGRITY_NOTIFY_SUCCESS === "true") {
      await sendQuizAlert(
        report.ok ? "Quiz integrity check passed" : "Quiz integrity check needs attention",
        report,
      );
    }
    return NextResponse.json(report, { status: report.ok ? 200 : 503 });
  } catch (error) {
    const details = {
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    };
    await sendQuizAlert("Quiz integrity check failed", details).catch(() => undefined);
    return NextResponse.json({ ok: false, ...details }, { status: 500 });
  }
}
