import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#EDF1F5",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        border: "#D8DEE6",
        "border-active": "#3B82A8",
        primary: "#3B82A8",
        accent: "#2E7399",
        warning: "#D4915E",
        danger: "#C75B5B",
        "text-main": "#1B2A3D",
        "text-muted": "#5A6B7B",
        "text-dim": "#8A99AB",
        navy: "#1B2A3D",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient-x": "gradient-x 6s ease infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
