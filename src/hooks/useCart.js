import { useContext } from "react";
import { CartCtx } from "../context/CartContext.jsx";

export function useCart() {
  return useContext(CartCtx);
}