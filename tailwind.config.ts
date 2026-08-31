import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom color palette tailored for the dashboard interface
        ink: "var(--color-ink)", // Deep, rich background/text
        paper: "var(--color-paper)", // Clean, minimal background
        sidebar: "var(--color-sidebar)", // Sidebar background
        surface: "var(--color-surface)",
        'surface-hover': "var(--color-surface-hover)",
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Primary brand (Indigo/Violet)
          600: '#4F46E5', // Violet
          700: '#4338CA',
          800: '#3730A3', // VioletDeep
          900: '#312E81',
        },
        slate: {
          50: "var(--color-surface-hover)",
          100: "var(--color-border)",
          200: "var(--color-border)",
          300: "var(--color-muted)",
          400: "var(--color-muted-foreground)",
          500: "var(--color-muted-foreground)",
          600: "var(--color-muted-foreground)",
          700: "var(--color-ink)",
          800: "var(--color-ink)",
          900: "var(--color-ink)",
          soft: "var(--color-muted-foreground)",
          muted: "var(--color-muted-foreground)",
        },
        accent: {
          amber: "#F59E0B",
          sage: "#10B981",
          coral: "#EF4444",
          cyan: "#06B6D4",
          rose: "#F43F5E",
          emerald: "#059669",
        }
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // Custom animation keyframes for UI transitions
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
