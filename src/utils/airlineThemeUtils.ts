
import { getAirlineConfig } from '../config/airlineConfig';

export function getAirlineSpecificText(texts: Record<string, string>): string {
  const config = getAirlineConfig();
  return texts[config.code] || texts.default || texts.FZ || Object.values(texts)[0];
}

export function getAirlineSpecificClass(baseClass: string, airlineCode?: string): string {
  const config = getAirlineConfig();
  const code = airlineCode || config.code;
  
  // Convert legacy flydubai classes to dynamic airline classes
  if (baseClass.includes('flydubai')) {
    return baseClass.replace('flydubai', 'airline');
  }
  
  return `${baseClass}-${code.toLowerCase()}`;
}

export function generateAirlineSpecificStyles(cssProperty: string, value: string) {
  const config = getAirlineConfig();
  
  return {
    [cssProperty]: value.includes('var(--airline-') ? value : 
      value.replace(/#[0-9a-fA-F]{6}/, config.colors.primary)
  };
}

export function isCurrentAirline(airlineCode: string): boolean {
  const config = getAirlineConfig();
  return config.code === airlineCode.toUpperCase();
}

// Helper to get airline-specific text content
export function getAirlineContent() {
  const config = getAirlineConfig();
  
  return {
    companyName: config.displayName,
    systemName: `${config.displayName} AERON`,
    shortName: config.name,
    code: config.code,
    operationsCenter: `${config.displayName} Operations Center`,
    recoverySystem: `${config.displayName} Airline Recovery Operations Network`
  };
}
