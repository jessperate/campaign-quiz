import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";
import { put } from "@vercel/blob";
import { enrichLinkedInProfile } from "@/lib/phantombuster";
import crypto from "crypto";

// Allow up to 60s for PhantomBuster to complete
export const maxDuration = 60;

const redis = new Redis(process.env.REDIS_URL!);
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
    const { userId, linkedinUrl } = await request.json();

    if (!userId || !linkedinUrl) {
      return NextResponse.json(
        { success: false, error: "userId and linkedinUrl are required." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Fetch existing data from Redis
    const existing = await redis.get(`quiz:${userId}`);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const data = JSON.parse(existing);

    // If already enriched, verify the headshot blob is still accessible
    if (data.firstName && data.headshotUrl && data.enriched) {
      let headshotValid = false;
      try {
        const headCheck = await fetch(data.headshotUrl, { method: 'HEAD' });
        headshotValid = headCheck.ok;
      } catch {
        // Network error - treat as invalid
      }

      if (headshotValid) {
        return NextResponse.json(
          { success: true, alreadyEnriched: true, ...data },
          { headers: CORS_HEADERS }
        );
      }

      // Headshot blob is gone - try to re-download from LinkedIn CDN URL
      console.warn('Headshot blob returned 404, re-downloading from LinkedIn CDN');
      const linkedinImageUrl = data.linkedinProfileImageUrl || "";
      if (linkedinImageUrl) {
        try {
          const imageResponse = await fetch(linkedinImageUrl);
          if (imageResponse.ok) {
            const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
            const imageBuffer = await imageResponse.arrayBuffer();
            const blob = await put(
              `headshots/${crypto.randomUUID()}.jpg`,
              Buffer.from(imageBuffer),
              { access: "public", contentType }
            );
            data.headshotUrl = blob.url;
            await redis.set(`quiz:${userId}`, JSON.stringify(data), "EX", TTL_SECONDS);
            console.log('Re-uploaded headshot to blob:', blob.url);
            return NextResponse.json(
              { success: true, alreadyEnriched: true, ...data },
              { headers: CORS_HEADERS }
            );
          }
        } catch (err) {
          console.warn('Failed to re-download LinkedIn image:', err);
        }
      }
      // Fall through to full re-enrichment — clear stale headshot URL
      console.warn('LinkedIn CDN URL also failed, running full re-enrichment');
      data.headshotUrl = "";
      data.enriched = false;
    }

    // Call PhantomBuster
    const profile = await enrichLinkedInProfile(linkedinUrl);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Enrichment failed." },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    // Download and store the LinkedIn profile image in Vercel Blob
    let storedHeadshotUrl = data.headshotUrl || "";
    if (profile.profileImageUrl && !storedHeadshotUrl) {
      try {
        const imageResponse = await fetch(profile.profileImageUrl);
        if (imageResponse.ok) {
          const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
          const imageBuffer = await imageResponse.arrayBuffer();
          const blob = await put(
            `headshots/${crypto.randomUUID()}.jpg`,
            Buffer.from(imageBuffer),
            { access: "public", contentType }
          );
          storedHeadshotUrl = blob.url;
        }
      } catch (err) {
        console.warn("Failed to store LinkedIn profile image:", err);
      }
    }

    // Update Redis with enriched data (store LinkedIn CDN URL as fallback)
    const updatedData = {
      ...data,
      firstName: profile.firstName || data.firstName || "",
      lastName: profile.lastName || data.lastName || "",
      company: profile.company || data.company || "",
      headshotUrl: storedHeadshotUrl,
      linkedinProfileImageUrl: profile.profileImageUrl || data.linkedinProfileImageUrl || "",
      enriched: true,
    };

    await redis.set(`quiz:${userId}`, JSON.stringify(updatedData), "EX", TTL_SECONDS);

    // Also update HubSpot with enriched data
    const hubspotPayload = {
      fields: [
        { name: "email", value: updatedData.email },
        { name: "firstname", value: updatedData.firstName },
        { name: "lastname", value: updatedData.lastName },
        { name: "company", value: updatedData.company },
      ],
    };

    fetch(
      "https://api.hsforms.com/submissions/v3/integration/submit/21510907/27d5f6c4-b911-425f-a401-0bec3e534006",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hubspotPayload),
      }
    ).catch((err) => console.error("HubSpot update failed:", err));

    return NextResponse.json(
      { success: true, ...updatedData },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error in enrich-linkedin:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
