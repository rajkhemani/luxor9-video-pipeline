import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { resolveTheme, type ThemeConfig } from "./Root";

const headingFont = "Space Grotesk, sans-serif";
const bodyFont = "Inter, sans-serif";

// Brand colors for Quiet Power
const QUIET_POWER_THEME: ThemeConfig = {
  primaryColor: "#0EA5E9",      // Sky blue (Signal Cyan)
  accentColor: "#06B6D4",       // Cyan (Electric Blue)
  backgroundColor: "#0F172A",   // Dark navy (Midnight Black)
  surfaceColor: "#1E293B",      // Slate gray
  textColor: "#F8FAFC",         // Slate 50 (off-white)
  mutedTextColor: "#94A3B8",    // Slate 400
  headingFont: "Space Grotesk",
  bodyFont: "Inter",
  monoFont: "JetBrains Mono",
  chartColors: ["#0EA5E9", "#06B6D4", "#3B82F6", "#8B5CF6", "#10B981", "#06B6D4"],
  springConfig: { damping: 18, stiffness: 90, mass: 1 },
  transitionDuration: 0.4,
  captionHighlightColor: "#0EA5E9",
  captionBackgroundColor: "rgba(15, 23, 42, 0.6)",
};

interface QuietPowerBrandFilmProps {
  narrationSrc: string;
  durationSeconds: number;
  [key: string]: unknown;
}

const QuietPowerBrandFilm: React.FC<QuietPowerBrandFilmProps> = ({
  narrationSrc,
  durationSeconds,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const totalFrames = Math.round(durationSeconds * fps);
  const theme = resolveTheme({ themeConfig: QUIET_POWER_THEME });

  // Parse the narration script into segments for timing
  const narrationSegments = [
    { text: "Quiet Power.", start: 0.0, end: 2.0 },
    { text: "One founder. One vision. Fifteen months. Zero outside capital.", start: 2.0, end: 8.0 },
    { text: "Five tiers. One hierarchy. Total control.", start: 8.0, end: 12.0 },
    { text: "This is Luxor9OS.", start: 12.0, end: 15.0 },
    { text: "An orchestration platform where every agent has purpose.", start: 15.0, end: 20.0 },
    { text: "Where context flows upward. Where decisions cascade downward.", start: 20.0, end: 25.0 },
    { text: "Where nothing is lost. Nothing is hallucinated.", start: 25.0, end: 30.0 },
    { text: "No flashy demos. No empty promises. Just code that works.", start: 30.0, end: 35.0 },
    { text: "Architecture that scales. A system built by someone who lives and breathes this problem.", start: 35.0, end: 42.0 },
    { text: "We don't chase hype. We build infrastructure.", start: 42.0, end: 46.0 },
    { text: "Quiet Power.", start: 46.0, end: 49.0 },
    { text: "Luxor9OS. Ready for what comes next.", start: 49.0, end: 53.0 },
  ];

  // Orbital ring animation
  const getOrbitalRings = () => {
    const rings = [
      { radius: 0.15, speed: 0.2, thickness: 3, color: theme.accentColor },
      { radius: 0.25, speed: -0.15, thickness: 2, color: theme.primaryColor },
      { radius: 0.35, speed: 0.1, thickness: 2.5, color: theme.accentColor },
      { radius: 0.45, speed: -0.08, thickness: 3, color: theme.primaryColor },
      { radius: 0.55, speed: 0.05, thickness: 2, color: theme.accentColor },
    ];

    return rings.map((ring, index) => {
      const progress = (frame / fps) * ring.speed;
      const angle = progress * Math.PI * 2;
      const centerX = 50;
      const centerY = 50;
      const radiusPx = ring.radius * 400; // Scale to ~200px max radius
      
      const x = centerX + Math.cos(angle) * (radiusPx / 19.2); // Convert to percentage
      const y = centerY + Math.sin(angle) * (radiusPx / 10.8); // Convert to percentage
      
      // Pulse effect based on audio would be ideal, but using a simple pulse for now
      const pulse = Math.sin(frame / (fps * 0.8)) * 0.3 + 0.7;
      const thickness = ring.thickness * pulse;
      
      return (
        <div
          key={`ring-${index}`}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: `${thickness}px`,
            height: `${thickness}px`,
            backgroundColor: ring.color,
            borderRadius: "50%",
            filter: `blur(${thickness * 0.5}px)`,
            boxShadow: `0 0 ${thickness * 2}px ${ring.color}`,
            willChange: "transform",
          }}
        />
      );
    });
  };

  // Text reveal animation for narration segments
  const getCurrentSegment = () => {
    const timeInSeconds = frame / fps;
    return narrationSegments.find(
      seg => timeInSeconds >= seg.start && timeInSeconds <= seg.end
    ) || narrationSegments[narrationSegments.length - 1];
  };

  const currentSegment = getCurrentSegment();
  const segmentProgress = currentSegment 
    ? (frame / fps - currentSegment.start) / (currentSegment.end - currentSegment.start)
    : 0;
  const textOpacity = Math.min(1, segmentProgress * 3); // Fade in over first third of segment

  return (
    <AbsoluteFill style={{ background: theme.backgroundColor }}>
      {/* Orbital rings animation */}
      <div style={{ pointerEvents: "none" }}>
        {getOrbitalRings()}
      </div>
      
      {/* Main text content */}
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: theme.textColor,
          fontFamily: headingFont,
          fontSize: 48,
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
          opacity: textOpacity,
          willChange: "opacity",
          textShadow: `0 0 20px rgba(${parseInt(theme.accentColor.slice(1,3),16)}, ${parseInt(theme.accentColor.slice(3,5),16)}, ${parseInt(theme.accentColor.slice(5,7),16)}, 0.3)`,
        }}
      >
        {currentSegment?.text}
      </div>
      
      {/* Subtle bottom branding */}
      <div 
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          color: theme.mutedTextColor,
          fontFamily: bodyFont,
          fontSize: 24,
          letterSpacing: "0.5px",
          opacity: 0.7,
        }}
      >
        Luxor9OS
      </div>
      
      {/* Narration audio */}
      {narrationSrc && (
        <Audio 
          src={narrationSrc} 
          volume={0.8} 
        />
      )}
    </AbsoluteFill>
  );
};

export default QuietPowerBrandFilm;
