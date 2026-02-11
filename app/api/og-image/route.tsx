import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Cache font ArrayBuffers after first load
let fontCache: { serrif: ArrayBuffer; saans: ArrayBuffer; saansMono: ArrayBuffer } | null = null;

async function loadFonts(baseUrl: string) {
  if (fontCache) return fontCache;
  const cdnBase = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : baseUrl;
  const [serrif, saans, saansMono] = await Promise.all([
    fetch(`${cdnBase}/fonts/Serrif-Regular.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${cdnBase}/fonts/Saans-Regular.woff`).then((r) => r.arrayBuffer()),
    fetch(`${cdnBase}/fonts/SaansMono-Medium.otf`).then((r) => r.arrayBuffer()),
  ]);
  fontCache = { serrif, saans, saansMono };
  return fontCache;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return new Response("Missing userId", { status: 400 });
    }

    const baseUrl = request.nextUrl.origin;

    // Load fonts (cached after first request) + results data in parallel
    let fonts;
    try {
      fonts = await loadFonts(baseUrl);
    } catch (fontErr) {
      console.error("Font loading failed:", String(fontErr));
      return new Response(`Font loading error: ${String(fontErr)}`, { status: 500 });
    }
    const { serrif: serrifFont, saans: saansFont, saansMono: saansMonoFont } = fonts;

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

    // Prefer stipple portrait over original headshot
    const headshotUrl = parsed.stippleImageUrl || parsed.headshotUrl || "";

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
    const CARD_Y = Math.round((630 - CARD_H) / 2);
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

    console.log(`OG render: fonts loaded (serrif=${serrifFont.byteLength}, saans=${saansFont.byteLength}, mono=${saansMonoFont.byteLength}), user=${firstName} ${lastName}, archetype=${parsed.archetype?.id}, stipple=${!!parsed.stippleImageUrl}`);

    try {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            backgroundColor: cardBg,
            fontFamily: "Saans",
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
                  <img
                    src={`${baseUrl}/images/smiley-fallback.svg`}
                    width={HS}
                    height={HS}
                    style={{
                      width: HS,
                      height: HS,
                      backgroundColor: headshotBg,
                    }}
                  />
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
                  fontFamily: "Serrif",
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
                    fontFamily: "SaansMono",
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
                    fontFamily: "Serrif",
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
                    fontFamily: "SaansMono",
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
                    fontFamily: "Serrif",
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
                    fontFamily: "SaansMono",
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
                    fontFamily: "Serrif",
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

        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Serrif", data: serrifFont, style: "normal" as const, weight: 400 as const },
          { name: "Serrif", data: serrifFont, style: "italic" as const, weight: 400 as const },
          { name: "Saans", data: saansFont, style: "normal" as const, weight: 400 as const },
          { name: "SaansMono", data: saansMonoFont, style: "normal" as const, weight: 500 as const },
        ],
      }
    );
    } catch (renderErr) {
      console.error("ImageResponse render error:", renderErr);
      return new Response(`Render error: ${String(renderErr)}`, { status: 500 });
    }
  } catch (err) {
    console.error("OG image generation error:", err);
    return new Response(`OG image error: ${String(err)}`, { status: 500 });
  }
}
