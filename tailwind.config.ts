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
        ink: "#171717",
        paper: "#FAF9F7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
