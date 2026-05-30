import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        mulish: ["var(--font-mulish)", "sans-serif"],
        "noto-sc-black": ["var(--font-noto-sc-black)", "sans-serif"],
      },
      zIndex: {
        "65": "65",
        "70": "70",
        "80": "80",
      },
    },
  },
  plugins: [],
};

export default config;
