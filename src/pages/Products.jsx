import React from "react";
import "./Product.css";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import catalog from "../services/CatalogService.js";
import { money } from "../utils/currency.js";
import { useCart } from "../context/CartContext.jsx";

export default function Product() {
  const { slug } = useParams();
  const p = catalog.get(slug);
  const { dispatch } = useCart();
  if (!p) return <div>Proizvod nije pronađen.</div>;
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
        <button
          className="product__cta"
          onClick={() =>
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
            })
          }
        >
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}
