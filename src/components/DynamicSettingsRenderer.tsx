
import React from 'react';
import { SettingField } from './SettingField';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Save } from 'lucide-react';

interface SettingData {
  id: number;
  category: string;
  key: string;
  value: any;
  type: 'boolean' | 'number' | 'string' | 'object';
  description?: string;
  label?: string;
  created_at: string;
  updated_at: string;
  updated_by: string;
  is_active: boolean;
}

interface DynamicSettingsRendererProps {
  categoryData: SettingData[];
  categoryName: string;
  categoryTitle: string;
  categoryDescription?: string;
  icon?: React.ComponentType<{ className?: string }>;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onToggle: (key: string) => void;
  onSave: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  fieldConfigurations?: Record<string, any>;
}

export function DynamicSettingsRenderer({
  categoryData,
  categoryName,
  categoryTitle,
  categoryDescription,
  icon: Icon,
  values,
  onChange,
  onToggle,
  onSave,
  saveStatus,
  fieldConfigurations = {}
}: DynamicSettingsRendererProps) {
  
  if (!Array.isArray(categoryData) || categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-flydubai-navy">
            {Icon && <Icon className="h-5 w-5" />}
            {categoryTitle}
          </CardTitle>
          {categoryDescription && (
            <p className="text-sm text-muted-foreground">{categoryDescription}</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No settings configured for this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-flydubai-navy">
              {Icon && <Icon className="h-5 w-5" />}
              {categoryTitle}
            </CardTitle>
            {categoryDescription && (
              <p className="text-sm text-muted-foreground">{categoryDescription}</p>
            )}
          </div>
          <Button
            onClick={onSave}
            className="btn-flydubai-primary"
            disabled={saveStatus === "saving"}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === "saving" ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.map((setting) => {
          const fieldConfig = fieldConfigurations[setting.key] || {
            key: setting.key,
            displayLabel: setting.label || setting.key,
            description: setting.description,
            type: setting.type === 'boolean' ? 'boolean' : 
                   setting.type === 'number' ? 'slider' : 'string',
            min: 0,
            max: setting.type === 'number' ? 100 : undefined,
            step: setting.type === 'number' ? 1 : undefined,
            unit: setting.key.includes('Weight') || setting.key.includes('Percentage') ? '%' : 
                   setting.key.includes('Time') || setting.key.includes('Delay') ? 'minutes' : undefined
          };

          return (
            <SettingField
              key={setting.key}
              config={fieldConfig}
              value={values[setting.key] ?? setting.value}
              onChange={onChange}
              onToggle={onToggle}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
