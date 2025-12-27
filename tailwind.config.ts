import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* =====================
         FONTS (TECH STYLE)
      ===================== */
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"], // Hero, headings
        body: ["var(--font-inter)", "sans-serif"],      // Paragraphs
        integralCF: ["var(--font-integralCF)"], // keep if used
        satoshi: ["var(--font-satoshi)"],       // keep if used
      },

      /* =====================
         SCREEN & LAYOUT
      ===================== */
      screens: {
        xs: "375px",
      },
      width: {
        frame: "77.5rem",
      },
      maxWidth: {
        frame: "77.5rem",
      },

      /* =====================
         TECHLIGENCE COLORS
      ===================== */
      colors: {
        /* Core Backgrounds */
        techDark: "#0B0F19",
        techSection: "#0F172A",
        techCard: "#111827",

        /* Brand */
        techPrimary: "#2563EB", // blue
        techAccent: "#38BDF8",  // cyan / AI glow
        techPurple: "#7C3AED",

        /* Text */
        techHeading: "#E5E7EB",
        techBody: "#94A3B8",
        techMuted: "#64748B",

        /* ShadCN compatibility (keep) */
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },

      /* =====================
         BACKGROUND EFFECTS
      ===================== */
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "tech-glow":
          "radial-gradient(circle at top, rgba(56,189,248,0.25), transparent 60%)",
      },

      /* =====================
         BORDER RADIUS
      ===================== */
      borderRadius: {
        lg: "24px",
        md: "18px",
        sm: "12px",
      },

      /* =====================
         ANIMATIONS
      ===================== */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 0 rgba(56,189,248,0.0)" },
          "100%": { boxShadow: "0 0 40px rgba(56,189,248,0.35)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: ["backdrop-blur-[2px]"],
};

export default config;
