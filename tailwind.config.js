/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030014",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(17, 12, 28, 0.45)",
          border: "rgba(124, 58, 237, 0.15)",
        },
        brand: {
          purple: "#7c3aed",
          pink: "#db2777",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          dark: "#0b051a",
          darker: "#030014",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(1200px circle at 50% 0px, rgba(124, 58, 237, 0.12), transparent 80%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "border-glow": "borderGlow 6s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: 0.8, filter: "brightness(1)" },
          "50%": { opacity: 1, filter: "brightness(1.3) drop-shadow(0 0 15px rgba(139, 92, 246, 0.5))" },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(124, 58, 237, 0.15)" },
          "50%": { borderColor: "rgba(6, 182, 212, 0.5)" },
        }
      }
    },
  },
  plugins: [],
};
