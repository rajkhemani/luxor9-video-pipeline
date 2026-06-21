import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, Img, Easing } from "remotion";
import { THEME } from "../theme";
import { absoluteFill } from "../styles";

export const ProductCard: React.FC<{ imageUrl: string; productName: string; originalPrice?: number; discountedPrice?: number; features: string[] }> = ({ imageUrl, productName, originalPrice, discountedPrice, features }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardOpacity = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(frame, [0, fps * 0.5], [100, 0], { extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  return (
    <div style={{ ...absoluteFill, display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 40, opacity: cardOpacity, transform: `translateY(${cardY}px)` }}>
      <div style={{ width: "45%", aspectRatio: "1", borderRadius: THEME.radii.lg, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <Img src={imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: THEME.colors.light }}>{productName}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          {originalPrice && <span style={{ fontSize: 28, color: THEME.colors.muted, textDecoration: "line-through" }}>${originalPrice}</span>}
          {discountedPrice && <span style={{ fontSize: 48, fontWeight: 800, color: THEME.colors.success }}>${discountedPrice}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {features.slice(0, 4).map((f, i) => {
            const d = fps * 0.8 + i * fps * 0.15;
            const o = interpolate(frame, [d, d + fps * 0.2], [0, 1], { extrapolateRight: "clamp" });
            const x = interpolate(frame, [d, d + fps * 0.2], [-20, 0], { extrapolateRight: "clamp" });
            return <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, opacity: o, transform: `translateX(${x}px)` }}>
              <span style={{ color: THEME.colors.primary, fontSize: 20 }}>✦</span>
              <span style={{ fontSize: 20, color: THEME.colors.light }}>{f}</span>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
};
