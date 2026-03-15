import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        border: "#E2E8F0",
        "border-active": "#3B82F6",
        primary: "#3B82F6",
        accent: "#06D6A0",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-main": "#0F172A",
        "text-muted": "#475569",
        "text-dim": "#94A3B8",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
