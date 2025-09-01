
import airlineThemes from './airlineThemes.json';

export interface AirlineTheme {
  code: string;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    navy: string;
    links: string;
  };
  logo: string;
  favicon: string;
  theme: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const airlineConfigs: Record<string, AirlineTheme> = airlineThemes;

export function getAirlineConfig(): AirlineTheme {
  const airlineCode = import.meta.env.VITE_AIRLINE_CODE || 'QR';
  return airlineConfigs[airlineCode] || airlineConfigs.FZ;
}

export function getCurrentAirlineColors() {
  const config = getAirlineConfig();
  return config.colors;
}

// Dynamic CSS variable injection
export function injectAirlineTheme() {
  const config = getAirlineConfig();
  const root = document.documentElement;
  
  // Inject airline-specific colors
  root.style.setProperty('--airline-primary', config.colors.primary);
  root.style.setProperty('--airline-secondary', config.colors.secondary);
  root.style.setProperty('--airline-navy', config.colors.navy);
  root.style.setProperty('--airline-links', config.colors.links);
  
  // Inject theme variables
  Object.entries(config.theme).forEach(([key, value]) => {
    const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--${cssVar}`, value);
  });
  
  // Ensure border color is consistent across all inputs
  root.style.setProperty('--border', '#e5e7eb');
  root.style.setProperty('--input-border', '#e5e7eb');
  
  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = config.favicon;
  } else {
    // Create favicon if it doesn't exist
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = config.favicon;
    document.head.appendChild(newFavicon);
  }
  
  // Update document title
  document.title = `${config.displayName} AERON - Airline Recovery Operations Network`;
  
  // Force re-render by updating a CSS class
  document.body.className = `${document.body.className.replace(/airline-\w+/g, '')} airline-${config.code.toLowerCase()}`.trim();
}

// Helper function to get all available airline codes
export function getAvailableAirlines(): string[] {
  return Object.keys(airlineConfigs);
}
