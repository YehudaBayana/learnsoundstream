/**
 * Theme Registry — Single source of truth for all available themes.
 *
 * To add a new theme:
 * 1. Add the theme name to the ThemeName union type
 * 2. Add a new ThemeDefinition entry to the `themes` array below
 * 3. That's it — everything else is automatic.
 */

export type ThemeName = "dark" | "light";

export interface ThemeDefinition {
  /** Unique identifier used in data-theme attribute and localStorage */
  name: ThemeName;
  /** Display label shown in the UI */
  label: string;
  /** Emoji icon for the toggle button */
  icon: string;
  /** CSS custom property values applied to :root */
  variables: Record<string, string>;
}

export const themes: ThemeDefinition[] = [
  {
    name: "dark",
    label: "Dark",
    icon: "🌙",
    variables: {
      // Backgrounds
      "--bg-primary": "#050505",
      "--bg-secondary": "rgba(0, 0, 0, 0.4)",
      "--bg-surface": "rgba(255, 255, 255, 0.015)",
      "--bg-surface-hover": "rgba(255, 255, 255, 0.03)",
      "--bg-surface-active": "rgba(255, 255, 255, 0.04)",
      "--bg-overlay": "rgba(0, 0, 0, 0.6)",
      "--bg-player": "rgba(0, 0, 0, 0.4)",
      "--bg-input": "#0f172a",

      // Text
      "--text-primary": "#ffffff",
      "--text-secondary": "#d1d5db",
      "--text-muted": "#6b7280",

      // Borders
      "--border-default": "rgba(255, 255, 255, 0.05)",
      "--border-subtle": "rgba(255, 255, 255, 0.08)",

      // Scrollbar
      "--scrollbar-track": "#050505",
      "--scrollbar-thumb": "#262626",
      "--scrollbar-thumb-hover": "#71717a",

      // Shadows
      "--shadow-player": "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      "--shadow-dropdown": "0 20px 40px rgba(0, 0, 0, 0.6)",

      // Status panel
      "--bg-status-panel": "rgba(15, 15, 15, 0.92)",
    },
  },
  {
    name: "light",
    label: "Light",
    icon: "☀️",
    variables: {
      // Backgrounds
      "--bg-primary": "#f5f5f7",
      "--bg-secondary": "rgba(255, 255, 255, 0.85)",
      "--bg-surface": "rgba(0, 0, 0, 0.02)",
      "--bg-surface-hover": "rgba(0, 0, 0, 0.04)",
      "--bg-surface-active": "rgba(0, 0, 0, 0.06)",
      "--bg-overlay": "rgba(0, 0, 0, 0.25)",
      "--bg-player": "rgba(255, 255, 255, 0.88)",
      "--bg-input": "#e5e7eb",

      // Text
      "--text-primary": "#111827",
      "--text-secondary": "#4b5563",
      "--text-muted": "#9ca3af",

      // Borders
      "--border-default": "rgba(0, 0, 0, 0.08)",
      "--border-subtle": "rgba(0, 0, 0, 0.06)",

      // Scrollbar
      "--scrollbar-track": "#f3f4f6",
      "--scrollbar-thumb": "#d1d5db",
      "--scrollbar-thumb-hover": "#9ca3af",

      // Shadows
      "--shadow-player": "0 20px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
      "--shadow-dropdown": "0 20px 40px rgba(0, 0, 0, 0.12)",

      // Status panel
      "--bg-status-panel": "rgba(255, 255, 255, 0.95)",
    },
  },
];

/** Get a theme definition by name. Falls back to dark. */
export function getTheme(name: ThemeName): ThemeDefinition {
  return themes.find((t) => t.name === name) ?? themes[0];
}

/** Default theme on first visit */
export const DEFAULT_THEME: ThemeName = "dark";
