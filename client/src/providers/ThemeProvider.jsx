import { useEffect } from "react";

import { useThemeStore } from "@/store/useThemeStore";

function resolveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  const prefersDark = window.matchMedia?.(
    "(prefers-color-scheme: dark)",
  )?.matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme]);

  return children;
}
