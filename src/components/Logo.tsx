"use client";

import React from "react";

interface LogoProps {
  variant?: "blue" | "green" | "light";
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({
  variant = "green",
  showIcon = false, // Default to false to match the text-only layout in the screenshot
  className = "",
  size = "md",
}: LogoProps) {
  // Dimensions based on size prop (adjusted for text-only and icon layouts)
  const dimensions = {
    sm: { height: 24, width: showIcon ? 150 : 120, viewBox: showIcon ? "0 0 190 32" : "0 0 155 32" },
    md: { height: 32, width: showIcon ? 190 : 150, viewBox: showIcon ? "0 0 190 32" : "0 0 155 32" },
    lg: { height: 40, width: showIcon ? 230 : 180, viewBox: showIcon ? "0 0 190 32" : "0 0 155 32" },
    xl: { height: 48, width: showIcon ? 280 : 220, viewBox: showIcon ? "0 0 190 32" : "0 0 155 32" },
  };

  const selectedSize = dimensions[size];

  // Colors based on variant
  const colors = {
    blue: {
      textStay: "#003580", // Booking Navy
      textFloow: "#003580", // Booking Navy
      textCom: "#006ce4", // Booking Light/Royal Blue
      iconFill: "#006ce4",
      iconBg: "#003580",
    },
    green: {
      textStay: "#10B981", // StayFloow Primary Green
      textFloow: "#10B981", // StayFloow Primary Green
      textCom: "#39FF14", // Fluorescent Green
      iconFill: "#39FF14",
      iconBg: "#10B981",
    },
    light: {
      textStay: "#FFFFFF", // Pure white for header
      textFloow: "#FFFFFF", // Pure white for header
      textCom: "#39FF14", // Fluorescent Green accent
      iconFill: "#39FF14",
      iconBg: "#FFFFFF",
    },
  };

  const activeColors = colors[variant];

  return (
    <svg
      height={selectedSize.height}
      width={selectedSize.width}
      viewBox={selectedSize.viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="StayFloow.com Logo"
    >
      {/* Optional: Brand Icon (Double loop representing infinite flow & location pin) */}
      {showIcon && (
        <g transform="translate(2, 4)">
          {/* Background pin-like shape */}
          <path
            d="M12 2C8.13 2 5 5.13 5 9C5 13.5 12 21 12 21S19 13.5 19 9C19 5.13 15.87 2 12 2Z"
            fill={activeColors.iconBg}
          />
          {/* Inner bed / infinite flow connection loop */}
          <path
            d="M9 10C9 8.34 10.34 7 12 7C13.66 7 15 8.34 15 10C15 11.66 13.66 13 12 13C10.34 13 9 11.66 9 10Z"
            fill={activeColors.iconFill}
          />
        </g>
      )}

      {/* Brand Text - StayFloow.com */}
      <g transform={showIcon ? "translate(30, 24)" : "translate(2, 24)"}>
        <text
          fontFamily="var(--font-inter), system-ui, -apple-system, sans-serif"
          fontSize="22"
          fontWeight="900"
          letterSpacing="-0.05em"
        >
          {/* 'Stay' in bold */}
          <tspan fill={activeColors.textStay}>Stay</tspan>
          {/* 'Floow' in bold */}
          <tspan fill={activeColors.textFloow} fontWeight="900">
            Floow
          </tspan>
          {/* '.com' in bright secondary/fluorescent color */}
          <tspan fill={activeColors.textCom} fontWeight="900">
            .com
          </tspan>
        </text>
      </g>
    </svg>
  );
}
