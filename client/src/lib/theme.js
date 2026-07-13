/** Resolve stored theme preference to "light" | "dark" */
export function resolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  )?.matches;
  return prefersDark ? "dark" : "light";
}
