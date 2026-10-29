import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        signal: { DEFAULT: "var(--signal)", soft: "var(--signal-soft)" },
        verified: { DEFAULT: "var(--verified)", soft: "var(--verified-soft)" },
        flagged: { DEFAULT: "var(--flagged)", soft: "var(--flagged-soft)" },
        gap: { DEFAULT: "var(--gap)", soft: "var(--gap-soft)" },
        abort: { DEFAULT: "var(--abort)", soft: "var(--abort-soft)" },
        merged: { DEFAULT: "var(--merged)", soft: "var(--merged-soft)" },
        // shadcn semantic tokens
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
        card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
        destructive: { DEFAULT: "var(--abort)", foreground: "#ffffff" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        logo: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        dash: { to: { strokeDashoffset: "-20" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "cursor-blink": "blink 1s step-end infinite",
        dash: "dash 1s linear infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [animate],
}
export default config
