import { useContext } from "react";
import { UndoCtx } from "../context/UndoContext.jsx";

export function useUndo() {
  const context = useContext(UndoCtx);
  if (!context) {
    throw new Error("useUndo must be used within an UndoProvider");
  }
  return context;
}