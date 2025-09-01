
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAirlineTheme } from '../hooks/useAirlineTheme';
import { AirlineLogo, AirlineBrandedCard, AirlineBadge, AirlineProgressBar } from './DynamicAirlineComponents';
import { getAirlineContent } from '../utils/airlineThemeUtils';

export function AirlineThemeDemo() {
  const { airlineConfig, isQatarAirways, isFlydubai } = useAirlineTheme();
  const content = getAirlineContent();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <AirlineLogo width={120} />
            <div>
              <h2 className="text-2xl font-bold text-airline-navy">
                {content.systemName}
              </h2>
              <p className="text-muted-foreground">{content.operationsCenter}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Primary Color Demo */}
            <AirlineBrandedCard className="p-4">
              <h3 className="font-semibold text-airline-primary mb-2">Primary Color</h3>
              <div className="space-y-2">
                <Button className="w-full bg-airline-primary hover:bg-airline-navy">
                  Primary Button
                </Button>
                <AirlineBadge variant="primary">Primary Badge</AirlineBadge>
                <AirlineProgressBar value={75} />
              </div>
            </AirlineBrandedCard>

            {/* Secondary Color Demo */}
            <AirlineBrandedCard className="p-4">
              <h3 className="font-semibold text-airline-secondary mb-2">Secondary Color</h3>
              <div className="space-y-2">
                <Button className="w-full bg-airline-secondary hover:bg-airline-navy">
                  Secondary Button  
                </Button>
                <AirlineBadge variant="secondary">Secondary Badge</AirlineBadge>
                <div className="text-airline-secondary">Secondary Text</div>
              </div>
            </AirlineBrandedCard>

            {/* Configuration Info */}
            <AirlineBrandedCard className="p-4">
              <h3 className="font-semibold text-airline-navy mb-2">Current Configuration</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Code:</span> 
                  <span className="font-mono ml-2">{airlineConfig.code}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Name:</span> 
                  <span className="ml-2">{airlineConfig.displayName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Primary:</span> 
                  <span className="font-mono ml-2">{airlineConfig.colors.primary}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Secondary:</span> 
                  <span className="font-mono ml-2">{airlineConfig.colors.secondary}</span>
                </div>
              </div>
            </AirlineBrandedCard>
          </div>

          {/* Theme-specific content */}
          {isQatarAirways && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-airline-primary/20">
              <h3 className="font-semibold text-airline-primary mb-2">Qatar Airways Configuration Active</h3>
              <p className="text-sm text-muted-foreground">
                The system is now configured for Qatar Airways operations with the burgundy and navy color scheme.
              </p>
            </div>
          )}

          {isFlydubai && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg border border-airline-primary/20">
              <h3 className="font-semibold text-airline-primary mb-2">Flydubai Configuration Active</h3>
              <p className="text-sm text-muted-foreground">
                The system is configured for flydubai operations with the classic blue and orange color scheme.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
