import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccent: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem("theme") === "dark",
  accentColor: localStorage.getItem("accent-color") || "#a855f7",
  toggleTheme: () =>
    set((state) => {
      const newDark = !state.isDark;
      document.documentElement.classList.toggle("dark", newDark);
      localStorage.setItem("theme", newDark ? "dark" : "light");
      return { isDark: newDark };
    }),

  setAccent: (color: string) => {
    localStorage.setItem("accent-color", color);
    document.documentElement.style.setProperty("--app-accent", color);
    set({ accentColor: color });
  },
}));
