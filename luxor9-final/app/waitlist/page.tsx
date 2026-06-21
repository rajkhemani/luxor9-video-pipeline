import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import { EmailCapture } from "@/components/marketing/email-capture";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "LUXOR9 Waitlist | Get Early Access to Multi-Agent Orchestration",
  description: "Join the waitlist for LUXOR9 — deploy specialized AI agent teams in a multi-tier hierarchy. Get early access to the platform that lets you orchestrate complex enterprise workflows.",
  openGraph: {
    title: "LUXOR9 Waitlist | Get Early Access",
    description: "Deploy specialized AI agent teams. Join the LUXOR9 waitlist for early access to multi-agent orchestration.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LUXOR9 Waitlist" }],
  },
  twitter: { card: "summary_large_image", title: "LUXOR9 Waitlist | Get Early Access", description: "Deploy specialized AI agent teams. Join the LUXOR9 waitlist for early access." },
};

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <main className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-dark-bg">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 border border-primary/30 mb-8">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-h2 lg:text-h1 font-heading font-bold text-white mb-4">
            Deploy Your <span className="gradient-text-primary">Agent Team</span>
          </h1>
          <p className="text-body-lg text-dark-muted max-w-2xl mx-auto mb-12">
            Specialized agents in a multi-tier hierarchy. Get early access to the multi-agent orchestration platform.
          </p>
          <EmailCapture />
          <section className="mt-20 text-left max-w-xl mx-auto">
            <h2 className="text-h3 font-heading font-bold text-white mb-6 text-center">What You Get</h2>
            <ul className="space-y-4">
              {[
                "Early access to the full multi-agent hierarchy",
                "Exclusive development updates and roadmap previews",
                "Priority onboarding support on launch day",
                "Founding member pricing for life",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-dark-muted">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "🤖", label: "Specialized Agents" },
              { value: "🔗", label: "Hierarchy Tiers" },
              { value: "⚡", label: "Active Deployments" },
              { value: "✅", label: "Tasks Completed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl bg-dark-surface/50 border border-dark-border"
              >
                <div className="text-h3 font-heading font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-dark-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
