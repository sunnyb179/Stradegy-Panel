import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#090a0f",
        panel: "#11131a",
        line: "#252936",
        signal: "#7dd3fc",
        mint: "#7ee7b8",
        amber: "#f6c568",
      },
      boxShadow: {
        glow: "0 0 40px rgba(125, 211, 252, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
