import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    const baseUrl = request.nextUrl.origin;
    const res = await fetch(
      `${baseUrl}/api/get-results?userId=${encodeURIComponent(userId)}`
    );
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
    const shortName = (
      parsed.archetype?.shortName || "CHAMPION"
    ).toUpperCase();
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

    // ── Layout constants (all explicit pixels for Satori) ──
    const CARD_W = 408;
    const CARD_H = 590;
    const CARD_X = Math.round((1200 - CARD_W) / 2);
    const CARD_Y = 12;
    const PAD = 10;
    const INNER_W = CARD_W - PAD * 2; // 388
    const STATS_H = 253;
    const ART_H = CARD_H - PAD * 2 - STATS_H - 3; // 314
    const HS = 148;
    const NAME_X = 156;

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
            width: 1200,
            height: 630,
            display: "flex",
            backgroundColor: cardBg,
          }}
        >
          {/* OG background image */}
          {ogBgUrl ? (
            <img
              src={ogBgUrl}
              width={1200}
              height={630}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 1200,
                height: 630,
              }}
            />
          ) : null}

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
            }}
          >
            {/* ── Art section (top) ── */}
            <div
              style={{
                width: INNER_W,
                height: ART_H,
                backgroundColor: artBg,
                border: `1px solid ${artBorder}`,
                borderRadius: "75px 0px 0px 0px",
                display: "flex",
                position: "relative",
              }}
            >
              {/* Card art image */}
              {cardArtUrl ? (
                <img
                  src={cardArtUrl}
                  width={INNER_W}
                  height={ART_H}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: INNER_W,
                    height: ART_H,
                  }}
                />
              ) : null}

              {/* Title overlay or fallback text */}
              {cardTitleUrl ? (
                <img
                  src={cardTitleUrl}
                  width={INNER_W - 16}
                  height={60}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    width: INNER_W - 16,
                    height: 60,
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 8,
                    fontSize: shortNameFontSize,
                    fontWeight: 900,
                    color: "#0C0D01",
                    lineHeight: 1,
                    display: "flex",
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
                  borderRadius: 74,
                  border: `2px solid ${headshotBorder}`,
                  backgroundColor: headshotBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {headshotUrl ? (
                  <img
                    src={headshotUrl}
                    width={HS}
                    height={HS}
                    style={{
                      width: HS,
                      height: HS,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: 50,
                      fontWeight: 700,
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
                    display: "flex",
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
                    lineHeight: 1,
                    display: "flex",
                  }}
                >
                  {lastName}
                </div>
                {company ? (
                  <div
                    style={{
                      fontSize: 13,
                      fontStyle: "italic",
                      color: "#0C0D01",
                      marginTop: 10,
                      display: "flex",
                    }}
                  >
                    Plays for {company}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ── Stats section (bottom) ── */}
            <div
              style={{
                width: INNER_W,
                height: STATS_H,
                backgroundColor: statsBg,
                border: `1px solid ${statsBorder}`,
                padding: 10,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                marginTop: 3,
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
                    display: "flex",
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
                    display: "flex",
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
                    display: "flex",
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
                    display: "flex",
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
                    display: "flex",
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
                    display: "flex",
                  }}
                >
                  {favoritePhrase}
                </div>
              </div>
            </div>
          </div>

          {/* Dot decoration */}
          <div
            style={{
              position: "absolute",
              left: CARD_X + PAD + 1,
              top: CARD_Y + PAD + 1,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: dotColor,
              border: `1px solid ${dotBorder}`,
              display: "flex",
            }}
          />

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              left: 40,
              bottom: 6,
              width: 1120,
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
                display: "flex",
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
                display: "flex",
              }}
            >
              Win AI Search.
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("OG image generation error:", err);
    return new Response(`OG image error: ${String(err)}`, { status: 500 });
  }
}
