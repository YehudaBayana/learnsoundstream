"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  ThemeName,
  ThemeDefinition,
  themes,
  getTheme,
  DEFAULT_THEME,
} from "@/config/themes";

const STORAGE_KEY = "soundstream-theme";

interface ThemeContextValue {
  /** Current active theme name */
  theme: ThemeName;
  /** Full definition for the current theme */
  themeDefinition: ThemeDefinition;
  /** Set a specific theme by name */
  setTheme: (name: ThemeName) => void;
  /** Cycle to the next theme in the registry */
  toggleTheme: () => void;
  /** All available theme definitions (for building theme pickers) */
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Apply a theme's CSS variables to the document root */
function applyTheme(themeDef: ThemeDefinition) {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeDef.name);

  // Set all CSS custom properties
  for (const [property, value] of Object.entries(themeDef.variables)) {
    root.style.setProperty(property, value);
  }
}

/** Read stored theme from localStorage (returns null if not found or invalid) */
function getStoredTheme(): ThemeName | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && themes.some((t) => t.name === stored)) {
      return stored as ThemeName;
    }
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return getStoredTheme() ?? DEFAULT_THEME;
  });

  useEffect(() => {
    applyTheme(getTheme(theme));
  }, [theme]);

  const setTheme = useCallback((name: ThemeName) => {
    const themeDef = getTheme(name);
    setThemeState(name);
    applyTheme(themeDef);
    try {
      localStorage.setItem(STORAGE_KEY, name);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const currentIndex = themes.findIndex((t) => t.name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].name);
  }, [theme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    themeDefinition: getTheme(theme),
    setTheme,
    toggleTheme,
    availableThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Hook to access the theme context */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
