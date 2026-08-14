import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Img } from "remotion";
import { THEME } from "../theme";
import { fill } from "../styles";

export const AvatarOverlay: React.FC<{
  avatarUrl: string; customerName?: string; subtitle?: string;
}> = ({ avatarUrl, customerName, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" });
  const slideIn = interpolate(frame, [0, fps * 0.5], [50, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", inset: 0, opacity, display: "flex", alignItems: "center", gap: 40, padding: 60 }}>
      <div style={{ width: "35%", aspectRatio: "9/16", borderRadius: THEME.radii.lg, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", transform: `translateX(${slideIn}px)` }}>
        <Img src={avatarUrl} style={fill} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, transform: `translateX(${-slideIn}px)` }}>
        {customerName && <div style={{ fontSize: 48, fontWeight: 700, color: THEME.colors.light, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>{customerName}</div>}
        {subtitle && <div style={{ fontSize: 28, fontWeight: 400, color: THEME.colors.primary }}>{subtitle}</div>}
      </div>
    </div>
  );
};
