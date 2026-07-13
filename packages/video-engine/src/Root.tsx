import React from "react";
import { AbsoluteFill, Composition } from "remotion";

const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: "#0b0b12",
      color: "#ffffff",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "sans-serif",
      fontSize: 48,
      textAlign: "center",
      padding: 80,
    }}
  >
    LUXOR9 video-engine placeholder — original compositions pending
    restoration.
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition
    id="placeholder"
    component={Placeholder}
    durationInFrames={90}
    fps={30}
    width={1920}
    height={1080}
  />
);
