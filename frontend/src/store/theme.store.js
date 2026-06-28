import { create } from "zustand";
import { persist } from "zustand/middleware";

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
  } else if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }
}

export const useThemeStore = create()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      isDark: () => {
        const t = get().theme;
        if (t === "dark") return true;
        if (t === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
        return false;
      },
    }),
    { name: "hourhive-theme" }
  )
);
