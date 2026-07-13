import { useEffect } from "react";

import { resolveTheme } from "@/lib/theme";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [theme]);

  return children;
}
