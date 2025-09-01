
// Utility to help migrate existing hardcoded Flydubai classes to dynamic airline classes
export const classNameMigrationMap = {
  // Color classes
  'text-flydubai-blue': 'text-airline-primary',
  'text-flydubai-orange': 'text-airline-secondary', 
  'text-flydubai-navy': 'text-airline-navy',
  'bg-flydubai-blue': 'bg-airline-primary',
  'bg-flydubai-orange': 'bg-airline-secondary',
  'bg-flydubai-navy': 'bg-airline-navy',
  'border-flydubai-blue': 'border-airline-primary',
  'border-flydubai-orange': 'border-airline-secondary',
  'border-flydubai-navy': 'border-airline-navy',
  
  // Hover states
  'hover:bg-flydubai-blue': 'hover:bg-airline-primary',
  'hover:bg-flydubai-orange': 'hover:bg-airline-secondary',
  'hover:text-flydubai-blue': 'hover:text-airline-primary',
  
  // Focus states
  'focus:border-flydubai-blue': 'focus:border-airline-primary',
  'focus:ring-flydubai-blue': 'focus:ring-airline-primary',
};

export function migrateClassName(className: string): string {
  let migratedClassName = className;
  
  Object.entries(classNameMigrationMap).forEach(([oldClass, newClass]) => {
    migratedClassName = migratedClassName.replace(new RegExp(oldClass, 'g'), newClass);
  });
  
  return migratedClassName;
}

export function migrateInlineStyles(styles: Record<string, string>): Record<string, string> {
  const migratedStyles = { ...styles };
  
  Object.entries(migratedStyles).forEach(([property, value]) => {
    // Replace hardcoded Flydubai colors with CSS variables
    if (typeof value === 'string') {
      migratedStyles[property] = value
        .replace(/#0066CC/g, 'var(--airline-primary)')
        .replace(/#ff8200/g, 'var(--airline-secondary)')
        .replace(/#001f3f/g, 'var(--airline-navy)');
    }
  });
  
  return migratedStyles;
}
