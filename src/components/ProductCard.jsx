import React from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";
import { money } from "../utils/currency.js";
import { useCart } from "../context/CartContext.jsx";

export default function ProductCard({ p }) {
  const { dispatch } = useCart();
  return (
    <div className="product-card card">
      <Link to={`/product/${p.slug}`} className="product-card__img">
        <img src={p.image} alt={p.name} loading="lazy" />
      </Link>
      <div className="product-card__body">
        <div className="product-card__brand">{p.brand}</div>
        <Link to={`/product/${p.slug}`} className="product-card__name">
          {p.name}
        </Link>
        <div className="product-card__price">{money(p.price)}</div>
        <button
          className="product-card__btn"
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
