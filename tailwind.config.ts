import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A", 
        paper: "#F1F5F9", 
        violet: "#4F46E5", 
        violetDeep: "#3730A3", 
        amber: "#F59E0B",
        sage: "#10B981", 
        coral: "#EF4444", 
        slate: {
          soft: "#64748B", 
        },
        surface: "#FFFFFF",
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
};
export default config;
