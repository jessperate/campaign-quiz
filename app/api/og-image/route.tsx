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
  const shortName = (parsed.archetype?.shortName || "CHAMPION").toUpperCase();
  const mostLikelyTo = parsed.bullets?.mostLikelyTo || "";
  const typicallySpending = parsed.bullets?.typicallySpending || "";
  const favoritePhrase = parsed.bullets?.favoritePhrase || "";
  const headshotUrl = parsed.headshotUrl || "";

  const theme = parsed.theme || {};
  const images = parsed.images || {};
  const ogBgUrl = images.ogBg || "";
  const cardArtUrl = images.cardArt || null;
  const cardTitleUrl = images.cardTitle || null;

  const cardBg = theme.cardBg || "#002910";
  const artBg = theme.artBg || "#DFEAE3";
  const artBorder = theme.artBorder || "#008C44";
  const statsBg = theme.statsBg || "#F8FFFB";
  const statsBorder = theme.statsBorder || "#008C44";
  const labelColor = theme.labelColor || "#008C44";
  const cardBorder = theme.cardBorder || "#002910";
  const dotColor = theme.dotColor || "#008C44";
  const dotBorder = theme.dotBorder || "#F8FFFB";
  const headshotBorder = theme.headshotBorder || "#008C44";
  const headshotBg = theme.headshotBg || "#F8FFFB";
  const fallbackInitialColor = theme.fallbackInitialColor || "#002910";

  // ── Layout ──
  // OG canvas: 1200 × 630
  // Original ShareCard inner card: 641 × 926
  // Scale to fit ~590px height in the 630px canvas
  const CARD_H = 590;
  const CARD_W = Math.round(CARD_H * (641 / 926)); // ~408
  const CARD_X = Math.round((1200 - CARD_W) / 2);
  const CARD_Y = 12;
  const PAD = 10;

  // Stats section: 397px original → scaled
  const STATS_H = Math.round(397 * (CARD_H / 926)); // ~253

  // Headshot
  const HS = 148;
  // Name positioning (right of headshot)
  const NAME_X = Math.round(246 * (CARD_W / 641)); // ~156

  // Dynamic shortName font size for fallback (no artImage)
  const shortNameFontSize =
    shortName.length > 10
      ? 50
      : shortName.length > 8
        ? 60
        : shortName.length > 6
          ? 72
          : 87;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: cardBg,
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

        {/* ── Card ── */}
        <div
          style={{
            position: "absolute",
            left: CARD_X,
            top: CARD_Y,
            width: CARD_W,
            height: CARD_H,
            borderRadius: 10,
            border: `2px solid ${cardBorder}`,
            backgroundColor: cardBg,
            display: "flex",
            flexDirection: "column",
            padding: PAD,
            overflow: "hidden",
          }}
        >
          {/* ── Art section (top) ── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              flex: 1,
              backgroundColor: artBg,
              border: `1px solid ${artBorder}`,
              borderTopLeftRadius: 75,
              overflow: "hidden",
              display: "flex",
            }}
          >
            {/* Card art image OR fallback text */}
            {cardArtUrl ? (
              <img
                src={cardArtUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : null}

            {/* Title SVG overlay (on top of art image) */}
            {cardTitleUrl ? (
              <img
                src={cardTitleUrl}
                style={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  right: 8,
                  width: CARD_W - PAD * 2 - 16 - 2,
                  height: "auto",
                }}
              />
            ) : (
              /* Fallback: large archetype shortName text */
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  right: 8,
                  fontSize: shortNameFontSize,
                  fontWeight: 900,
                  color: "#0C0D01",
                  lineHeight: 0.85,
                }}
              >
                {shortName}
              </div>
            )}

            {/* Headshot circle */}
            <div
              style={{
                position: "absolute",
                left: -1,
                top: -1,
                width: HS,
                height: HS,
                borderRadius: "50%",
                border: `2px solid ${headshotBorder}`,
                overflow: "hidden",
                backgroundColor: headshotBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {headshotUrl ? (
                <img
                  src={headshotUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    fontSize: 50,
                    fontWeight: "bold",
                    color: fallbackInitialColor,
                    opacity: 0.3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>

            {/* Name + Company */}
            <div
              style={{
                position: "absolute",
                left: NAME_X,
                top: 16,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 400,
                  color: "#0C0D01",
                  lineHeight: 1,
                }}
              >
                {firstName}
              </div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#0C0D01",
                  lineHeight: 0.9,
                }}
              >
                {lastName}
              </div>
              {company && (
                <div
                  style={{
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "#0C0D01",
                    marginTop: 10,
                  }}
                >
                  Plays for {company}
                </div>
              )}
            </div>
          </div>

          {/* ── Stats section (bottom) ── */}
          <div
            style={{
              width: "100%",
              height: STATS_H,
              backgroundColor: statsBg,
              border: `1px solid ${statsBorder}`,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 3,
              flexShrink: 0,
            }}
          >
            {/* Most Likely To */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: labelColor,
                  letterSpacing: 1.5,
                  marginBottom: 3,
                }}
              >
                MOST LIKELY TO:
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: "#0C0D01",
                  lineHeight: 1.15,
                }}
              >
                {mostLikelyTo}
              </div>
            </div>

            {/* Typically Spending Time */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: labelColor,
                  letterSpacing: 1.5,
                  marginBottom: 3,
                }}
              >
                TYPICALLY SPENDING TIME:
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: "#0C0D01",
                  lineHeight: 1.15,
                }}
              >
                {typicallySpending}
              </div>
            </div>

            {/* Favorite Phrase */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: labelColor,
                  letterSpacing: 1.5,
                  marginBottom: 3,
                }}
              >
                FAVORITE PHRASE:
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#0C0D01",
                  lineHeight: 1.15,
                }}
              >
                {favoritePhrase}
              </div>
            </div>
          </div>
        </div>

        {/* Dot decoration (top-left corner of card) */}
        <div
          style={{
            position: "absolute",
            left: CARD_X + PAD + 1,
            top: CARD_Y + PAD + 1,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: dotColor,
            border: `1px solid ${dotBorder}`,
          }}
        />

        {/* Footer: airops + Win AI Search */}
        <div
          style={{
            position: "absolute",
            left: 40,
            bottom: 6,
            right: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: 1,
            }}
          >
            airops
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#FFFFFF",
              letterSpacing: 1,
            }}
          >
            Win AI Search.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
