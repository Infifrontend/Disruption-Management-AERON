import React from "react";
import { useAirlineTheme } from "../hooks/useAirlineTheme";

interface AirlineLogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function AirlineLogo({
  className = "responsive-logo",
  width,
  height,
  alt,
}: AirlineLogoProps) {
  const { airlineConfig } = useAirlineTheme();

  const logoAlt = alt || `${airlineConfig.displayName} Logo`;
  // console.log(airlineConfig.logo, "tetets");
  return (
    <img
      src={airlineConfig.logo}
      alt={logoAlt}
      className={className}
      width={width}
      height={height}
      style={{
        maxHeight: height ? `${height}px` : undefined,
        maxWidth: width ? `${width}px` : undefined,
      }}
      onError={(e) => {
        console.warn(
          `Failed to load logo for ${airlineConfig.code}, trying fallback`,
        );
        const target = e.target as HTMLImageElement;
        console.log(target.src);
        // Try the public folder fallback first
        if (target.src !== "/logo.png") {
          target.src = "public" + airlineConfig.logo;
        } else {
          // If even the fallback fails, hide the image
          target.style.display = "none";
        }
      }}
    />
  );
}
