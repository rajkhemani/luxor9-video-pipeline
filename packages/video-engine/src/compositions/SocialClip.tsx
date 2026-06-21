import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Video } from "remotion";
import type { SocialVideoProps } from "../schemas/video-schemas";
import { GradientBackground } from "../components/GradientBackground";
import { CTAButton } from "../components/CTAButton";
import { BulletList } from "../components/BulletList";
import { THEME } from "../theme";

export const SocialClip: React.FC<SocialVideoProps> = ({ heyGenUrl, hookText, bodyPoints, ctaText }) => {
  const { fps } = useVideoConfig();
  const s = (n: number) => n * fps;
  const hookEnd = s(2);
  const bodyEnd = hookEnd + s(bodyPoints.length * 3);
  const avatarEnd = bodyEnd + s(5);
  return (
    <AbsoluteFill>
      <GradientBackground animated />
      <Sequence from={0} durationInFrames={hookEnd}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: THEME.colors.light, textAlign: "center", lineHeight: 1.2, maxWidth: "85%", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{hookText}</div>
        </div>
      </Sequence>
      <Sequence from={hookEnd} durationInFrames={bodyEnd - hookEnd}>
        <BulletList items={bodyPoints} title="Key Points" />
      </Sequence>
      <Sequence from={bodyEnd} durationInFrames={avatarEnd - bodyEnd}>
        <Video src={heyGenUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      <Sequence from={avatarEnd} durationInFrames={s(3)}>
        <CTAButton text={ctaText} />
      </Sequence>
    </AbsoluteFill>
  );
};
