import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEOLens \u2014 AI Answer Engine Content Optimizer",
  description:
    "Score and optimize your content for AI answer engines. Analyze structure, schema markup, entity coverage, and readability.",
  openGraph: {
    title: "AEOLens \u2014 AI Answer Engine Content Optimizer",
    description: "Scan, score, and optimize any page for AI answer engines.",
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
