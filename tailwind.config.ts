import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tribe: {
          DEFAULT: "#EE3C30",
          dark: "#C92D22",
          light: "#FDECEA",
        },
        // Karnataka flag gold, used sparingly next to Tribe Red
        gold: { DEFAULT: "#F2B705", dark: "#B8860B" },
        ink: "#171717",
        paper: "#FAF9F7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-kannada)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
