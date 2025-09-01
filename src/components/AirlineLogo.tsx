
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
        // Fallback logic based on airline
        console.warn(`Failed to load logo for ${airlineConfig.code}, falling back to default`);
        const target = e.target as HTMLImageElement;
        
        if (airlineConfig.code === 'QR') {
          // For Qatar Airways, we'll use a data URL with the uploaded logo content
          // For now, fallback to flydubai logo until QR logo is properly uploaded
          target.src = '/flydubai_logo.png';
        } else {
          target.src = '/flydubai_logo.png';
        }
      }}
    />
  );
}
