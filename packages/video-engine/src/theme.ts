export const THEME = {
  colors: {
    primary: "#00d4ff",
    secondary: "#8b5cf6",
    dark: "#0f172a",
    light: "#f8fafc",
    accent: "#06b6d4",
    muted: "#64748b",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },
  gradients: {
    brand: "linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)",
    dark: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
    accent: "linear-gradient(135deg, #06b6d4 0%, #00d4ff 100%)",
  },
  radii: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
} as const;
