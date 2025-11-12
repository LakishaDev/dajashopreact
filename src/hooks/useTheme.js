import { useContext } from "react";
import { ThemeCtx } from "../context/ThemeContext.jsx";

export function useTheme() {
  return useContext(ThemeCtx);
}