import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Legacy — keep for backward compat
        joshoNavy: "#1a0000",
        joshoBlue: "#e50914",
        // Design system — Netflix × Noir
        josho: {
          bg: "#0a0a0a",
          surface: "#141414",
          elevated: "#1f1f1f",
          border: "#2a2a2a",
          glow: "#5c0000"
        },
        gold: "#f5a623",
        electric: "#e50914",   // Netflix red as primary accent
        teal: "#00d4aa",
        crimson: "#e50914"     // unified to Netflix red
      },
      textColor: {
        primary: "#ffffff",
        secondary: "#a3a3a3",
        muted: "#525252"
      },
      boxShadow: {
        panel: "0 8px 30px rgba(0, 0, 0, 0.6)",
        gold: "0 0 20px rgba(245, 166, 35, 0.4), 0 0 40px rgba(245, 166, 35, 0.15)",
        electric: "0 0 20px rgba(229, 9, 20, 0.5), 0 0 60px rgba(229, 9, 20, 0.2)",
        teal: "0 0 20px rgba(0, 212, 170, 0.4), 0 0 40px rgba(0, 212, 170, 0.15)",
        crimson: "0 0 20px rgba(229, 9, 20, 0.5), 0 0 60px rgba(229, 9, 20, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(245, 166, 35, 0.3), 0 0 20px rgba(245, 166, 35, 0.1)"
          },
          "50%": {
            boxShadow: "0 0 25px rgba(245, 166, 35, 0.6), 0 0 50px rgba(245, 166, 35, 0.25)"
          }
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "shimmer-dark": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        spotlight: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.4)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "shimmer-dark": "shimmer-dark 2s linear infinite",
        float: "float 3s ease-in-out infinite",
        spotlight: "spotlight 8s ease infinite",
        "pulse-dot": "pulse-dot 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out"
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
