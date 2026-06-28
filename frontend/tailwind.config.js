/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        /* ── Radix/shadcn CSS-var tokens ─────────────────────── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        popover: { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        card: { DEFAULT: "#FFFFFF", foreground: "#0F172A" },
        muted: { DEFAULT: "#F8FAFC", foreground: "#64748B" },
        destructive: { DEFAULT: "#EF4444", foreground: "#FFFFFF" },

        /* ── Brand primaries ──────────────────────────────────── */
        primary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          50:  "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        secondary: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
          50:  "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },

        /* ── Semantic ─────────────────────────────────────────── */
        success:  { DEFAULT: "#10B981", light: "#ECFDF5", foreground: "#FFFFFF" },
        accent:   { DEFAULT: "#22C55E", foreground: "#FFFFFF" },
        warning:  { DEFAULT: "#F59E0B", light: "#FFFBEB", foreground: "#FFFFFF" },
        danger:   { DEFAULT: "#EF4444", light: "#FEF2F2", foreground: "#FFFFFF" },

        /* ── Surface / layout ─────────────────────────────────── */
        navy:     { DEFAULT: "#0F172A", mid: "#1E293B", light: "#334155" },
        surface:  "#FFFFFF",
        "light-bg": "#F8FAFC",
        "hover-bg": "#EEF6FF",

        /* ── Text ─────────────────────────────────────────────── */
        "text-primary":   "#0F172A",
        "text-secondary": "#64748B",
        "text-muted":     "#94A3B8",

        /* ── Border ───────────────────────────────────────────── */
        "border-color": "#E2E8F0",

        /* ── Old tokens kept for backward compat ──────────────── */
        "dark-navy":   "#0F172A",
        "sidebar-mid": "#1E293B",
        "card-bg":     "#FFFFFF",
      },

      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },

      borderRadius: {
        lg: "0.75rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
        DEFAULT: "var(--radius, 0.65rem)",
      },

      boxShadow: {
        card:        "0 1px 3px 0 rgb(0 0 0/0.07), 0 1px 2px -1px rgb(0 0 0/0.07)",
        "card-hover":"0 10px 25px -5px rgb(37 99 235/0.12), 0 4px 10px -3px rgb(37 99 235/0.08)",
        sidebar:     "4px 0 40px rgba(15,23,42,0.40)",
        navbar:      "0 1px 0 0 #E2E8F0, 0 2px 8px 0 rgb(0 0 0/0.04)",
        kpi:         "0 2px 8px rgb(37 99 235/0.08)",
        "kpi-hover": "0 10px 28px rgb(37 99 235/0.18)",
        dropdown:    "0 4px 24px -4px rgb(37 99 235/0.18), 0 2px 8px -2px rgb(0 0 0/0.08)",
        "input-focus": "0 0 0 3px rgba(37,99,235,0.15)",
        glow:        "0 0 20px rgba(37,99,235,0.25)",
        "glow-green":"0 0 20px rgba(16,185,129,0.28)",
        "glow-sm":   "0 0 12px rgba(37,99,235,0.18)",
      },

      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":   { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in":  { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "slide-up":  { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "scale-in":  { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        shimmer:     { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        "pulse-glow":{ "0%,100%": { boxShadow: "0 0 0 0 rgba(37,99,235,0)" }, "50%": { boxShadow: "0 0 0 6px rgba(37,99,235,0.15)" } },
        float:       { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        "spin-slow": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        blob:        { "0%,100%": { borderRadius: "60% 40% 30% 70%/60% 30% 70% 40%" }, "50%": { borderRadius: "30% 60% 70% 40%/50% 60% 30% 60%" } },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.35s ease-out",
        "slide-in":       "slide-in 0.3s ease-out",
        "slide-up":       "slide-up 0.4s ease-out",
        "scale-in":       "scale-in 0.2s ease-out",
        shimmer:          "shimmer 2s infinite linear",
        "pulse-glow":     "pulse-glow 2.5s ease-in-out infinite",
        float:            "float 3s ease-in-out infinite",
        "spin-slow":      "spin-slow 3s linear infinite",
        blob:             "blob 7s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
