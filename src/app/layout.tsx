import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06090e",
};

export const metadata: Metadata = {
  title: "DarkSpot Radar | Information Gap & Contradiction Detection",
  description:
    "See what your sources don't tell you. Expectation-first AI gap detection, cross-source conflict audits, quote-verified evidence, and explainable decision readiness scoring.",
  keywords: [
    "Information Gap Detection",
    "Digital Dark Spot",
    "Contradiction Detection",
    "Evidence Verification",
    "Decision Readiness Score",
    "Fact Checking",
  ],
  authors: [{ name: "DarkSpot Radar Team" }],
  openGraph: {
    title: "DarkSpot Radar | Information Gap & Contradiction Detection",
    description:
      "See what your sources don't tell you. Expectation-first AI gap detection, cross-source conflict audits, quote-verified evidence, and explainable decision readiness scoring.",
    siteName: "DarkSpot Radar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-radar-950 text-slate-100 min-h-screen selection:bg-sky-500/30 selection:text-sky-200`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="radar-grid fixed inset-0 pointer-events-none opacity-40 z-0" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
