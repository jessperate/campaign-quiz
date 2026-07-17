import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { decryptQuizRecord, encryptQuizRecord } from "../lib/quiz-archive.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("moderation routes use reversible deletion", () => {
  for (const file of ["app/api/admin/remove-user/route.ts", "app/api/admin/slack-action/route.ts"]) {
    const source = read(file);
    assert.doesNotMatch(source, /\.del\s*\(/);
    assert.match(source, /softDeleteQuizRecord/);
  }
});

test("quiz writes do not set expiration options", () => {
  const files = [
    "lib/quiz-store.ts",
    "app/api/submit-quiz/route.ts",
    "app/api/save-card-url/route.ts",
    "app/api/enrich-linkedin/route.ts",
  ];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /\bsetex\b|\.expire\s*\(|\bEX\s*:/i);
  }
  assert.match(read("lib/quiz-store.ts"), /redis\.call\('SET', KEYS\[1\], encoded\)/);
});

test("daily integrity cron is configured and authenticated", () => {
  const config = JSON.parse(read("vercel.json"));
  assert.deepEqual(config.crons, [
    { path: "/api/cron/quiz-integrity", schedule: "0 13 * * *" },
  ]);
  const route = read("app/api/cron/quiz-integrity/route.ts");
  assert.match(route, /Bearer \$\{process\.env\.CRON_SECRET\}/);
  assert.match(route, /runQuizIntegrityCheck/);
});

test("new submissions create encrypted archive copies", () => {
  const submit = read("app/api/submit-quiz/route.ts");
  const archive = read("lib/quiz-archive.ts");
  assert.match(submit, /archiveQuizRecord/);
  assert.match(archive, /aes-256-gcm/);
  assert.match(archive, /allowOverwrite: false/);
  assert.match(archive, /put\(pathname, JSON\.stringify\(envelope\)/);
  assert.doesNotMatch(archive, /put\(pathname, JSON\.stringify\(record\)/);

  const record = { userId: "test-id", email: "sensitive@example.com" };
  const envelope = encryptQuizRecord(record, "test-secret");
  assert.doesNotMatch(JSON.stringify(envelope), /sensitive@example\.com/);
  assert.deepEqual(decryptQuizRecord(envelope, "test-secret"), record);
});
