import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { absoluteFill } from "../styles";

export const CTAButton: React.FC<{ text: string; subtext?: string; urgency?: string }> = ({ text, subtext, urgency }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = interpolate(frame % fps, [0, fps * 0.5, fps], [1, 1.05, 1]);
  const opacity = interpolate(frame, [0, fps * 0.3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ ...absoluteFill, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, opacity }}>
      {urgency && <div style={{ fontSize: 24, color: THEME.colors.warning, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>⚡ {urgency}</div>}
      <div style={{ padding: "24px 64px", borderRadius: THEME.radii.xl, background: THEME.gradients.brand, transform: `scale(${pulse})`, boxShadow: `0 0 40px ${THEME.colors.primary}40` }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: THEME.colors.light }}>{text}</span>
      </div>
      {subtext && <div style={{ fontSize: 20, color: THEME.colors.muted }}>{subtext}</div>}
    </div>
  );
};
