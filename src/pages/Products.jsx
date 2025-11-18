import React from "react";
import "./Product.css";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import catalog from "../services/CatalogService.js";
import { money } from "../utils/currency.js";
import { useCart } from "../hooks/useCart.js";
import { useFlash } from "../hooks/useFlash.js"; // 👈 Import

export default function Product() {
  const { slug } = useParams();
  const p = catalog.get(slug);
  const { dispatch } = useCart();
  const { flash } = useFlash(); // 👈 Hook

  if (!p) return <div>Proizvod nije pronađen.</div>;

  const handleAdd = () => {
    dispatch({
      type: "ADD",
      item: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        brand: p.brand,
        slug: p.slug,
      },
    });
    // ✅ Flash
    flash("Dodato u korpu", `${p.name} je spreman za isporuku.`, "cart");
  };

  return (
    <div
      className="product grid"
      style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}
    >
      <div className="card product__media">
        <img src={p.image} alt={p.name} />
      </div>
      <div>
        <Breadcrumbs
          trail={[{ label: "Katalog", href: "/catalog" }, { label: p.brand }]}
        />
        <h1 className="product__title">
          {p.brand} — {p.name}
        </h1>
        <div className="product__price">{money(p.price)}</div>
        <div className="product__specs card">
          {Object.entries(p.specs || {}).map(([k, v]) => (
            <div className="product__spec" key={k}>
              <strong>{k}:</strong> {v}
            </div>
          ))}
        </div>
        <button className="product__cta" onClick={handleAdd}>
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}