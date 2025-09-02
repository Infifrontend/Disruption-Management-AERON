import React, { useState } from "react";
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
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(airlineConfig.logo);

  const logoAlt = alt || `${airlineConfig.displayName} Logo`;

  // Update src when airline config changes
  React.useEffect(() => {
    setCurrentSrc(airlineConfig.logo);
    setHasError(false);
  }, [airlineConfig.logo]);

  const handleError = () => {
    console.warn(`Failed to load logo: ${currentSrc} for airline ${airlineConfig.code}`);
    
    // Try different fallback paths
    if (currentSrc === airlineConfig.logo) {
      // First fallback: try with absolute path
      const fallbackSrc = `/airlines/${airlineConfig.code}/logo.png`;
      console.log(`Trying fallback: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else if (currentSrc.includes(`/airlines/${airlineConfig.code}/logo.png`)) {
      // Second fallback: try generic logo
      console.log('Trying generic logo fallback');
      setCurrentSrc('/flydubai_logo.png');
    } else {
      // Final fallback: hide the image
      console.log('All fallbacks failed, hiding logo');
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
        <span className="text-xs text-gray-500">{airlineConfig.code}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={logoAlt}
      className={className}
      width={width}
      height={height}
      style={{
        maxHeight: height ? `${height}px` : undefined,
        maxWidth: width ? `${width}px` : undefined,
      }}
      onError={handleError}
    />
  );
}
