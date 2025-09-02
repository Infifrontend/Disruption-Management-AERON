
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
    console.log(`Loading logo for ${airlineConfig.code}: ${airlineConfig.logo}`);
    setCurrentSrc(airlineConfig.logo);
    setHasError(false);
  }, [airlineConfig.logo, airlineConfig.code]);

  const handleError = () => {
    console.warn(`Failed to load logo: ${currentSrc} for airline ${airlineConfig.code}`);
    
    // Try different fallback paths systematically
    if (currentSrc === airlineConfig.logo) {
      // First fallback: try without leading slash
      const fallbackSrc = `airlines/${airlineConfig.code}/logo.png`;
      console.log(`Trying fallback 1: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else if (currentSrc === `airlines/${airlineConfig.code}/logo.png`) {
      // Second fallback: try with leading slash again (in case of timing issues)
      const fallbackSrc = `/airlines/${airlineConfig.code}/logo.png`;
      console.log(`Trying fallback 2: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
    } else if (currentSrc === `/airlines/${airlineConfig.code}/logo.png`) {
      // Third fallback: try the generic flydubai logo
      console.log('Trying fallback 3: /flydubai_logo.png');
      setCurrentSrc('/flydubai_logo.png');
    } else {
      // Final fallback: show airline code
      console.log('All fallbacks failed, showing airline code');
      setHasError(true);
    }
  };

  const handleLoad = () => {
    console.log(`Successfully loaded logo: ${currentSrc} for airline ${airlineConfig.code}`);
  };

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gradient-to-r from-airline-primary to-airline-secondary text-white font-bold rounded border-2 border-airline-primary`}
        style={{
          minWidth: width ? `${width}px` : '40px',
          minHeight: height ? `${height}px` : '32px',
          maxHeight: height ? `${height}px` : '40px',
          maxWidth: width ? `${width}px` : 'auto',
        }}
      >
        <span className="text-xs font-semibold">{airlineConfig.code}</span>
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
      onLoad={handleLoad}
    />
  );
}
