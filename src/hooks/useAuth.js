// src/hooks/useAuth.js
// Hook to access authentication context
// and ensure it's used within the provider
// ------------------------------------------------------

import { useContext } from "react";
import { Ctx } from "../context/AuthContext";

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth in provider");
  return v;
}
