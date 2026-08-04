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
        background: "#020806",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "rgba(3, 18, 14, 0.55)",
          border: "rgba(16, 185, 129, 0.15)",
        },
        brand: {
          emerald: "#10b981",
          rose: "#fda4af",
          rosegold: "#fca5a5",
          dark: "#041611",
          darker: "#020806",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(1200px circle at 50% 0px, rgba(16, 185, 129, 0.15), transparent 80%)",
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
          "50%": { opacity: 1, filter: "brightness(1.3) drop-shadow(0 0 15px rgba(16, 185, 129, 0.5))" },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(15px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(16, 185, 129, 0.15)" },
          "50%": { borderColor: "rgba(253, 164, 175, 0.5)" },
        }
      }
    },
  },
  plugins: [],
};
