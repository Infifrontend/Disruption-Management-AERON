
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Dynamic airline colors (CSS variables)
        'airline-primary': 'var(--airline-primary)',
        'airline-secondary': 'var(--airline-secondary)',
        'airline-navy': 'var(--airline-navy)',
        'airline-links': 'var(--airline-links)',
        
        // Consistent border colors
        'input-border': '#e5e7eb',
        'light-border': '#e5e7eb',
        'airline-links': 'var(--airline-links)',
        
        // Legacy Flydubai colors (mapped to dynamic variables for backward compatibility)
        'flydubai-blue': 'var(--airline-primary)',
        'flydubai-orange': 'var(--airline-secondary)',
        'flydubai-navy': 'var(--airline-navy)',
        'flydubai-progress-blue': 'var(--airline-primary)',
        'flydubai-progress-bg': '#f0fbff',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
