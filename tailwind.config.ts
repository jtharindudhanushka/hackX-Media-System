import type { Config } from "tailwindcss";

// Colours come from design/tokens.css (RGB triplets) so alpha works: bg-gold/40
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const names = [
  "gold", "gold-ideax", "amber", "amber-jr", "ember", "copper",
  "abyss", "deep", "trench", "line", "ocean", "navy", "glow", "mist",
  "jr-abyss", "jr-deep", "jr-fill", "jr-glow",
  "paper", "ink", "slate", "warn", "danger", "ok",
  "ui-canvas", "ui-s1", "ui-s2", "ui-s3", "ui-line", "ui-ink", "ui-muted", "ui-accent", "ui-live",
];

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: Object.fromEntries(names.map((n) => [n, token(n)])),
    },
  },
  plugins: [],
};
export default config;
