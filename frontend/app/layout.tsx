import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SearchEO \u2014 See How Search Engines & AI See Your Page",
  description:
    "Analyze your webpage across 66 checks for search visibility, speed, and AI readiness. Free, instant results.",
  openGraph: {
    title: "SearchEO \u2014 See How Search Engines & AI See Your Page",
    description: "Check 66 things across search visibility, speed, and AI readiness. Free and instant.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
