import type { Metadata } from "next";
import "./globals.css";

const baseUrl = "https://luxor9.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "LUXOR9 | Deploy an AI Team, Not Just an Agent",
  description: "Specialized AI agents organized in a multi-tier hierarchy. Intelligent multi-agent orchestration for complex enterprise workflows.",
  keywords: ["AI agents", "multi-agent", "orchestration", "agent hierarchy", "enterprise AI", "agent teams", "LUXOR9"],
  authors: [{ name: "LUXOR9" }],
  publisher: "LUXOR9",
  creator: "LUXOR9",
  openGraph: {
    title: "LUXOR9 | Deploy an AI Team, Not Just an Agent",
    description: "Specialized agents in a multi-tier hierarchy. Deploy intelligent agent teams that communicate, delegate, and execute together.",
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "LUXOR9",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LUXOR9 - Deploy an AI Team, Not Just an Agent" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXOR9 | Deploy an AI Team, Not Just an Agent",
    description: "Specialized agents in a multi-tier hierarchy. Deploy intelligent agent teams that communicate, delegate, and execute together.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: baseUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg antialiased">
        {children}
      </body>
    </html>
  );
}
