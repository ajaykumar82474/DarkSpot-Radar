import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        radar: {
          950: "#06090e",
          900: "#0a0f18",
          850: "#0e1522",
          800: "#131c2d",
          700: "#1d293f",
          600: "#2a3b59",
          500: "#3d537d",
          400: "#5d7aa8",
          300: "#8fa7d3",
          200: "#c3d3ef",
          100: "#e5edfb",
          50: "#f4f8fe",
        },
        spot: {
          dark: "#ef4444",      // High alert dark spot / missing critical
          covered: "#10b981",   // Fully sourced
          partial: "#f59e0b",   // Partially covered
          conflict: "#ec4899",  // Contradiction detected
          outdated: "#8b5cf6",  // Outdated / stale
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "sweep 4s linear infinite",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
