
import React from 'react';
import { useAirlineTheme } from '../hooks/useAirlineTheme';
import AirlineLogo from './AirlineLogo';

export function AirlineHeader({ children }: { children?: React.ReactNode }) {
  const { airlineConfig } = useAirlineTheme();
  
  return (
    <div className="flex items-center gap-4">
      <AirlineLogo className="responsive-logo" />
      <div className="flex-1">
        {children}
      </div>
      <div className="text-sm text-muted-foreground">
        {airlineConfig.displayName} Operations Center
      </div>
    </div>
  );
}

export function AirlineBrandedCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { airlineConfig } = useAirlineTheme();
  
  return (
    <div className={`border-l-4 border-airline-primary bg-gradient-to-r from-blue-50/30 to-transparent ${className}`}>
      {children}
    </div>
  );
}

export function AirlineBadge({ 
  children, 
  variant = "primary" 
}: { 
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "navy";
}) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  const variantClasses = {
    primary: "bg-airline-primary text-white",
    secondary: "bg-airline-secondary text-white", 
    navy: "bg-airline-navy text-white"
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export function AirlineProgressBar({ 
  value, 
  className = "" 
}: { 
  value: number;
  className?: string;
}) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="h-2 rounded-full transition-all duration-300 bg-airline-primary"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
