"use client";

import { forwardRef } from "react";

interface ShareCardProps {
  firstName: string;
  lastName: string;
  company: string;
  archetypeName: string;
  shortName: string;
  headshotUrl?: string;
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  (
    {
      firstName,
      lastName,
      company,
      archetypeName,
      shortName,
      headshotUrl,
      mostLikelyTo,
      typicallySpending,
      favoritePhrase,
    },
    ref
  ) => {
    // Dynamic font size for archetype name to fill width
    const getArchetypeFontSize = () => {
      if (shortName.length > 10) return "80px";
      if (shortName.length > 8) return "95px";
      if (shortName.length > 6) return "115px";
      return "140px";
    };

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1080px",
          backgroundColor: "#000000",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grass background */}
        <img
          src="/images/grass-bg.jpg"
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
            border: "2px solid #002910",
            backgroundColor: "#002910",
            display: "flex",
            flexDirection: "column",
            padding: "16px",
            boxSizing: "border-box",
            gap: "0px",
          }}
        >
          {/* Top "Art" section - sage green background */}
          <div
            style={{
              position: "relative",
              width: "100%",
              flex: "1 1 0",
              minHeight: "0",
              backgroundColor: "#DFEAE3",
              border: "2px solid #008C44",
              borderTopLeftRadius: "120px",
              overflow: "hidden",
            }}
          >
            {/* Diamond/chevron pattern in background */}
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
                  fill="#DFEAE3"
                  stroke="white"
                  strokeWidth="51"
                />
              ))}
            </svg>

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
                  color: "#000D05",
                  lineHeight: "0.85",
                  textTransform: "uppercase",
                  letterSpacing: "-2px",
                }}
              >
                {shortName}
              </div>
            </div>

            {/* Circular headshot badge - overlaps top-left */}
            <div
              style={{
                position: "absolute",
                left: "-1px",
                top: "-1px",
                width: "233px",
                height: "233px",
                borderRadius: "50%",
                border: "2px solid #008C44",
                overflow: "hidden",
                backgroundColor: "#F8FFFB",
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
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#DFEAE3",
                    fontSize: "80px",
                    fontWeight: "bold",
                    color: "#002910",
                    opacity: 0.3,
                  }}
                >
                  {firstName.charAt(0).toUpperCase()}
                </div>
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
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  lineHeight: "0.8",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontFamily: "SaansMono, Saans, sans-serif",
                    fontSize: "82.4px",
                    fontWeight: "400",
                    color: "#000D05",
                    letterSpacing: "-3.3px",
                    lineHeight: "0.8",
                  }}
                >
                  {firstName}
                </div>
                <div
                  style={{
                    fontFamily: "SerrifVF, Serrif, Georgia, serif",
                    fontSize: "82.4px",
                    fontWeight: "400",
                    color: "#000D05",
                    letterSpacing: "-3.3px",
                    lineHeight: "0.8",
                  }}
                >
                  {lastName}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "24px",
                  fontWeight: "400",
                  fontStyle: "italic",
                  color: "#000D05",
                  letterSpacing: "-0.96px",
                  lineHeight: "1.3",
                }}
              >
                Plays for {company}
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
                  color: "#000D05",
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
                  color: "#000D05",
                  lineHeight: "1",
                  marginBottom: "-10px",
                  WebkitTextStroke: "1px #000D05",
                }}
              >
                The
              </div>
            </div>
          </div>

          {/* Bottom white stats section */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "397px",
              flexShrink: 0,
              backgroundColor: "#F8FFFB",
              border: "2px solid #008C44",
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
                  color: "#008C44",
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
                  color: "#000D05",
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
                  color: "#008C44",
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
                  color: "#000D05",
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
                  color: "#008C44",
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
                  color: "#000D05",
                  lineHeight: "1.15",
                  letterSpacing: "-0.5px",
                }}
              >
                {favoritePhrase}
              </div>
            </div>
          </div>
        </div>

        {/* Small green dot in top-left of card */}
        <div
          style={{
            position: "absolute",
            left: "238px",
            top: "95px",
            width: "29px",
            height: "29px",
            borderRadius: "50%",
            backgroundColor: "#008C44",
            border: "2px solid #F8FFFB",
            zIndex: 5,
          }}
        />

        {/* Bottom bar: airops + Win AI Search */}
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
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export { ShareCard };
