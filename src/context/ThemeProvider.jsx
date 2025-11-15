import { useEffect, useState } from "react";
import { themes, applyTheme } from "../config/themes.js";
import { ThemeCtx } from "./ThemeContext.jsx";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "appleMono"
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    available: Object.keys(themes),
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
