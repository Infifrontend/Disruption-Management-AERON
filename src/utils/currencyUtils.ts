
import { getCurrency } from './airlineThemeUtils';

export function formatCurrency(amount: number, currency?: string): string {
  const airlineCurrency = currency || getCurrency();
  
  const formatters: Record<string, Intl.NumberFormat> = {
    'AED': new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }),
    'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    'EUR': new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }),
    'INR': new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
  };

  const formatter = formatters[airlineCurrency] || formatters['USD'];
  return formatter.format(amount);
}

export function getCurrencySymbol(currency?: string): string {
  const airlineCurrency = currency || getCurrency();
  
  const symbols: Record<string, string> = {
    'AED': 'د.إ',
    'USD': '$',
    'EUR': '€',
    'INR': '₹',
  };

  return symbols[airlineCurrency] || '$';
}

export function getCurrentAirlineCurrencyInfo() {
  const currency = getCurrency();
  return {
    code: currency,
    symbol: getCurrencySymbol(currency),
    formatter: (amount: number) => formatCurrency(amount, currency)
  };
}
