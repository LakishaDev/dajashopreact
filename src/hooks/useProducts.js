import { useEffect, useState, useMemo } from "react";
import { subscribeProducts } from "../services/products";

export default function useProducts(params = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Stabilizujemo parametre da ne bi izazivali re-render petlju
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);

  useEffect(() => {
    setLoading(true);
    setErr(null);

    const unsub = subscribeProducts({
      onData: (arr) => {
        setItems(arr);
        setLoading(false);
      },
      onError: (e) => {
        setErr(e);
        setLoading(false);
      },
      // Prosleđujemo sortiranje bazi
      order: memoizedParams.order || "name",
    });

    return () => unsub?.();
  }, [memoizedParams]);

  return { items, loading, err };
}
