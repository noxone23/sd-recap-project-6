export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function loadTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The app keeps working with the theme in memory.
  }
}

export function getInitialTheme(): Theme {
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)"
  ).matches;

  return loadTheme() ?? (prefersDark ? "dark" : "light");
}
