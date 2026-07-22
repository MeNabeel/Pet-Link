/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        background: "var(--color-bg-light)",
        foreground: "var(--color-dark)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-white)",
        },
        secondary: {
          DEFAULT: "var(--color-bg-light)",
          foreground: "var(--color-dark)",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted)",
        },
        accent: {
          DEFAULT: "var(--color-bg-light)",
          foreground: "var(--color-dark)",
        },
        popover: {
          DEFAULT: "var(--color-white)",
          foreground: "var(--color-dark)",
        },
        card: {
          DEFAULT: "var(--color-white)",
          foreground: "var(--color-dark)",
        },
      },
      borderRadius: {
        lg: "var(--border-radius)",
        md: "calc(var(--border-radius) - 2px)",
        sm: "calc(var(--border-radius) - 4px)",
      },
    },
  },
  plugins: [],
}
