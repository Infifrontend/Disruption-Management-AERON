
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
  const logoSrc = airlineConfig.logo;
  
  // Create fallback logo path
  const fallbackLogo = '/flydubai_logo.png';
  
  return (
    <img
      src={logoSrc}
      alt={logoAlt}
      className={className}
      width={width}
      height={height}
      style={{
        maxHeight: height ? `${height}px` : undefined,
        maxWidth: width ? `${width}px` : undefined,
      }}
      onError={(e) => {
        console.warn(`Failed to load logo for ${airlineConfig.code}: ${logoSrc}`);
        const target = e.target as HTMLImageElement;
        
        // Try the fallback if not already tried
        if (target.src !== window.location.origin + fallbackLogo) {
          target.src = fallbackLogo;
        } else {
          // If even the fallback fails, create a text-based logo
          target.style.display = 'none';
          
          // Create a fallback div with airline code
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'flex items-center justify-center bg-airline-primary text-white font-bold rounded px-3 py-1';
          fallbackDiv.style.fontSize = '14px';
          fallbackDiv.textContent = airlineConfig.code;
          
          // Replace the img with the fallback div
          if (target.parentNode) {
            target.parentNode.insertBefore(fallbackDiv, target);
          }
        }
      }}
    />
  );
}
