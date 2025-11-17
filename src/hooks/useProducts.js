import { useEffect, useState } from "react";
import { subscribeProducts } from "../services/products";

export default function useProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const unsub = subscribeProducts({
      onData: (arr) => {
        setItems(arr);
        setLoading(false);
      },
      onError: (e) => {
        setErr(e);
        setLoading(false);
      },
      order: "name",
    });
    return () => unsub?.();
  }, []);

  return { items, loading, err };
}
