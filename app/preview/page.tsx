"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface ResultData {
  firstName: string;
  lastName: string;
  company: string;
  archetype: { id: string; name: string; shortName: string; tagline: string };
  role: string;
  stippleImageUrl: string;
  headshotUrl: string;
  ogImageUrl: string | null;
  cardImageUrl: string | null;
  bullets: { mostLikelyTo: string; typicallySpending: string; favoritePhrase: string };
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("No userId provided");
      setLoading(false);
      return;
    }
    fetch(`/api/get-results?userId=${userId}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.success) setData(d);
        else setError(d.error || "Not found");
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <p style={{ color: "rgba(255,255,255,0.4)", padding: 48, textAlign: "center" }}>Loading...</p>;
  }
  if (error || !data) {
    return <p style={{ color: "#ff6b6b", padding: 48, textAlign: "center" }}>Error: {error}</p>;
  }

  const ogImageUrl = `/api/og-image?userId=${userId}`;
  const shareUrl = `https://campaign-quiz.vercel.app/share?userId=${userId}`;
  const resultsUrl = `https://campaign-quiz.vercel.app/results?userId=${userId}`;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <p
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          fontWeight: 600,
          color: "#00FF64",
          marginBottom: 8,
          fontFamily: "SaansMono, monospace",
        }}
      >
        Card Preview
      </p>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 400,
          marginBottom: 32,
          fontFamily: "SerrifVF, Serrif, Georgia, serif",
        }}
      >
        {data.firstName} {data.lastName}
      </h1>

      {/* Info */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Archetype", value: data.archetype.name },
          { label: "Company", value: data.company },
          { label: "Role", value: data.role === "exec" ? "Exec" : data.role === "manager" ? "Manager" : "IC" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "12px 16px",
            }}
          >
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "SaansMono, monospace" }}>
              {item.label}
            </p>
            <p style={{ fontSize: 16, fontWeight: 600, fontFamily: "Saans, sans-serif" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* OG Image */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "SaansMono, monospace" }}>
          OG Image
        </p>
        <img
          src={ogImageUrl}
          alt="OG preview"
          style={{ width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)" }}
        />
      </div>

      {/* Stipple Image */}
      {(data.stippleImageUrl || data.headshotUrl) && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "SaansMono, monospace" }}>
            {data.stippleImageUrl ? "Stipple Portrait" : "Headshot"}
          </p>
          <img
            src={data.stippleImageUrl || data.headshotUrl}
            alt="Portrait"
            style={{ width: 200, height: 200, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.1)" }}
          />
        </div>
      )}

      {/* Links */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href={resultsUrl} style={{ padding: "10px 20px", borderRadius: 8, background: "#00FF64", color: "black", fontWeight: 600, fontSize: 13, textDecoration: "none", fontFamily: "SaansMono, monospace" }}>
          Results Page
        </a>
        <a href={shareUrl} style={{ padding: "10px 20px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 600, fontSize: 13, textDecoration: "none", fontFamily: "SaansMono, monospace" }}>
          Share URL
        </a>
      </div>

      {/* User ID */}
      <p style={{ marginTop: 32, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "SaansMono, monospace", wordBreak: "break-all" }}>
        userId: {userId}
      </p>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <Suspense fallback={<p style={{ color: "rgba(255,255,255,0.4)", padding: 48, textAlign: "center" }}>Loading...</p>}>
        <PreviewContent />
      </Suspense>
    </div>
  );
}
