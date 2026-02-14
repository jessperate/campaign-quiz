import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://campaign-quiz.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Content Engineer Performance Lab | AirOps",
  description: "A performance check for CMOs and content leaders navigating AI-driven growth. Take the quiz to discover your Content Engineer archetype.",
  openGraph: {
    title: "How do you win AI search?",
    description: "A performance check for CMOs and content leaders navigating AI-driven growth.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "How do you win AI search?",
    description: "A performance check for CMOs and content leaders navigating AI-driven growth.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" prefix="og: http://ogp.me/ns#">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
