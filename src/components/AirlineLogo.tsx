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
        console.warn(`Failed to load logo for ${airlineConfig.code}, trying fallback`);
        const target = e.target as HTMLImageElement;

        // Try different fallback strategies
        if (!target.src.includes('flydubai_logo.png')) {
          target.src = '/flydubai_logo.png';
        } else if (!target.src.includes('airlines/FZ/logo.png')) {
          target.src = '/airlines/FZ/logo.png';
        } else {
          // Create a text-based fallback
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="text-white font-bold text-lg">${airlineConfig.displayName}</div>`;
          }
        }
      }}
    />
  );
}