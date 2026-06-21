import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Video } from "remotion";
import type { SalesVideoProps } from "../schemas/video-schemas";
import { GradientBackground } from "../components/GradientBackground";
import { LogoIntro } from "../components/LogoIntro";
import { ProductCard } from "../components/ProductCard";
import { CTAButton } from "../components/CTAButton";
import { THEME } from "../theme";

export const SalesVideo: React.FC<SalesVideoProps> = ({ heyGenUrl, customerName, productName, productImageUrl, productFeatures, testimonial, ctaText, urgencyText }) => {
  const { fps } = useVideoConfig();
  const s = (n: number) => n * fps;
  const testimonialStart = s(15);
  const ctaStart = testimonial ? testimonialStart + s(2.5) : s(15);
  return (
    <AbsoluteFill>
      <GradientBackground />
      <Sequence from={0} durationInFrames={s(1.5)}><LogoIntro tagline="Personalized Offer" /></Sequence>
      <Sequence from={s(1.5)} durationInFrames={s(10)}>
        <GradientBackground />
        <Video src={heyGenUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", bottom: 40, left: 40, padding: "12px 24px", borderRadius: THEME.radii.md, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}>
          <span style={{ color: THEME.colors.primary, fontSize: 18, fontWeight: 600 }}>Hi {customerName}!</span>
        </div>
      </Sequence>
      <Sequence from={s(11.5)} durationInFrames={s(3.5)}>
        <ProductCard imageUrl={productImageUrl} productName={productName} features={productFeatures} />
      </Sequence>
      {testimonial && (
        <Sequence from={testimonialStart} durationInFrames={s(2.5)}>
          <GradientBackground gradient={THEME.gradients.dark} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
            <div style={{ color: "#fbbf24", fontSize: 32 }}>{"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}</div>
            <div style={{ fontSize: 28, color: THEME.colors.light, textAlign: "center", fontStyle: "italic", lineHeight: 1.4, maxWidth: "80%" }}>"{testimonial.text}"</div>
            <div style={{ fontSize: 20, color: THEME.colors.primary }}>— {testimonial.author}</div>
          </div>
        </Sequence>
      )}
      <Sequence from={ctaStart} durationInFrames={s(2.5)}>
        <CTAButton text={ctaText} urgency={urgencyText} subtext="Limited stock available" />
      </Sequence>
    </AbsoluteFill>
  );
};
