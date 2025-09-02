
import React from 'react';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { SettingsFieldConfig } from '../utils/settingsStorage';

interface SettingFieldProps {
  config: SettingsFieldConfig;
  value: any;
  onChange: (key: string, value: any) => void;
  onToggle?: (key: string) => void;
}

export function SettingField({ config, value, onChange, onToggle }: SettingFieldProps) {
  const renderField = () => {
    switch (config.type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={() => onToggle?.(config.key)}
            className="switch-flydubai"
          />
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{config.displayLabel}</Label>
              <Badge className="bg-gray-100 text-gray-800">
                {value}{config.unit || ''}
              </Badge>
            </div>
            <Slider
              value={Array.isArray(value) ? value : [Number(value) || 0]}
              onValueChange={(newValue) => onChange(config.key, newValue)}
              max={config.max || 100}
              min={config.min || 0}
              step={config.step || 1}
              className="w-full slider-flydubai"
            />
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{config.displayLabel}</Label>
            <Select
              value={value}
              onValueChange={(newValue) => onChange(config.key, newValue)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">{config.displayLabel}</Label>
              {config.description && (
                <p className="text-xs text-muted-foreground">{config.description}</p>
              )}
            </div>
            <Switch
              checked={value}
              onCheckedChange={() => onToggle?.(config.key)}
              className="switch-flydubai"
            />
          </div>
        );
    }
  };

  if (config.type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{config.displayLabel}</Label>
          {config.description && (
            <p className="text-xs text-muted-foreground">{config.description}</p>
          )}
        </div>
        {renderField()}
      </div>
    );
  }

  return <div className="space-y-2">{renderField()}</div>;
}
