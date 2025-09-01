
import airlineThemesData from './airlineThemes.json';

export interface AirlineTheme {
  code: string;
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    navy: string;
    links: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
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
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export const airlineConfigs: Record<string, AirlineTheme> = airlineThemesData as Record<string, AirlineTheme>;

export function getAirlineConfig(): AirlineTheme {
  const airlineCode = import.meta.env.VITE_AIRLINE_CODE || 'FZ';
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
  
  // Inject airline-specific color variables
  root.style.setProperty('--airline-primary', config.colors.primary);
  root.style.setProperty('--airline-secondary', config.colors.secondary);
  root.style.setProperty('--airline-navy', config.colors.navy);
  root.style.setProperty('--airline-links', config.colors.links);
  root.style.setProperty('--airline-accent', config.colors.accent);
  root.style.setProperty('--airline-success', config.colors.success);
  root.style.setProperty('--airline-warning', config.colors.warning);
  root.style.setProperty('--airline-error', config.colors.error);
  
  // Inject theme variables
  root.style.setProperty('--background', config.theme.background);
  root.style.setProperty('--foreground', config.theme.foreground);
  root.style.setProperty('--card', config.theme.card);
  root.style.setProperty('--card-foreground', config.theme.cardForeground);
  root.style.setProperty('--popover', config.theme.popover);
  root.style.setProperty('--popover-foreground', config.theme.popoverForeground);
  root.style.setProperty('--muted', config.theme.muted);
  root.style.setProperty('--muted-foreground', config.theme.mutedForeground);
  root.style.setProperty('--border', config.theme.border);
  root.style.setProperty('--input', config.theme.input);
  root.style.setProperty('--ring', config.theme.ring);
  
  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = config.favicon;
  }
  
  // Update document title
  document.title = `${config.displayName} AERON - Airline Recovery Operations Network`;
}

// Helper function to get all available airline codes
export function getAvailableAirlines(): string[] {
  return Object.keys(airlineConfigs);
}

// Helper function to switch airline theme (for admin use)
export function switchAirlineTheme(airlineCode: string) {
  if (airlineConfigs[airlineCode]) {
    // This would require environment variable update in production
    console.log(`Switching to ${airlineCode} theme would require environment update`);
    return true;
  }
  return false;
}
