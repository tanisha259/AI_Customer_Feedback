import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14152B",
        paper: "#FAF8F3",
        violet: "#6E56CF",
        violetDeep: "#5642A6",
        amber: "#E3A33E",
        sage: "#4F9A73",
        coral: "#D9534F",
        slate: {
          soft: "#8A8AA0",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
