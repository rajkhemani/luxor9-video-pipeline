import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Img } from "remotion";
import { THEME } from "../theme";
import { absoluteFill } from "../styles";

export const LogoIntro: React.FC<{ companyName?: string; tagline?: string; logoSrc?: string }> = ({ companyName = "LUXOR9", tagline, logoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = fps * 1.5;
  const scale = interpolate(frame, [0, dur * 0.3, dur * 0.7, dur], [2, 1, 1, 0.8]);
  const opacity = interpolate(frame, [0, dur * 0.2, dur * 0.8, dur], [0, 1, 1, 0]);
  const blur = interpolate(frame, [0, dur * 0.3], [20, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ ...absoluteFill, background: THEME.gradients.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, opacity, transform: `scale(${scale})`, filter: `blur(${blur}px)` }}>
      {logoSrc ? <Img src={logoSrc} style={{ width: 120, height: 120 }} /> : (
        <div style={{ fontSize: 64, fontWeight: 800, background: THEME.gradients.brand, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{companyName}</div>
      )}
      {tagline && <div style={{ fontSize: 20, color: THEME.colors.muted, letterSpacing: 4, textTransform: "uppercase" }}>{tagline}</div>}
    </div>
  );
};
