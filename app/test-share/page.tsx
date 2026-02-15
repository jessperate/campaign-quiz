"use client";

import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { archetypes } from "@/lib/archetypes";
import type { ArchetypeId } from "@/lib/quiz-data";
import { ShareCard } from "@/components/Results/ShareCard";

interface ResultData {
  firstName: string;
  lastName: string;
  company: string;
  archetype: ArchetypeId;
  role: string;
  bullets: {
    mostLikelyTo: string;
    typicallySpending: string;
    favoritePhrase: string;
  };
  headshotUrl: string;
  stippleImageUrl: string;
  ogImageUrl: string;
}

export default function TestSharePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [linkedinCopied, setLinkedinCopied] = useState(false);
  const [showLinkedinModal, setShowLinkedinModal] = useState(false);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("userId");
    if (!uid) {
      setError("Missing ?userId= parameter");
      setLoading(false);
      return;
    }
    setUserId(uid);

    fetch(`/api/get-results?userId=${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          setError("User not found");
          return;
        }
        setData({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          company: d.company || "",
          archetype: d.archetype?.id || "vision",
          role: d.role || "ic",
          bullets: d.bullets || {},
          headshotUrl: d.stippleImageUrl || d.headshotUrl || "",
          stippleImageUrl: d.stippleImageUrl || "",
          ogImageUrl: d.ogImageUrl || "",
        });
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ background: "#0a0a1a", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: "#0a0a1a", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <p style={{ color: "#ff6b6b", fontSize: "18px" }}>{error}</p>
        <p style={{ color: "#888", fontSize: "14px" }}>Usage: /test-share?userId=YOUR_USER_ID</p>
      </div>
    );
  }

  const archetype = archetypes[data.archetype];
  const roleContent = archetype?.roleContent[data.role as keyof typeof archetype.roleContent];

  const shareBody = [
    `I took the @AirOpsHQ Marketype quiz and I got The ${archetype?.name || "Champion"} -- ${roleContent?.tagline || ""}`,
    ``,
    `- Most likely to: ${data.bullets.mostLikelyTo}`,
    `- Spend time: ${data.bullets.typicallySpending}`,
    `- Favorite phrase: ${data.bullets.favoritePhrase}`,
    ``,
    `Find out what kind of player you are: airops.com/win`,
  ].join("\n");

  const linkedinShareUrl = "https://www.linkedin.com/feed/?shareActive=true";

  const twitterBody = `I took the @AirOpsHQ Marketype quiz and I got The ${archetype?.name || "Champion"}. Find out what kind of player you are:`;
  const twitterShareLink = `https://campaign-quiz.vercel.app/share?userId=${userId}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterBody)}&url=${encodeURIComponent(twitterShareLink)}`;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleLinkedinClick = async () => {
    if (isMobile && navigator.share) {
      // Mobile: use Web Share API to pass image + text directly
      try {
        let file: File | null = null;
        if (downloadRef.current) {
          const canvas = await html2canvas(downloadRef.current, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#000000",
            width: 1200,
            height: 630,
          });
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
          );
          if (blob) {
            file = new File([blob], "airops-marketype-card.png", { type: "image/png" });
          }
        }
        const shareData: ShareData = { text: shareBody };
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed — no-op
      }
      return;
    }

    // Desktop: download card + copy text + show modal
    navigator.clipboard.writeText(shareBody);
    setLinkedinCopied(true);
    setTimeout(() => setLinkedinCopied(false), 4000);

    if (downloadRef.current) {
      try {
        const canvas = await html2canvas(downloadRef.current, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#000000",
          width: 1200,
          height: 630,
        });
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "airops-marketype-card.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, "image/png");
      } catch {
        if (data.ogImageUrl) window.open(data.ogImageUrl, "_blank");
      }
    }

    setShowLinkedinModal(true);
  };

  return (
    <div style={{ background: "#0a0a1a", color: "#fff", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Hidden download card for html2canvas */}
      <div
        ref={downloadRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: "1200px",
          height: "630px",
          overflow: "hidden",
          backgroundColor: "#000000",
        }}
      >
        <img
          src={`/images/og-bg-${data.archetype}.jpg`}
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "630px",
            objectFit: "cover",
            opacity: 0.6,
          }}
          crossOrigin="anonymous"
        />
        <div
          style={{
            position: "absolute",
            left: "285px",
            top: "0px",
            width: "1080px",
            height: "1080px",
            transform: "scale(0.583)",
            transformOrigin: "top left",
          }}
        >
          <ShareCard
            firstName={data.firstName}
            lastName={data.lastName}
            company={data.company}
            archetypeName={archetype?.name || "Champion"}
            shortName={archetype?.shortName || "CHAMPION"}
            archetypeId={data.archetype}
            headshotUrl={data.headshotUrl}
            mostLikelyTo={data.bullets.mostLikelyTo}
            typicallySpending={data.bullets.typicallySpending}
            favoritePhrase={data.bullets.favoritePhrase}
            transparent
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px" }}>
        <p style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "3px", marginBottom: "8px" }}>
          Share Test Page
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 600, marginBottom: "8px" }}>
          {data.firstName} {data.lastName}
        </h1>
        <p style={{ color: "#aaa", marginBottom: "32px" }}>
          The {archetype?.name || "Champion"} {data.company ? `@ ${data.company}` : ""}
        </p>

        {/* OG image preview */}
        <div style={{ marginBottom: "32px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
          <img
            src={`/api/og-image?userId=${userId}`}
            alt="OG Card Preview"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        {/* Share copy preview */}
        <div style={{ background: "#111128", borderRadius: "12px", padding: "16px", marginBottom: "32px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
            Share Copy (copied to clipboard)
          </p>
          <pre style={{ color: "#ccc", fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: 1.5, margin: 0 }}>
            {shareBody}
          </pre>
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* LinkedIn */}
          <button
            onClick={handleLinkedinClick}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 20px",
              borderRadius: "9999px",
              background: "#00FF64",
              color: "#000D05",
              fontWeight: 600,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            {isMobile
              ? "Share your card on LinkedIn"
              : linkedinCopied
                ? "Card downloaded & post copied!"
                : "Download your card and share on LinkedIn"
            }
          </button>

          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 20px",
              borderRadius: "9999px",
              background: "#00FF64",
              color: "#000D05",
              fontWeight: 600,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>

          {/* Slack */}
          <button
            onClick={() => {
              const shareUrl = `https://campaign-quiz.vercel.app/share?userId=${userId}`;
              navigator.clipboard.writeText(shareUrl);
              setShowSlackModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 20px",
              borderRadius: "9999px",
              background: "#00FF64",
              color: "#000D05",
              fontWeight: 600,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
            </svg>
            Share your results in Slack
          </button>
        </div>
      </div>

      {/* LinkedIn instructional modal */}
      {showLinkedinModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowLinkedinModal(false)}
        >
          <div
            style={{
              background: "#1A1A2E",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLinkedinModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#888",
                fontSize: "24px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: "22px", color: "#fff", marginBottom: "20px" }}>
              Almost there! Post on LinkedIn:
            </h3>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { n: "1", text: <><strong>Upload your downloaded card image</strong> to the LinkedIn post</> },
                { n: "2", text: <><strong>Paste your copied text</strong> into the post body (already on your clipboard!)</> },
                { n: "3", text: <><strong>Make it your own</strong> and hit post!</> },
              ].map((step) => (
                <li key={step.n} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#00FF64",
                      color: "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {step.n}
                  </span>
                  <span style={{ color: "#E6E6FF", fontSize: "15px", paddingTop: "3px" }}>
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => {
                setShowLinkedinModal(false);
                window.open(linkedinShareUrl, "_blank");
              }}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "12px",
                borderRadius: "9999px",
                background: "#00FF64",
                color: "#000D05",
                fontWeight: 600,
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Got it — open LinkedIn
            </button>
          </div>
        </div>
      )}

      {/* Slack instructional modal */}
      {showSlackModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowSlackModal(false)}
        >
          <div
            style={{
              background: "#1A1A2E",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "420px",
              width: "90%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSlackModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                color: "#888",
                fontSize: "24px",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: "22px", color: "#fff", marginBottom: "20px" }}>
              Almost there! Share in Slack:
            </h3>
            <p style={{ color: "#E6E6FF", fontSize: "15px", lineHeight: 1.6 }}>
              When Slack opens, select which DM or channel to share in. Then all you have to do is <strong>&#8984; + V</strong> (paste) into the message field and hit send.
            </p>
            <button
              onClick={() => {
                setShowSlackModal(false);
                window.open("slack://open", "_blank");
              }}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "12px",
                borderRadius: "9999px",
                background: "#00FF64",
                color: "#000D05",
                fontWeight: 600,
                fontSize: "15px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Got it — open Slack
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
