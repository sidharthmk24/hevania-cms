import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        /* Brand colors from Hevania */
        brand: {
          forest: "#2F3E2F",
          green: "#A8C3A0",
          sage: "#C7D9C1",
          gold: "#C6A75E",
          cream: "#F5F5F0",
          dark: "#1A221A",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(47, 62, 47, 0.08), 0 1px 2px -1px rgba(47, 62, 47, 0.08)",
        "card-hover": "0 4px 12px 0 rgba(47, 62, 47, 0.12), 0 2px 4px -2px rgba(47, 62, 47, 0.08)",
        "warm-sm": "0 1px 2px 0 rgba(47, 62, 47, 0.06)",
        "warm-lg": "0 10px 15px -3px rgba(47, 62, 47, 0.1), 0 4px 6px -4px rgba(47, 62, 47, 0.1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
