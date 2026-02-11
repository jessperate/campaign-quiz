"use client";

import { forwardRef } from "react";
import type { ArchetypeId } from "@/lib/quiz-data";
import { getCardTheme, type CardTheme } from "@/lib/card-themes";

interface ShareCardProps {
  firstName: string;
  lastName: string;
  company: string;
  archetypeName: string;
  shortName: string;
  archetypeId?: ArchetypeId;
  headshotUrl?: string;
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
  transparent?: boolean;
  bgImageOverride?: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  (
    {
      firstName,
      lastName,
      company,
      archetypeName,
      shortName,
      archetypeId,
      headshotUrl,
      mostLikelyTo,
      typicallySpending,
      favoritePhrase,
      transparent,
      bgImageOverride,
    },
    ref
  ) => {
    const theme = getCardTheme(archetypeId || "");
    const bgImage = bgImageOverride || theme.bgImage;

    // Dynamic font size for archetype name to fill width
    const getArchetypeFontSize = () => {
      if (shortName.length > 10) return "80px";
      if (shortName.length > 8) return "95px";
      if (shortName.length > 6) return "115px";
      return "140px";
    };

    const renderPattern = () => {
      if (theme.pattern === "stars") {
        return (
          <svg
            width="600"
            height="500"
            viewBox="0 0 600 500"
            fill="none"
            style={{
              position: "absolute",
              left: "10px",
              top: "-30px",
              pointerEvents: "none",
            }}
          >
            <defs>
              <clipPath id="starClip">
                <rect x="0" y="0" width="600" height="500" />
              </clipPath>
            </defs>
            <g clipPath="url(#starClip)">
              {/* 5 stars in a radial arrangement */}
              {[
                { tx: 0, ty: 0, rot: 0 },
                { tx: 245, ty: -56, rot: 72 },
                { tx: 473, ty: 210, rot: 144 },
                { tx: 290, ty: 460, rot: -144 },
                { tx: -40, ty: 300, rot: -72 },
              ].map((s, i) => (
                <g
                  key={i}
                  transform={`translate(${s.tx}, ${s.ty}) rotate(${s.rot}, 300, 200)`}
                >
                  <path
                    d="M300 120L280 195H200L265 240L300 270L365 310L345 220L410 170H325Z"
                    fill={theme.patternFill}
                  />
                </g>
              ))}
            </g>
          </svg>
        );
      }

      // Default: diamond/chevron pattern
      return (
        <svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          fill="none"
          style={{
            position: "absolute",
            left: "5px",
            top: "-67px",
            pointerEvents: "none",
          }}
        >
          {[106, -34, -174, -314].map((left, i) => (
            <rect
              key={i}
              x={left + 246.78}
              y={53 + 246.78}
              width="349"
              height="349"
              transform={`rotate(-135 ${left + 246.78} ${53 + 246.78})`}
              fill={theme.patternFill}
              stroke={theme.patternStroke}
              strokeWidth="51"
            />
          ))}
        </svg>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1080px",
          backgroundColor: transparent ? "transparent" : "#000000",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Background image */}
        {!transparent && (
          <img
            src={bgImage}
            alt=""
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "1080px",
              height: "1080px",
              objectFit: "cover",
              opacity: 0.6,
            }}
            crossOrigin="anonymous"
          />
        )}

