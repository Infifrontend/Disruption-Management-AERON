
import { useEffect, useState } from 'react';
import { getAirlineConfig, injectAirlineTheme, type AirlineTheme } from '../config/airlineConfig';

export function useAirlineTheme() {
  const [airlineConfig, setAirlineConfig] = useState<AirlineTheme>(getAirlineConfig());

  useEffect(() => {
    // Inject theme variables on mount
    injectAirlineTheme();
    
    // Listen for environment changes (if needed for dynamic switching)
    const config = getAirlineConfig();
    setAirlineConfig(config);
  }, []);

  const updateAirlineTheme = (airlineCode: string) => {
    // This would be used if we want to switch themes dynamically at runtime
    // For now, it requires environment variable change and reload
    console.warn('Dynamic airline switching requires environment variable update and page reload');
  };

  return {
    airlineConfig,
    updateAirlineTheme,
    isFlydubai: airlineConfig.code === 'FZ',
    isQatarAirways: airlineConfig.code === 'QR'
  };
}
