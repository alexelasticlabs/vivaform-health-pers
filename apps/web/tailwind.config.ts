import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        card: "hsl(var(--card))",
        "card-hover": "hsl(var(--card-hover))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
        xl: ["1.5rem", { lineHeight: "2rem" }],       // 24px
        "2xl": ["2rem", { lineHeight: "2.5rem" }],    // 32px
        "3xl": ["2.5rem", { lineHeight: "3rem" }],    // 40px
        "4xl": ["3.5rem", { lineHeight: "1.15" }]     // 56px
      },
      maxWidth: {
        prose: "65ch"
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },
      transitionDuration: {
        DEFAULT: "200ms"
      }
    }
  }
};

export default config;