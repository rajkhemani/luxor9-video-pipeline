import Script from "next/script";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Hero, features, steps, pricingPlans } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { CTA } from "@/components/marketing/cta";

export default function Home() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <Script
        id="jsonld-software-application"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "LUXOR9",
            operatingSystem: "Cloud",
            applicationCategory: "BusinessApplication",
            description:
              "Multi-agent orchestration platform that deploys specialized AI agents in a multi-tier hierarchy.",
            url: "https://luxor9.app",
            offers: {
              "@type": "Offer",
              price: "29",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <Script
        id="jsonld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "LUXOR9",
            url: "https://luxor9.app",
          }),
        }}
      />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
