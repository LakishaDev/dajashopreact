// src/hooks/useProduct.js
import { useEffect, useState } from "react";
import { fetchProductBySlug } from "../services/products";

export default function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    let mounted = true;
    setLoading(true);

    async function load() {
      try {
        const data = await fetchProductBySlug(slug);
        if (mounted) {
          if (data) setProduct(data);
          else setError(new Error("Proizvod nije pronađen u bazi."));
        }
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { product, loading, error };
}
