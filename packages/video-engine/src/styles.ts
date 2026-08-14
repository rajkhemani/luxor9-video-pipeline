import { THEME } from "./theme";

export const fill: React.CSSProperties = {
  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
};

export const absoluteFill: React.CSSProperties = {
  position: "absolute", inset: 0,
};

export const flexCenter: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
};

export const flexCol: React.CSSProperties = {
  ...flexCenter, flexDirection: "column",
};

export const gradientBg: React.CSSProperties = {
  ...absoluteFill, background: THEME.gradients.brand,
};

export const darkBg: React.CSSProperties = {
  ...absoluteFill, background: THEME.gradients.dark,
};
