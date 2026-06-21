import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { absoluteFill } from "../styles";

export const GradientBackground: React.FC<{ gradient?: string; animated?: boolean }> = ({ gradient = THEME.gradients.dark, animated = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shift = animated ? interpolate(frame, [0, fps * 10], [0, 100]) : 0;
  return <div style={{ ...absoluteFill, background: gradient, backgroundSize: animated ? "200% 200%" : undefined, backgroundPosition: animated ? `${shift}% ${shift}%` : undefined }} />;
};
