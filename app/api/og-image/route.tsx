import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const baseUrl = request.nextUrl.origin;
  const res = await fetch(`${baseUrl}/api/get-results?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) {
    return new Response("User not found", { status: 404 });
  }

  const parsed = await res.json();
  if (!parsed.success) {
    return new Response("User not found", { status: 404 });
  }

  const firstName = parsed.firstName || "";
  const lastName = parsed.lastName || "";
  const company = parsed.company || "";
  const archetypeName = parsed.archetype?.name || "";
  const tagline = parsed.archetype?.tagline || "";
  const mostLikelyTo = parsed.bullets?.mostLikelyTo || "";
  const typicallySpending = parsed.bullets?.typicallySpending || "";
  const favoritePhrase = parsed.bullets?.favoritePhrase || "";

  // Use archetype-specific theme colors and OG background
  const theme = parsed.theme || {};
  const ogBgUrl = parsed.images?.ogBg || "";
  const cardBg = theme.cardBg || "#002910";
  const accentColor = theme.labelColor || "#4ADE80";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: cardBg,
          position: "relative",
        }}
      >
        {/* OG background image */}
        {ogBgUrl && (
          <img
            src={ogBgUrl}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Content overlay */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
          }}
        >
          {/* Left panel */}
          <div
            style={{
              width: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "50px",
              backgroundColor: `${cardBg}CC`,
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50px",
                border: `3px solid ${accentColor}`,
                backgroundColor: `${cardBg}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "42px",
                color: accentColor,
                marginBottom: "24px",
              }}
            >
              {firstName ? firstName[0].toUpperCase() : "?"}
            </div>
            <div style={{ fontSize: "38px", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
              {firstName}
            </div>
            <div
              style={{
                fontSize: "38px",
                fontWeight: 700,
                color: accentColor,
                lineHeight: 1.1,
                marginBottom: "12px",
              }}
            >
              {lastName}
            </div>
            <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)" }}>{company}</div>
          </div>

          {/* Right panel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "50px",
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: accentColor,
                letterSpacing: "3px",
                marginBottom: "8px",
              }}
            >
              CONTENT ENGINEER ARCHETYPE
            </div>
            <div
              style={{
                fontSize: "46px",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.1,
                marginBottom: "6px",
              }}
            >
              {`The ${archetypeName}`}
            </div>
            <div
              style={{
                fontSize: "17px",
                color: "rgba(255,255,255,0.75)",
                fontStyle: "italic",
                marginBottom: "30px",
              }}
            >
              {`"${tagline}"`}
            </div>

            {/* Stat 1 */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: accentColor, letterSpacing: "2px", marginBottom: "3px" }}>
                MOST LIKELY TO
              </div>
              <div style={{ fontSize: "15px", color: "white" }}>{mostLikelyTo}</div>
            </div>

            {/* Stat 2 */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: accentColor, letterSpacing: "2px", marginBottom: "3px" }}>
                TYPICALLY SPENDING TIME
              </div>
              <div style={{ fontSize: "15px", color: "white" }}>{typicallySpending}</div>
            </div>

            {/* Stat 3 */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: accentColor, letterSpacing: "2px", marginBottom: "3px" }}>
                FAVORITE PHRASE
              </div>
              <div style={{ fontSize: "15px", color: "white", fontStyle: "italic" }}>
                {favoritePhrase}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
              }}
            >
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>airops</div>
              <div style={{ fontSize: "12px", color: `${accentColor}99` }}>Win AI Search.</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
