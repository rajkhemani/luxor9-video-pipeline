import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig, Video, Img } from "remotion";
import type { ProductDemoProps } from "../schemas/video-schemas";
import { GradientBackground } from "../components/GradientBackground";
import { CTAButton } from "../components/CTAButton";
import { LogoIntro } from "../components/LogoIntro";
import { THEME } from "../theme";

export const ProductDemo: React.FC<ProductDemoProps> = ({ heygenIntroUrl, heygenIntroDuration, heygenOutroUrl, heygenOutroDuration, productName, productTagline, demoSteps, primaryCta, secondaryCta }) => {
  const { fps } = useVideoConfig();
  const s = (n: number) => Math.round(n * fps);
  let cursor = s(1);
  const introEnd = cursor + s(heygenIntroDuration);
  cursor = introEnd;
  let stepTotal = 0;
  for (const st of demoSteps) stepTotal += s(st.duration);
  const stepsEnd = cursor + stepTotal;
  cursor = stepsEnd;
  const outroEnd = cursor + s(heygenOutroDuration);
  cursor = outroEnd;
  const ctaEnd = cursor + s(3);
  return (
    <AbsoluteFill>
      <GradientBackground />
      <Sequence from={0} durationInFrames={s(1)}>
        <GradientBackground gradient={THEME.gradients.brand} />
        <LogoIntro companyName={productName} tagline={productTagline} />
      </Sequence>
      <Sequence from={s(1)} durationInFrames={introEnd - s(1)}>
        <Video src={heygenIntroUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      {demoSteps.map((step, idx) => {
        const stepStart = introEnd + demoSteps.slice(0, idx).reduce((sum, st) => sum + Math.round(st.duration * fps), 0);
        return (
          <Sequence key={idx} from={stepStart} durationInFrames={Math.round(step.duration * fps)}>
            <GradientBackground gradient={THEME.gradients.dark} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
              {step.screenshotUrl && <Img src={step.screenshotUrl} style={{ flex: 1, width: "100%", objectFit: "contain", padding: 40 }} />}
              <div style={{ padding: "24px 40px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: THEME.gradients.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: THEME.colors.light }}>{idx + 1}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: THEME.colors.light }}>{step.title}</div>
                  <div style={{ fontSize: 16, color: THEME.colors.muted }}>{step.description}</div>
                </div>
              </div>
            </div>
          </Sequence>
        );
      })}
      <Sequence from={stepsEnd} durationInFrames={outroEnd - stepsEnd}>
        <Video src={heygenOutroUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      <Sequence from={outroEnd} durationInFrames={ctaEnd - outroEnd}>
        <CTAButton text={primaryCta.text} subtext={secondaryCta?.text} />
      </Sequence>
    </AbsoluteFill>
  );
};
