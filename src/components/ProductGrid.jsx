import React from "react";
import "./ProductGrid.css";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ items }) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
