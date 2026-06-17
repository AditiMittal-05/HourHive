/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0F4C81",
          foreground: "#FFFFFF",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#0F4C81",
          600: "#0a3d6b",
          700: "#073059",
        },
        secondary: {
          DEFAULT: "#00A86B",
          foreground: "#FFFFFF",
          50: "#ECFDF5",
          500: "#00A86B",
          600: "#008f5a",
        },
        "dark-navy": "#0B1F33",
        "light-bg": "#F8FAFC",
        "card-bg": "#FFFFFF",
        "border-color": "#E2E8F0",
        "text-primary": "#1E293B",
        "text-secondary": "#64748B",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8FAFC",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#EFF6FF",
          foreground: "#0F4C81",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
        "sidebar": "4px 0 24px rgba(15, 76, 129, 0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
