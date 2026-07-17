import crypto from "node:crypto";
import { put } from "@vercel/blob";
import type { QuizRecord } from "@/lib/quiz-store";

export type ArchiveEnvelope = {
  version: 1;
  algorithm: "aes-256-gcm";
  iv: string;
  authTag: string;
  ciphertext: string;
};

function getArchiveSecret(): string | null {
  return process.env.QUIZ_ARCHIVE_SECRET || process.env.SLACK_SIGNING_SECRET || null;
}

export function encryptQuizRecord(record: QuizRecord, secret: string): ArchiveEnvelope {
  const key = crypto.createHash("sha256").update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(record));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    version: 1,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptQuizRecord(envelope: ArchiveEnvelope, secret: string): QuizRecord {
  const key = crypto.createHash("sha256").update(secret).digest();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(envelope.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as QuizRecord;
}

export async function archiveQuizRecord(record: QuizRecord) {
  const secret = getArchiveSecret();
  if (!secret) {
    return { status: "disabled" as const, reason: "missing-archive-secret" };
  }

  const envelope = encryptQuizRecord(record, secret);

  const createdAt = typeof record.createdAt === "string" ? new Date(record.createdAt) : new Date();
  const date = Number.isNaN(createdAt.getTime()) ? new Date() : createdAt;
  const folder = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  const pathname = `quiz-archive/v1/${folder}/${record.userId}.json.enc`;
  const blob = await put(pathname, JSON.stringify(envelope), {
    access: "public",
    contentType: "application/octet-stream",
    addRandomSuffix: false,
    allowOverwrite: false,
  });

  return { status: "complete" as const, pathname: blob.pathname, url: blob.url };
}
