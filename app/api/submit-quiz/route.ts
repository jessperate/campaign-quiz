import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { put } from "@vercel/blob";
import { calculateArchetype, type Role } from "@/lib/quiz-data";
import { archetypes, getBullets } from "@/lib/archetypes";
import crypto from "crypto";

const redis = new Redis(process.env.REDIS_URL!);

const VALID_ROLES = new Set<Role>(["ic", "manager", "executive"]);
const VALID_ANSWERS = new Set(["a", "b", "c", "d", "e"]);
const REQUIRED_ANSWER_COUNT = 6;
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { firstName, lastName, company, title } = body;
    const { role, answers, email, headshotUrl, stippleImageUrl, linkedinUrl, wantsDemo } = body;

    // Validate role
    if (!role || !VALID_ROLES.has(role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${[...VALID_ROLES].join(", ")}` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length !== REQUIRED_ANSWER_COUNT) {
      return NextResponse.json(
        { success: false, error: `Exactly ${REQUIRED_ANSWER_COUNT} answers are required.` },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    for (const ans of answers) {
      if (!ans.question || typeof ans.question !== "number" || ans.question < 1 || ans.question > 6) {
        return NextResponse.json(
          { success: false, error: "Each answer must have a question number between 1 and 6." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      if (!ans.answer || !VALID_ANSWERS.has(ans.answer)) {
        return NextResponse.json(
          { success: false, error: `Invalid answer "${ans.answer}". Must be one of: a, b, c, d, e.` },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    // Validate required user fields
    // When linkedinUrl is provided, name fields are optional (enrichment will fill them)
    if (!linkedinUrl) {
      if (!firstName || typeof firstName !== "string") {
        return NextResponse.json(
          { success: false, error: "firstName is required." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      if (!lastName || typeof lastName !== "string") {
        return NextResponse.json(
          { success: false, error: "lastName is required." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "email is required." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // If headshotUrl provided, download and upload to Vercel Blob for reliable storage
    let storedHeadshotUrl = "";
    if (headshotUrl && typeof headshotUrl === "string") {
      console.log(`Processing headshot URL: ${headshotUrl.substring(0, 100)}...`);
      try {
        const imageResponse = await fetch(headshotUrl);
        if (imageResponse.ok) {
          const contentType = (imageResponse.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
          const imageBuffer = await imageResponse.arrayBuffer();
          console.log(`Downloaded headshot: ${contentType}, ${imageBuffer.byteLength} bytes`);
          const blob = await put(`headshots/${crypto.randomUUID()}.jpg`, Buffer.from(imageBuffer), {
            access: "public",
            contentType,
          });
          storedHeadshotUrl = blob.url;
          console.log(`Stored headshot: ${storedHeadshotUrl}`);
        } else {
          console.warn(`Failed to download headshot from ${headshotUrl}: ${imageResponse.status}`);
        }
      } catch (err) {
        console.warn("Failed to download/store headshot:", err);
      }
    } else {
      console.log(`No headshot URL provided`);
    }

    // LinkedIn enrichment is handled by the results page (/api/enrich-linkedin)
    // to avoid blocking the quiz submission for 30-60s.

    // Transform answers: { q1: role, q2: "a", q3: "b", ... }
    const answerMap: Record<string, string> = { q1: role };
    for (const ans of answers) {
      answerMap[`q${ans.question + 1}`] = ans.answer;
    }

    // Calculate archetype
    const archetypeId = calculateArchetype(answerMap, role as Role);
    const archetype = archetypes[archetypeId];
    const bullets = getBullets(archetype, role as Role);

    // Generate userId
    const userId = crypto.randomUUID();

    // Build stored data
    const roleContent = archetype.roleContent[role as Role];
    const storedData = {
      userId,
      role,
      firstName,
      lastName,
      title: title || "",
      company: company || "",
      email,
      linkedinUrl: linkedinUrl || "",
      wantsDemo: !!wantsDemo,
      headshotUrl: storedHeadshotUrl,
      stippleImageUrl: stippleImageUrl || "",
      archetype: {
        id: archetype.id,
        name: archetype.name,
        shortName: archetype.shortName,
        tagline: roleContent.tagline,
      },
      bullets,
      winningPlay: roleContent.winningPlay,
      whereToFocus: roleContent.whereToFocus,
      resources: roleContent.resources,
      levelUpUrl: roleContent.levelUpUrl,
      createdAt: new Date().toISOString(),
    };

    // Store in Redis with 30-day TTL
    await redis.set(`quiz:${userId}`, JSON.stringify(storedData), "EX", TTL_SECONDS);

    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://campaign-quiz.vercel.app";
    const shareBaseUrl = process.env.NEXT_PUBLIC_SHARE_BASE_URL || baseUrl;

    // Fire-and-forget: submit to HubSpot form
    const hubspotFields = [
      { name: "email", value: email },
      { name: "firstname", value: firstName || "" },
      { name: "lastname", value: lastName || "" },
      { name: "company", value: company || "" },
      { name: "title", value: title || "" },
    ];
    if (linkedinUrl) {
      hubspotFields.push({ name: "linkedin_profile_link", value: linkedinUrl });
    }
    if (wantsDemo) {
      hubspotFields.push({ name: "yes_to_book_a_demo", value: "true" });
    }
    hubspotFields.push({
      name: "brand_campaign__quiz_url__2026q1",
      value: `${baseUrl}/share?userId=${userId}`,
    });
    hubspotFields.push({
      name: "brand_campaign__archetype__2026q1",
      value: archetype.name,
    });
    const hubspotPayload = { fields: hubspotFields };

    fetch(
      "https://api.hsforms.com/submissions/v3/integration/submit/21510907/27d5f6c4-b911-425f-a401-0bec3e534006",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hubspotPayload),
      }
    ).catch((err) => console.error("HubSpot submission failed:", err));

    return NextResponse.json(
      {
        success: true,
        userId,
        resultsUrl: `${baseUrl}/api/get-results?userId=${userId}`,
        firstName: firstName || "",
        lastName: lastName || "",
        title: title || "",
        company: company || "",
        linkedinUrl: linkedinUrl || "",
        headshotUrl: storedHeadshotUrl,
        archetype: {
          id: archetype.id,
          name: archetype.name,
          shortName: archetype.shortName,
          tagline: roleContent.tagline,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in submit-quiz:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
