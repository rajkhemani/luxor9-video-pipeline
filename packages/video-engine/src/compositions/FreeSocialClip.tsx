import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Audio, interpolate, useCurrentFrame, Easing, Img, staticFile } from "remotion";
import { z } from "zod";
import { GradientBackground } from "../components/GradientBackground";
import { CTAButton } from "../components/CTAButton";
import { BulletList } from "../components/BulletList";
import { THEME } from "../theme";

export const FreeSocialClipSchema = z.object({
  voiceoverUrl: z.string().default(""),
  hookText: z.string(),
  bodyPoints: z.array(z.string()).min(1).max(5),
  ctaText: z.string().default("Follow for more"),
  backgroundImageUrl: z.string().optional(),
  showCaptions: z.boolean().default(true),
  format: z.enum(["vertical", "square", "landscape"]).default("vertical"),
});

type Props = z.infer<typeof FreeSocialClipSchema>;

const TextReveal: React.FC<{ text: string; delay: number; color?: string }> = ({ text, delay, color = THEME.colors.light }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = delay * fps;
  const chars = text.split("");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
      {chars.map((char, i) => {
        const cd = d + i * 0.03 * fps;
        const opacity = interpolate(frame, [cd, cd + fps * 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const y = interpolate(frame, [cd, cd + fps * 0.1], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
        return <span key={i} style={{ opacity, transform: `translateY(${y}px)`, color, fontSize: "inherit", fontWeight: "inherit" }}>{char}</span>;
      })}
    </div>
  );
};

export const FreeSocialClip: React.FC<Props> = ({ voiceoverUrl, hookText, bodyPoints, ctaText, backgroundImageUrl, format }) => {
  const { fps } = useVideoConfig();
  const s = (n: number) => n * fps;
  const fontSize = format === "landscape" ? 72 : 48;

  return (
    <AbsoluteFill>
      {backgroundImageUrl ? (
        <Img src={backgroundImageUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <GradientBackground animated />
      )}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />

      {voiceoverUrl && <Audio src={staticFile(voiceoverUrl)} />}

      <Sequence from={0} durationInFrames={s(3)}>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: format === "landscape" ? "0 120px" : "0 40px",
        }}>
          <div style={{ fontSize, fontWeight: 800, color: THEME.colors.light, textAlign: "center", lineHeight: 1.2 }}>
            <TextReveal text={hookText} delay={0.3} />
          </div>
        </div>
      </Sequence>

      <Sequence from={s(3)} durationInFrames={s(bodyPoints.length * 2.5)}>
        <BulletList items={bodyPoints} title="Key Points" />
      </Sequence>

      <Sequence from={s(3 + bodyPoints.length * 2.5)} durationInFrames={s(3)}>
        <CTAButton text={ctaText} subtext={format === "landscape" ? "Subscribe for more" : undefined} />
      </Sequence>
    </AbsoluteFill>
  );
};
