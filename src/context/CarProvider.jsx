import {
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { CartCtx } from "./CartContext.jsx";


const initial = () => {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const i = state.findIndex((x) => x.id === action.item.id);
      if (i >= 0) {
        const next = [...state];
        next[i] = { ...next[i], qty: next[i].qty + (action.qty || 1) };
        return next;
      }
      return [...state, { ...action.item, qty: action.qty || 1 }];
    }
    case "REMOVE":
      return state.filter((x) => x.id !== action.id);
    case "SET_QTY":
      return state.map((x) =>
        x.id === action.id ? { ...x, qty: Math.max(1, action.qty) } : x
      );
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], initial);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);

  const total = useMemo(
    () => items.reduce((s, x) => s + x.price * x.qty, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);

  const value = { items, dispatch, total, count };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}