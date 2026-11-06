"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type Theme = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  preference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (pref: ThemePreference) => void;
  isReady: boolean;
}

const STORAGE_KEY = "onsupp-theme";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Update theme-color meta tag if present
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      theme === "dark" ? "#1f1f1e" : "#f8f9fa"
    );
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from <html> attribute set by the blocking anti-FOUC script
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document !== "undefined") {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "light" || attr === "dark") return attr;
    }
    return "dark";
  });
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") return stored;
      } catch {}
    }
    return "system";
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Read stored preference or system preference on mount
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}

    const pref: ThemePreference =
      stored === "light" || stored === "dark" ? stored : "system";
    setPreferenceState(pref);

    const resolved: Theme = pref === "system" ? getSystemTheme() : pref;
    setThemeState(resolved);
    applyThemeToDOM(resolved);
    setIsReady(true);

    // Listen to OS system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      let currentStored: string | null = null;
      try {
        currentStored = localStorage.getItem(STORAGE_KEY);
      } catch {}

      if (!currentStored || currentStored === "system") {
        const nextResolved: Theme = e.matches ? "dark" : "light";
        setThemeState(nextResolved);
        applyThemeToDOM(nextResolved);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const setTheme = useCallback((newPref: ThemePreference) => {
    setPreferenceState(newPref);
    try {
      if (newPref === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, newPref);
      }
    } catch {}

    const resolved: Theme =
      newPref === "system" ? getSystemTheme() : newPref;
    setThemeState(resolved);
    applyThemeToDOM(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      setPreferenceState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      applyThemeToDOM(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, preference, toggleTheme, setTheme, isReady }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
