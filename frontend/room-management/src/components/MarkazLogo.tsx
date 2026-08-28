import React from "react";

interface MarkazLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
  stacked?: boolean;
  subtitle?: string;
}

export const MarkazEmblem: React.FC<{ size?: number; className?: string; strokeColor?: string; goldColor?: string }> = ({
  size = 42,
  className = "",
  strokeColor = "currentColor",
  goldColor = "#D49B3A",
}) => {
  return (
    <svg
      width={size}
      height={size * 1.08}
      viewBox="0 0 100 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      {/* Outer Capsule / Oval Ring */}
      <rect
        x="6"
        y="6"
        width="88"
        height="96"
        rx="44"
        stroke={strokeColor}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Internal Golden Butterfly / Leaf Flourish */}
      {/* Upper Leaf / Wing */}
      <path
        d="M 28 54 C 28 32 46 22 66 22 C 82 22 84 38 66 48 C 52 56 34 54 28 54 Z"
        stroke={goldColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Lower Leaf / Wing */}
      <path
        d="M 28 54 C 28 74 46 86 64 86 C 80 86 84 70 66 60 C 52 52 34 54 28 54 Z"
        stroke={goldColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Center Spine Curve */}
      <path
        d="M 28 30 C 28 54 38 78 50 84"
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export const MarkazLogo: React.FC<MarkazLogoProps> = ({
  size = 40,
  showText = true,
  textColor = "inherit",
  className = "",
  stacked = false,
  subtitle,
}) => {
  return (
    <div
      className={`markaz-logo-container ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: stacked ? "8px" : "12px",
        flexDirection: stacked ? "column" : "row",
        textAlign: stacked ? "center" : "left",
      }}
    >
      <MarkazEmblem size={size} strokeColor="currentColor" goldColor="#D49B3A" />

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <div style={{ display: "flex", flexDirection: "column", fontWeight: 800, letterSpacing: "0.08em", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
            <span style={{ fontSize: `${Math.max(12, size * 0.38)}px`, color: textColor }}>MARKAZ</span>
            <span style={{ fontSize: `${Math.max(12, size * 0.38)}px`, color: "#D49B3A" }}>UNANI</span>
            <span style={{ fontSize: `${Math.max(12, size * 0.38)}px`, color: textColor }}>HOSPITAL</span>
          </div>
          {subtitle && (
            <span style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-muted, #94a3b8)", marginTop: "3px", letterSpacing: "0.02em" }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
