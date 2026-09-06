import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 24px 70px rgba(89, 71, 255, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
