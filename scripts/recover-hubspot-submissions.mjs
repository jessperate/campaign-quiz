import fs from "node:fs";
import Redis from "ioredis";
import { list } from "@vercel/blob";
import { archetypes, getBullets } from "../lib/archetypes.ts";

const APPLY = process.argv.includes("--apply");
const ATTACH_STIPPLES = process.argv.includes("--attach-stipples");
const csvPath = process.argv.find((arg) => arg.endsWith(".csv"));

if (!csvPath) {
  console.error("Usage: npm run redis:recover-hubspot -- /path/to/export.csv [--apply]");
  process.exit(1);
}

const excludedIds = new Set(
  (process.env.RECOVERY_EXCLUDED_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function inferRole(title) {
  const normalized = title.toLowerCase();
  if (/\b(chief|ceo|cmo|cro|coo|cto|cfo|founder|co-founder|owner|president|svp|evp|vice president|vp|partner)\b/.test(normalized)) {
    return "executive";
  }
  if (/\b(manager|director|head|lead|supervisor)\b/.test(normalized)) {
    return "manager";
  }
  return "ic";
}

function normalizeArchetype(value) {
  const id = value.trim().toLowerCase();
  return archetypes[id] ? id : null;
}

async function buildStippleMatches(records) {
  if (!ATTACH_STIPPLES) return { matches: new Map(), stats: null };

  const timeOffsetMs = Number(process.env.RECOVERY_TIME_OFFSET_MS);
  const maxDelayMs = Number(process.env.RECOVERY_STIPPLE_MAX_DELAY_MS || 30_000);
  if (!Number.isFinite(timeOffsetMs)) {
    throw new Error("RECOVERY_TIME_OFFSET_MS is required with --attach-stipples.");
  }

  const submissions = [...records.values()]
    .map((record) => ({
      userId: record.userId,
      timestamp: new Date(record.createdAt).getTime() + timeOffsetMs,
    }))
    .filter((record) => Number.isFinite(record.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp);

  const blobs = [];
  let cursor;
  do {
    const page = await list({ cursor, limit: 1_000 });
    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  const matches = new Map();
  let exactIdMatches = 0;
  let legacyCandidates = 0;

  for (const blob of blobs) {
    const exact = blob.pathname.match(
      /^cards\/stipple-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(\d{13})\.png$/i,
    );
    if (exact && records.has(exact[1])) {
      matches.set(exact[1], {
        url: blob.url,
        method: "blob-filename-user-id",
        deltaMs: 0,
      });
      exactIdMatches += 1;
      continue;
    }

    const legacy = blob.pathname.match(/^cards\/stipple-(\d{13})\.png$/);
    if (!legacy) continue;

    const uploadedAt = Number(legacy[1]);
    let low = 0;
    let high = submissions.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (submissions[middle].timestamp < uploadedAt) low = middle + 1;
      else high = middle;
    }

    const submission = submissions[low];
    if (!submission) continue;
    const deltaMs = submission.timestamp - uploadedAt;
    if (deltaMs < 0 || deltaMs > maxDelayMs) continue;

    legacyCandidates += 1;
    const existing = matches.get(submission.userId);
    if (!existing || (existing.method !== "blob-filename-user-id" && deltaMs < existing.deltaMs)) {
      matches.set(submission.userId, {
        url: blob.url,
        method: "hubspot-timestamp-match",
        deltaMs,
      });
    }
  }

  return {
    matches,
    stats: {
      blobCount: blobs.length,
      maxDelayMs,
      timeOffsetMs,
      legacyCandidates,
      exactIdMatches,
      uniqueMatches: matches.size,
    },
  };
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0] || [];
const column = (name) => headers.indexOf(name);
const indexes = {
  email: column("Email"),
  firstName: column("First name"),
  lastName: column("Last name"),
  company: column("Company name"),
  title: column("Title"),
  wantsDemo: column("I'd like to book a demo"),
  url: column("Brand Campaign - Quiz URL - 2026-Q1"),
  archetype: column("Brand Campaign - Archetype - 2026-Q1"),
  createdAt: column("Conversion Date"),
};

for (const [name, index] of Object.entries(indexes)) {
  if (index < 0) {
    console.error(`Missing required HubSpot export column: ${name}`);
    process.exit(1);
  }
}

const candidates = new Map();
const skipped = { missingId: 0, missingArchetype: 0, excluded: 0 };

for (const row of rows.slice(1)) {
  if (!row.some(Boolean)) continue;

  let userId = null;
  try {
    userId = new URL(row[indexes.url] || "").searchParams.get("userId");
  } catch {
    // Rows created by enrichment calls do not always contain a result URL.
  }

  if (!userId) {
    skipped.missingId += 1;
    continue;
  }
  if (excludedIds.has(userId)) {
    skipped.excluded += 1;
    continue;
  }

  const archetypeId = normalizeArchetype(row[indexes.archetype] || "");
  if (!archetypeId) {
    skipped.missingArchetype += 1;
    continue;
  }

  const title = (row[indexes.title] || "").trim();
  const role = inferRole(title);
  const archetype = archetypes[archetypeId];
  const roleContent = archetype.roleContent[role];
  const createdAtDate = new Date(row[indexes.createdAt] || "");
  const createdAt = Number.isNaN(createdAtDate.getTime())
    ? new Date(0).toISOString()
    : createdAtDate.toISOString();

  const record = {
    userId,
    role,
    firstName: (row[indexes.firstName] || "").trim(),
    lastName: (row[indexes.lastName] || "").trim(),
    title,
    company: (row[indexes.company] || "").trim(),
    email: (row[indexes.email] || "").trim(),
    linkedinUrl: "",
    wantsDemo: Boolean((row[indexes.wantsDemo] || "").trim()),
    headshotUrl: "",
    stippleImageUrl: "",
    archetype: {
      id: archetype.id,
      name: archetype.name,
      shortName: archetype.shortName,
      tagline: roleContent.tagline,
    },
    bullets: getBullets(archetype, role),
    winningPlay: roleContent.winningPlay,
    whereToFocus: roleContent.whereToFocus,
    resources: roleContent.resources,
    levelUpUrl: roleContent.levelUpUrl,
    createdAt,
    recovered: {
      source: "hubspot-form-export",
      recoveredAt: new Date().toISOString(),
      roleSource: "title-inference",
      imageSource: "archetype-fallback",
    },
  };

  const existing = candidates.get(userId);
  if (!existing || existing.createdAt < record.createdAt) {
    candidates.set(userId, record);
  }
}

const roleCounts = { ic: 0, manager: 0, executive: 0 };
const archetypeCounts = {};
for (const record of candidates.values()) {
  roleCounts[record.role] += 1;
  archetypeCounts[record.archetype.id] = (archetypeCounts[record.archetype.id] || 0) + 1;
}

const stippleRecovery = await buildStippleMatches(candidates);

const summary = {
  mode: APPLY ? "apply" : "dry-run",
  inputRows: rows.slice(1).filter((row) => row.some(Boolean)).length,
  recoverableRecords: candidates.size,
  skipped,
  roleCounts,
  archetypeCounts,
  stippleRecovery: stippleRecovery.stats,
};

if (!APPLY) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL is required with --apply.");
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 2,
  connectTimeout: 10_000,
});

let written = 0;
let preservedExisting = 0;
const writtenKeys = [];
let portraitsAttached = 0;
let portraitsPreserved = 0;
const portraitKeys = [];

try {
  const entries = [...candidates.entries()];
  const batchSize = 100;

  for (let offset = 0; offset < entries.length; offset += batchSize) {
    const batch = entries.slice(offset, offset + batchSize);
    const pipeline = redis.pipeline();
    for (const [userId, record] of batch) {
      pipeline.set(`quiz:${userId}`, JSON.stringify(record), "NX");
    }

    const results = await pipeline.exec();
    for (let index = 0; index < batch.length; index += 1) {
      const [error, result] = results[index];
      if (error) throw error;

      const key = `quiz:${batch[index][0]}`;
      if (result === "OK") {
        written += 1;
        writtenKeys.push(key);
      } else {
        preservedExisting += 1;
      }
    }
  }

  const portraitEntries = [...stippleRecovery.matches.entries()];
  for (let offset = 0; offset < portraitEntries.length; offset += batchSize) {
    const batch = portraitEntries.slice(offset, offset + batchSize);
    const readPipeline = redis.pipeline();
    for (const [userId] of batch) readPipeline.get(`quiz:${userId}`);
    const readResults = await readPipeline.exec();

    const writePipeline = redis.pipeline();
    const pendingKeys = [];
    for (let index = 0; index < batch.length; index += 1) {
      const [error, value] = readResults[index];
      if (error) throw error;
      if (!value) continue;

      const data = JSON.parse(value);
      if (data.stippleImageUrl) {
        portraitsPreserved += 1;
        continue;
      }

      const [userId, match] = batch[index];
      data.stippleImageUrl = match.url;
      data.recovered = {
        ...(data.recovered || {}),
        imageSource: match.method,
        imageMatchDeltaMs: match.deltaMs,
        imageMatchedAt: new Date().toISOString(),
      };
      const key = `quiz:${userId}`;
      writePipeline.set(key, JSON.stringify(data));
      pendingKeys.push(key);
    }

    if (pendingKeys.length) {
      const writeResults = await writePipeline.exec();
      for (const [error] of writeResults) {
        if (error) throw error;
      }
      portraitsAttached += pendingKeys.length;
      portraitKeys.push(...pendingKeys);
    }
  }

  const ttlPipeline = redis.pipeline();
  const auditedKeys = [...new Set([...writtenKeys, ...portraitKeys])];
  for (const key of auditedKeys) ttlPipeline.ttl(key);
  const ttlResults = auditedKeys.length ? await ttlPipeline.exec() : [];
  const ttlValues = ttlResults.map(([error, ttl]) => {
    if (error) throw error;
    return ttl;
  });
  const expiringWrittenKeys = ttlValues.filter((ttl) => ttl >= 0).length;

  console.log(JSON.stringify({
    ...summary,
    written,
    preservedExisting,
    portraitsAttached,
    portraitsPreserved,
    permanentChangedKeys: auditedKeys.length - expiringWrittenKeys,
    expiringWrittenKeys,
    redisDbSize: await redis.dbsize(),
  }, null, 2));
} finally {
  await redis.quit().catch(() => redis.disconnect());
}
