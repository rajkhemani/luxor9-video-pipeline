import { Composition } from "remotion";
import { SalesVideo } from "./compositions/SalesVideo";
import { ProductDemo } from "./compositions/ProductDemo";
import { SocialClip } from "./compositions/SocialClip";
import { FreeSalesVideo, FreeSalesVideoSchema } from "./compositions/FreeSalesVideo";
import { FreeProductDemo, FreeProductDemoSchema } from "./compositions/FreeProductDemo";
import { FreeSocialClip, FreeSocialClipSchema } from "./compositions/FreeSocialClip";
import { SalesVideoSchema, ProductDemoSchema, SocialVideoSchema } from "./schemas/video-schemas";

export const RemotionRoot = () => {
  return (
    <>
      {/* Premium (paid API) compositions */}
      <Composition id="SalesVideo" component={SalesVideo} durationInFrames={600} fps={30} width={1080} height={1920} schema={SalesVideoSchema} defaultProps={{
        heyGenUrl: "https://example.com/avatar.mp4", customerName: "Alex", productName: "LUXOR9 Pro",
        productImageUrl: "https://example.com/product.png", productFeatures: ["AI-powered analytics", "Real-time insights", "Automated workflows"],
        ctaText: "Get Started Now", urgencyText: "Limited time offer",
      }} />
      <Composition id="ProductDemo" component={ProductDemo} durationInFrames={1800} fps={30} width={1920} height={1080} schema={ProductDemoSchema} defaultProps={{
        heygenIntroUrl: "https://example.com/intro.mp4", heygenIntroDuration: 7,
        heygenOutroUrl: "https://example.com/outro.mp4", heygenOutroDuration: 10,
        productName: "LUXOR9", productTagline: "Enterprise AI Platform",
        demoSteps: [{ title: "Dashboard Overview", description: "See your metrics at a glance", duration: 5 }, { title: "AI Agent Setup", description: "Configure your agent team", duration: 5 }],
        primaryCta: { text: "Start Free Trial", url: "https://luxor9.ai" },
      }} />
      <Composition id="SocialClip" component={SocialClip} durationInFrames={570} fps={30} width={1080} height={1920} schema={SocialVideoSchema} defaultProps={{
        format: "instagram", heyGenUrl: "https://example.com/avatar.mp4", hookText: "AI is changing everything",
        bodyPoints: ["Faster decisions", "Smarter automation", "Real-time insights"], ctaText: "Follow for more",
      }} />
      <Composition id="SocialClip-Square" component={SocialClip} durationInFrames={570} fps={30} width={1080} height={1080} schema={SocialVideoSchema} defaultProps={{
        format: "linkedin", heyGenUrl: "https://example.com/avatar.mp4", hookText: "AI is changing everything",
        bodyPoints: ["Faster decisions", "Smarter automation", "Real-time insights"], ctaText: "Follow for more",
      }} />
      <Composition id="SocialClip-Landscape" component={SocialClip} durationInFrames={600} fps={30} width={1920} height={1080} schema={SocialVideoSchema} defaultProps={{
        format: "youtube", heyGenUrl: "https://example.com/avatar.mp4", hookText: "AI is changing everything",
        bodyPoints: ["Faster decisions", "Smarter automation", "Real-time insights"], ctaText: "Subscribe for more",
      }} />

      {/* Free (no API key) compositions */}
      <Composition id="FreeSalesVideo" component={FreeSalesVideo} durationInFrames={900} fps={30} width={1080} height={1920} schema={FreeSalesVideoSchema} defaultProps={{
        voiceoverUrl: "", productName: "LUXOR9 Pro",
        productImageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
        scriptSegments: [{ text: "Meet LUXOR9 Pro", startTime: 0.5, duration: 2 }, { text: "The most powerful AI agent platform", startTime: 3, duration: 2.5 }, { text: "Deploy 179+ agents in minutes", startTime: 6, duration: 2.5 }, { text: "No coding required", startTime: 9, duration: 2 }],
        features: ["AI-powered analytics", "Real-time insights", "Automated workflows"],
        testimonialText: "Transformed how we deploy AI agents", testimonialAuthor: "Sarah K.",
        ctaText: "Get Started Free",
      }} />

      <Composition id="FreeProductDemo" component={FreeProductDemo} durationInFrames={900} fps={30} width={1920} height={1080} schema={FreeProductDemoSchema} defaultProps={{
        voiceoverUrl: "", productName: "LUXOR9", productTagline: "Enterprise AI Agent Platform",
        features: [
          { title: "179+ Agents", description: "Specialized AI agents for every business function" },
          { title: "Real-time Analytics", description: "Live dashboard with actionable insights" },
          { title: "Multi-Provider", description: "Works with OpenAI, Anthropic, Google, Groq" },
        ],
        primaryCta: { text: "Start Free Trial", url: "https://luxor9.ai" },
      }} />

      <Composition id="FreeSocialClip" component={FreeSocialClip} durationInFrames={450} fps={30} width={1080} height={1920} schema={FreeSocialClipSchema} defaultProps={{
        voiceoverUrl: "", format: "vertical",
        hookText: "AI is changing everything 🚀",
        bodyPoints: ["Deploy 179+ agents in minutes", "Real-time analytics dashboard", "Multi-provider LLM support"],
        ctaText: "Follow @luxor9 for more",
      }} />

      <Composition id="FreeSocialClip-Square" component={FreeSocialClip} durationInFrames={450} fps={30} width={1080} height={1080} schema={FreeSocialClipSchema} defaultProps={{
        voiceoverUrl: "", format: "square",
        hookText: "AI is changing everything",
        bodyPoints: ["Deploy 179+ agents in minutes", "Real-time analytics", "Multi-provider support"],
        ctaText: "Follow @luxor9 for more",
      }} />

      <Composition id="FreeSocialClip-Landscape" component={FreeSocialClip} durationInFrames={600} fps={30} width={1920} height={1080} schema={FreeSocialClipSchema} defaultProps={{
        voiceoverUrl: "", format: "landscape",
        hookText: "AI is changing everything",
        bodyPoints: ["Deploy 179+ agents in minutes", "Real-time analytics dashboard", "Multi-provider LLM support"],
        ctaText: "Subscribe for more",
      }} />
    </>
  );
};
