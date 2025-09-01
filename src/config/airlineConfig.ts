
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
}

export const airlineConfigs: Record<string, AirlineTheme> = {
  FZ: {
    code: 'FZ',
    name: 'flydubai',
    displayName: 'flydubai',
    colors: {
      primary: '#0066CC',
      secondary: '#ff8200',
      navy: '#001f3f',
      links: '#0066CC'
    },
    logo: '/airlines/FZ/logo.png',
    favicon: '/airlines/FZ/favicon.ico'
  },
  QR: {
    code: 'QR',
    name: 'qatar-airways',
    displayName: 'Qatar Airways',
    colors: {
      primary: '#8e2157',
      secondary: '#120c80',
      navy: '#2c1810',
      links: '#4a525d'
    },
    logo: '/airlines/QR/logo.png',
    favicon: '/airlines/QR/favicon.ico'
  }
};

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
  
  root.style.setProperty('--airline-primary', config.colors.primary);
  root.style.setProperty('--airline-secondary', config.colors.secondary);
  root.style.setProperty('--airline-navy', config.colors.navy);
  root.style.setProperty('--airline-links', config.colors.links);
  
  // Update favicon
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = config.favicon;
  }
}
