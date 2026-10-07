import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marnostoc: {
          950: "#08080a",
          900: "#0f0f13",
          850: "#141419",
          800: "#1c1c24",
          700: "#272733",
          600: "#383849",
          accent: "#00f2fe",
          accentHover: "#4facfe",
          pink: "#ff007f",
        },
      },
    },
  },
  plugins: [],
};
export default config;