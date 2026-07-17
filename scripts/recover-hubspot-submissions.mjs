import fs from "node:fs";
import Redis from "ioredis";
import { archetypes, getBullets } from "../lib/archetypes.ts";

const APPLY = process.argv.includes("--apply");
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

const summary = {
  mode: APPLY ? "apply" : "dry-run",
  inputRows: rows.slice(1).filter((row) => row.some(Boolean)).length,
  recoverableRecords: candidates.size,
  skipped,
  roleCounts,
  archetypeCounts,
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

  const ttlPipeline = redis.pipeline();
  for (const key of writtenKeys) ttlPipeline.ttl(key);
  const ttlResults = writtenKeys.length ? await ttlPipeline.exec() : [];
  const ttlValues = ttlResults.map(([error, ttl]) => {
    if (error) throw error;
    return ttl;
  });
  const expiringWrittenKeys = ttlValues.filter((ttl) => ttl >= 0).length;

  console.log(JSON.stringify({
    ...summary,
    written,
    preservedExisting,
    permanentWrittenKeys: written - expiringWrittenKeys,
    expiringWrittenKeys,
    redisDbSize: await redis.dbsize(),
  }, null, 2));
} finally {
  await redis.quit().catch(() => redis.disconnect());
}
