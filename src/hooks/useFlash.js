import { useContext } from "react";
import { FlashCtx } from "../context/FlashContext.jsx";

export function useFlash() {
  const ctx = useContext(FlashCtx);
  if (!ctx) throw new Error("useFlash must be used within FlashProvider");
  return ctx;
}