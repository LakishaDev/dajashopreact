import ProductCard from "./ProductCard.jsx";
import useProducts from "../hooks/useProducts";

export default function ProductGrid() {
  const { items, loading, err } = useProducts();

  if (loading) {
    return <div className="product-grid">Učitavanje…</div>;
  }
  if (err) {
    return (
      <div className="product-grid text-red-600">Greška: {String(err)}</div>
    );
  }
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
