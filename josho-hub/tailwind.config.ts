import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        joshoNavy: "#1B2A4A",
        joshoBlue: "#2E75B6"
      },
      boxShadow: {
        panel: "0 8px 30px rgba(0, 0, 0, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
