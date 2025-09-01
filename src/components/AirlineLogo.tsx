
import React from 'react';
import { useAirlineTheme } from '../hooks/useAirlineTheme';

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
  alt 
}: AirlineLogoProps) {
  const { airlineConfig } = useAirlineTheme();
  
  const logoAlt = alt || `${airlineConfig.displayName} Logo`;
  
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
        // Fallback to a default logo if airline-specific logo fails to load
        console.warn(`Failed to load logo for ${airlineConfig.code}, falling back to default`);
        (e.target as HTMLImageElement).src = '/flydubai_logo.png';
      }}
    />
  );
}
