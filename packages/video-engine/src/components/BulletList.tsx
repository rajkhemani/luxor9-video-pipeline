import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { THEME } from "../theme";
import { absoluteFill } from "../styles";

export const BulletList: React.FC<{ items: string[]; title?: string }> = ({ items, title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ ...absoluteFill, display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, gap: 24 }}>
      {title && <div style={{ fontSize: 36, fontWeight: 700, color: THEME.colors.light, marginBottom: 16, textAlign: "center" }}>{title}</div>}
      {items.map((item, i) => {
        const d = fps * 0.5 + i * fps * 0.2;
        const o = interpolate(frame, [d, d + fps * 0.2], [0, 1], { extrapolateRight: "clamp" });
        const x = interpolate(frame, [d, d + fps * 0.2], [-30, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
        return <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, opacity: o, transform: `translateX(${x}px)` }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.gradients.brand, flexShrink: 0 }} />
          <div style={{ fontSize: 24, color: THEME.colors.light, lineHeight: 1.4 }}>{item}</div>
        </div>;
      })}
    </div>
  );
};
