import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LUXOR9 Documentation | Multi-Agent Orchestration Platform",
  description: "Comprehensive documentation for LUXOR9's multi-agent orchestration platform. API reference, agent architecture guides, getting started tutorials, and example workflows.",
  openGraph: {
    title: "LUXOR9 Documentation | Multi-Agent Platform Guides",
    description: "Learn how to deploy and orchestrate specialized AI agent teams with LUXOR9. API reference, architecture docs, and examples.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LUXOR9 Documentation" }],
  },
  twitter: { card: "summary_large_image", title: "LUXOR9 Documentation | Multi-Agent Platform Guides", description: "Learn how to deploy and orchestrate specialized AI agent teams with LUXOR9." },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-dark-bg pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-h1 font-heading font-bold text-white mb-4">
          LUXOR9 <span className="gradient-text-primary">Documentation</span>
        </h1>
        <p className="text-dark-muted text-body-lg mb-12">Documentation coming soon!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "API Reference", href: "/api", desc: "Complete API documentation for all endpoints" },
            { title: "Agent Architecture", href: "/docs/agents", desc: "Understanding the multi-tier agent hierarchy" },
            { title: "Getting Started", href: "/docs/getting-started", desc: "Quick start guide for new users" },
            { title: "Examples", href: "/docs/examples", desc: "Example workflows and use cases" },
          ].map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="p-6 rounded-xl bg-dark-surface border border-dark-border hover:border-primary/30 transition-all duration-300 group"
            >
              <h2 className="text-h4 font-heading font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {link.title}
              </h2>
              <p className="text-dark-muted text-sm">{link.desc}</p>
            </Link>
          ))}
        </div>
        <div className="mt-12 p-6 rounded-xl bg-dark-surface border border-dark-border">
          <h2 className="text-h4 font-heading font-bold text-white mb-4">Need Help?</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {[
              { label: "GitHub Issues", href: "https://github.com/your-org/luxor9/issues" },
              { label: "Discord Community", href: "https://discord.gg/luxor9" },
              { label: "Email Support", href: "mailto:support@luxor9.app" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-primary hover:underline text-sm"
              >
                {link.label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
