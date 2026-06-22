import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Audio, interpolate, useCurrentFrame, Easing, Img, staticFile } from "remotion";
import { z } from "zod";
import { GradientBackground } from "../components/GradientBackground";
import { CTAButton } from "../components/CTAButton";
import { THEME } from "../theme";

export const FreeSalesVideoSchema = z.object({
  voiceoverUrl: z.string().default(""),
  productName: z.string(),
  productImageUrl: z.string().url(),
  scriptSegments: z.array(z.object({
    text: z.string(),
    startTime: z.number(),
    duration: z.number(),
  })).min(1),
  customerName: z.string().optional(),
  features: z.array(z.string()).max(4).default([]),
  testimonialText: z.string().optional(),
  testimonialAuthor: z.string().optional(),
  ctaText: z.string().default("Get Started Now"),
  primaryColor: z.string().default(THEME.colors.primary),
});

type Props = z.infer<typeof FreeSalesVideoSchema>;

const AnimatedText: React.FC<{ text: string; delay: number; color?: string; size?: number }> = ({ text, delay, color = THEME.colors.light, size = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = delay * fps;
  const opacity = interpolate(frame, [startFrame, startFrame + fps * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [startFrame, startFrame + fps * 0.3], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, fontSize: size, fontWeight: 700, color, textAlign: "center", lineHeight: 1.3, textShadow: "0 2px 20px rgba(0,0,0,0.3)", padding: "0 40px" }}>
      {text}
    </div>
  );
};

const AnimatedBullet: React.FC<{ text: string; idx: number; baseTime: number }> = ({ text, idx, baseTime }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = (baseTime + idx * 0.2) * fps;
  const opacity = interpolate(frame, [delay, delay + fps * 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [delay, delay + fps * 0.2], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <div style={{ opacity, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: THEME.gradients.brand, flexShrink: 0 }} />
      <span style={{ fontSize: 24, color: THEME.colors.light }}>{text}</span>
    </div>
  );
};

export const FreeSalesVideo: React.FC<Props> = ({ voiceoverUrl, productName, productImageUrl, scriptSegments, customerName, features, testimonialText, testimonialAuthor, ctaText }) => {
  const { fps } = useVideoConfig();
  const totalDuration = scriptSegments.reduce((max, s) => Math.max(max, s.startTime + s.duration), 0);
  const ctaTime = totalDuration + 1;

  return (
    <AbsoluteFill>
      <GradientBackground animated />

      {voiceoverUrl && <Audio src={staticFile(voiceoverUrl)} />}

      {/* Animated script segments */}
      {scriptSegments.map((seg, i) => (
        <Sequence key={i} from={seg.startTime * fps} durationInFrames={seg.duration * fps}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatedText text={seg.text} delay={0} size={36 + Math.max(0, 20 - seg.text.length) * 2} />
          </div>
        </Sequence>
      ))}

      {/* Product showcase */}
      <Sequence from={scriptSegments.length > 0 ? (scriptSegments[Math.floor(scriptSegments.length / 2)].startTime * fps) : 0} durationInFrames={fps * 4}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, padding: 60 }}>
          <div style={{ width: "45%", aspectRatio: "1", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            <Img src={productImageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: THEME.colors.light, marginBottom: 16 }}>{productName}</div>
            {features.slice(0, 4).map((f, i) => (
              <AnimatedBullet key={i} text={f} idx={i} baseTime={0} />
            ))}
          </div>
        </div>
      </Sequence>

      {/* Testimonial */}
      {testimonialText && (
        <Sequence from={totalDuration * fps - fps * 3} durationInFrames={fps * 3}>
          <GradientBackground gradient={THEME.gradients.dark} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, gap: 16 }}>
            <div style={{ color: "#fbbf24", fontSize: 28 }}>★★★★★</div>
            <div style={{ fontSize: 28, color: THEME.colors.light, textAlign: "center", fontStyle: "italic", lineHeight: 1.4, maxWidth: "80%" }}>"{testimonialText}"</div>
            {testimonialAuthor && <div style={{ fontSize: 20, color: THEME.colors.primary }}>— {testimonialAuthor}</div>}
          </div>
        </Sequence>
      )}

      {/* CTA */}
      <Sequence from={ctaTime * fps} durationInFrames={fps * 3}>
        <CTAButton text={ctaText} />
      </Sequence>
    </AbsoluteFill>
  );
};
