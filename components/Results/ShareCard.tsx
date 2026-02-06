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
    // Dynamic font size for long archetype names
    const getArchetypeFontSize = () => {
      if (shortName.length > 10) return "52px";
      if (shortName.length > 7) return "64px";
      return "78px";
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
            borderRadius: "9px",
            overflow: "hidden",
            border: "2px solid #002910",
          }}
        >
          {/* Dark green top section */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "514px",
              backgroundColor: "#002910",
            }}
          >
            {/* Circular headshot */}
            <div
              style={{
                position: "absolute",
                left: "15px",
                top: "15px",
                width: "233px",
                height: "233px",
                borderRadius: "50%",
                border: "2px solid #008C44",
                overflow: "hidden",
                backgroundColor: "#F8FFFB",
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
                    opacity: 0.4,
                  }}
                >
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name + Company - top right area */}
            <div
              style={{
                position: "absolute",
                left: "270px",
                top: "30px",
                right: "20px",
              }}
            >
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: "400",
                  color: "#FFFFFF",
                  lineHeight: "1.2",
                  marginBottom: "6px",
                }}
              >
                {firstName}
              </div>
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: "400",
                  color: "#FFFFFF",
                  lineHeight: "1.2",
                  marginBottom: "16px",
                }}
              >
                {lastName}
              </div>
              <div
                style={{
                  fontFamily: "SaansMono, monospace",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#FFFFFF",
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Plays for {company}
              </div>
            </div>

            {/* AKA section */}
            <div
              style={{
                position: "absolute",
                left: "20px",
                top: "280px",
                right: "20px",
              }}
            >
              <div
                style={{
                  fontFamily: "SaansMono, monospace",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#FFFFFF",
                  opacity: 0.6,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                AKA
              </div>
              {/* Decorative "The" */}
              <div
                style={{
                  fontFamily: "SerrifVF, Serrif, Georgia, serif",
                  fontSize: "32px",
                  fontStyle: "italic",
                  color: "#FFFFFF",
                  opacity: 0.7,
                  lineHeight: "1",
                  marginBottom: "0px",
                }}
              >
                The
              </div>
              {/* Large archetype name */}
              <div
                style={{
                  fontFamily: "Knockout, Impact, sans-serif",
                  fontSize: getArchetypeFontSize(),
                  fontWeight: "400",
                  color: "#FFFFFF",
                  lineHeight: "1.05",
                  textTransform: "uppercase",
                  letterSpacing: "-1px",
                }}
              >
                {shortName}
              </div>
            </div>
          </div>

          {/* Diamond decorative shapes at boundary */}
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "490px",
              width: "100%",
              height: "100px",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <svg
              width="641"
              height="100"
              viewBox="0 0 641 100"
              fill="none"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {/* Row of diamonds */}
              {[80, 220, 360, 500].map((cx, i) => (
                <rect
                  key={i}
                  x={cx}
                  y="50"
                  width="90"
                  height="90"
                  transform={`rotate(-45 ${cx} 50)`}
                  fill="#DFEAE3"
                  stroke="white"
                  strokeWidth="16"
                />
              ))}
            </svg>
          </div>

          {/* White bottom section */}
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "514px",
              width: "100%",
              height: "412px",
              backgroundColor: "#F8FFFB",
              padding: "40px 30px 30px",
              boxSizing: "border-box",
            }}
          >
            {/* Stat rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* MOST LIKELY TO */}
              <div>
                <div
                  style={{
                    fontFamily: "SaansMono, monospace",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#002910",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: "4px",
                  }}
                >
                  MOST LIKELY TO
                </div>
                <div
                  style={{
                    fontFamily: "SerrifVF, Serrif, Georgia, serif",
                    fontSize: "20px",
                    fontWeight: "400",
                    color: "#002910",
                    lineHeight: "1.3",
                  }}
                >
                  {mostLikelyTo}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "1px", backgroundColor: "#002910", opacity: 0.1 }} />

              {/* TYPICALLY SPENDING TIME */}
              <div>
                <div
                  style={{
                    fontFamily: "SaansMono, monospace",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#002910",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: "4px",
                  }}
                >
                  TYPICALLY SPENDING TIME
                </div>
                <div
                  style={{
                    fontFamily: "SerrifVF, Serrif, Georgia, serif",
                    fontSize: "20px",
                    fontWeight: "400",
                    color: "#002910",
                    lineHeight: "1.3",
                  }}
                >
                  {typicallySpending}
                </div>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "1px", backgroundColor: "#002910", opacity: 0.1 }} />

              {/* FAVORITE PHRASE */}
              <div>
                <div
                  style={{
                    fontFamily: "SaansMono, monospace",
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#002910",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    marginBottom: "4px",
                  }}
                >
                  FAVORITE PHRASE
                </div>
                <div
                  style={{
                    fontFamily: "SerrifVF, Serrif, Georgia, serif",
                    fontSize: "20px",
                    fontWeight: "400",
                    color: "#002910",
                    lineHeight: "1.3",
                    fontStyle: "italic",
                  }}
                >
                  {favoritePhrase}
                </div>
              </div>
            </div>
          </div>
        </div>

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
