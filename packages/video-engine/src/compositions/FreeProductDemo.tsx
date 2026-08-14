import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Audio, interpolate, useCurrentFrame, Easing, Img, staticFile } from "remotion";
import { z } from "zod";
import { GradientBackground } from "../components/GradientBackground";
import { CTAButton } from "../components/CTAButton";
import { THEME } from "../theme";

export const FreeProductDemoSchema = z.object({
  voiceoverUrl: z.string().default(""),
  productName: z.string(),
  productTagline: z.string(),
  featureTitle: z.string().default("Key Features"),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().optional(),
  })).min(1).max(6),
  primaryCta: z.object({ text: z.string(), url: z.string().optional() }),
});

type Props = z.infer<typeof FreeProductDemoSchema>;

const SlideIn: React.FC<{ children: React.ReactNode; delay: number; direction?: "left" | "right" | "up" }> = ({ children, delay, direction = "up" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = delay * fps;
  const opacity = interpolate(frame, [d, d + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const startX = direction === "left" ? -80 : direction === "right" ? 80 : 0;
  const startY = direction === "up" ? 60 : 0;
  const x = interpolate(frame, [d, d + fps * 0.3], [startX, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const y = interpolate(frame, [d, d + fps * 0.3], [startY, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return <div style={{ opacity, transform: `translate(${x}px, ${y}px)` }}>{children}</div>;
};

const FeatureCard: React.FC<{ feature: Props["features"][0]; index: number; total: number }> = ({ feature, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = index * fps * 0.5;
  const opacity = interpolate(frame, [d, d + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, [d, d + fps * 0.3], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <div style={{
      opacity, transform: `scale(${scale})`,
      background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
      borderRadius: THEME.radii.lg, padding: 24, border: "1px solid rgba(255,255,255,0.1)",
      flex: 1, minWidth: total > 3 ? "30%" : "45%",
    }}>
      {feature.imageUrl && (
        <Img src={feature.imageUrl} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: THEME.radii.sm, marginBottom: 12 }} />
      )}
      <div style={{ fontSize: 20, fontWeight: 700, color: THEME.colors.primary, marginBottom: 4 }}>{feature.title}</div>
      <div style={{ fontSize: 16, color: THEME.colors.muted, lineHeight: 1.4 }}>{feature.description}</div>
    </div>
  );
};

export const FreeProductDemo: React.FC<Props> = ({ voiceoverUrl, productName, productTagline, featureTitle, features, primaryCta }) => {
  const { fps } = useVideoConfig();
  const s = (n: number) => n * fps;

  return (
    <AbsoluteFill>
      <GradientBackground animated />

      {voiceoverUrl && <Audio src={staticFile(voiceoverUrl)} />}

      <Sequence from={0} durationInFrames={s(3)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
          <SlideIn delay={0}>
            <div style={{
              fontSize: 56, fontWeight: 800,
              background: THEME.gradients.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}>{productName}</div>
          </SlideIn>
          <SlideIn delay={0.5}>
            <div style={{ fontSize: 28, color: THEME.colors.light, textAlign: "center", opacity: 0.9 }}>{productTagline}</div>
          </SlideIn>
        </div>
      </Sequence>

      <Sequence from={s(3)} durationInFrames={s(2 + features.length * 1.5)}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "60px 40px", gap: 24 }}>
          <SlideIn delay={0} direction="left">
            <div style={{ fontSize: 32, fontWeight: 700, color: THEME.colors.light, marginBottom: 8 }}>{featureTitle}</div>
          </SlideIn>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, flex: 1, alignContent: "flex-start" }}>
            {features.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} total={features.length} />
            ))}
          </div>
        </div>
      </Sequence>

      <Sequence from={s(6 + features.length * 1.5)} durationInFrames={s(4)}>
        <CTAButton text={primaryCta.text} subtext={primaryCta.url?.replace("https://", "")} />
      </Sequence>
    </AbsoluteFill>
  );
};