        {/* Central card */}
        <div
          style={{
            position: "absolute",
            left: "220px",
            top: "77px",
            width: "641px",
            height: "926px",
            borderRadius: "10px",
            overflow: "hidden",
            border: `2px solid ${theme.cardBorder}`,
            backgroundColor: theme.cardBg,
            display: "flex",
            flexDirection: "column",
            padding: "16px",
            boxSizing: "border-box",
            gap: "0px",
          }}
        >
          {/* Top "Art" section */}
          <div
            style={{
              position: "relative",
              width: "100%",
              flex: "1 1 0",
              minHeight: "0",
              backgroundColor: theme.artBg,
              border: `2px solid ${theme.artBorder}`,
              borderTopLeftRadius: "120px",
              overflow: "hidden",
            }}
          >
            {/* Art section content: image or pattern + text */}
            {theme.artImage ? (
              <>
                <img
                  src={theme.artImage}
                  alt=""
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
                {/* Title SVG overlay at bottom of art section */}
                {theme.titleImage && (
                  <img
                    src={theme.titleImage}
                    alt=""
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      right: "12px",
                      width: "calc(100% - 24px)",
                      height: "auto",
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                    crossOrigin="anonymous"
                  />
                )}
              </>
            ) : (
              <>
                {/* Background pattern */}
                {renderPattern()}

                {/* Large archetype name at bottom of art section */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    left: "0",
                    right: "12px",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Knockout, Impact, sans-serif",
                      fontSize: getArchetypeFontSize(),
                      fontWeight: "400",
                      color: "#0C0D01",
                      lineHeight: "0.85",
                      textTransform: "uppercase",
                      letterSpacing: "-2px",
                    }}
                  >
                    {shortName}
                  </div>
                </div>

                {/* AKA + The section */}
                <div
                  style={{
                    position: "absolute",
                    left: "185px",
                    top: "217px",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "SaansMono, monospace",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#0C0D01",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    AKA
                  </div>
                  {/* Decorative script "The" */}
                  <div
                    style={{
                      fontFamily: "SerrifVF, Serrif, Georgia, serif",
                      fontSize: "60px",
                      fontStyle: "italic",
                      color: "#0C0D01",
                      lineHeight: "1",
                      marginBottom: "-10px",
                      WebkitTextStroke: "1px #0C0D01",
                    }}
                  >
                    The
                  </div>
                </div>
              </>
            )}

            {/* Circular headshot badge - overlaps top-left */}
            <div
              style={{
                position: "absolute",
                left: "-1px",
                top: "-1px",
                width: "233px",
                height: "233px",
                borderRadius: "50%",
                border: `2px solid ${theme.headshotBorder}`,
                overflow: "hidden",
                backgroundColor: theme.headshotBg,
                zIndex: 3,
              }}
            >
              {headshotUrl ? (
                <img
                  src={headshotUrl}
                  alt={`${firstName} ${lastName}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <img
                  src="/images/smiley-fallback.svg"
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundColor: theme.artBg,
                  }}
                />
              )}
            </div>

            {/* Name + Company - positioned right of headshot */}
            <div
              style={{
                position: "absolute",
                left: "246px",
                top: "25px",
                width: "359px",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontFamily: "Saans, sans-serif",
                  fontSize: "82.4px",
                  fontWeight: "400",
                  fontStyle: "normal",
                  color: "#0C0D01",
                  letterSpacing: "-3.296px",
                  lineHeight: "80%",
                }}
              >
                {firstName}
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "82.4px",
                  fontWeight: "400",
                  color: "#0C0D01",
                  letterSpacing: "-3.3px",
                  lineHeight: "0.85",
                }}
              >
                {lastName}
              </div>
              {company && (
                <div
                  style={{
                    fontFamily: "SerrifVF, Serrif, Georgia, serif",
                    fontSize: "20px",
                    fontWeight: "400",
                    fontStyle: "italic",
                    color: "#0C0D01",
                    letterSpacing: "-0.8px",
                    lineHeight: "1.3",
                    marginTop: "24px",
                  }}
                >
                  Plays for {company}
                </div>
              )}
            </div>
          </div>

          {/* Bottom stats section */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "397px",
              flexShrink: 0,
              backgroundColor: theme.statsBg,
              border: `2px solid ${theme.statsBorder}`,
              overflow: "hidden",
              padding: "15px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* MOST LIKELY TO */}
            <div>
              <div
                style={{
                  fontFamily: "SaansMono, monospace",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme.labelColor,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                MOST LIKELY TO:
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "36px",
                  fontWeight: "400",
                  color: "#0C0D01",
                  lineHeight: "1.15",
                  letterSpacing: "-0.5px",
                }}
              >
                {mostLikelyTo}
              </div>
            </div>

            {/* TYPICALLY SPENDING TIME */}
            <div>
              <div
                style={{
                  fontFamily: "SaansMono, monospace",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme.labelColor,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                TYPICALLY SPENDING TIME:
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "36px",
                  fontWeight: "400",
                  color: "#0C0D01",
                  lineHeight: "1.15",
                  letterSpacing: "-0.5px",
                }}
              >
                {typicallySpending}
              </div>
            </div>

            {/* FAVORITE PHRASE */}
            <div>
              <div
                style={{
                  fontFamily: "SaansMono, monospace",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: theme.labelColor,
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  marginBottom: "6px",
                }}
              >
                FAVORITE PHRASE:
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "36px",
                  fontWeight: "400",
                  fontStyle: "italic",
                  color: "#0C0D01",
                  lineHeight: "1.15",
                  letterSpacing: "-0.5px",
                }}
              >
                {favoritePhrase}
              </div>
            </div>
          </div>
        </div>

        {/* Small dot in top-left of card */}
        <div
          style={{
            position: "absolute",
            left: "238px",
            top: "95px",
            width: "29px",
            height: "29px",
            borderRadius: "50%",
            backgroundColor: theme.dotColor,
            border: `2px solid ${theme.dotBorder}`,
            zIndex: 5,
          }}
        />

        {/* Bottom bar: airops + Win AI Search */}
        {!transparent && (
          <div
            style={{
              position: "absolute",
              left: "40px",
              bottom: "35px",
              right: "40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontFamily: "SaansMono, monospace",
                fontSize: "18px",
                fontWeight: "500",
                color: "#FFFFFF",
                letterSpacing: "1px",
              }}
            >
              airops
            </div>
            <div
              style={{
                fontFamily: "SaansMono, monospace",
                fontSize: "18px",
                fontWeight: "500",
                color: "#FFFFFF",
                letterSpacing: "1px",
              }}
            >
              Win AI Search.
            </div>
          </div>
        )}
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export { ShareCard };
