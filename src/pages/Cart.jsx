import React from "react";
import "./Cart.css";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import { money } from "../utils/currency.js";

export default function Cart() {
  const { items, total, dispatch } = useCart();
  return (
    <div className="cart">
      <h1>Vaša korpa</h1>
      {items.length === 0 && (
        <p>
          Korpa je prazna. <Link to="/catalog">Nastavi kupovinu</Link>
        </p>
      )}
      {items.length > 0 && (
        <div className="card cart__wrap">
          {items.map((it) => (
            <div key={it.id} className="cart__row">
              <img src={it.image} alt="thumb" />
              <div className="cart__meta">
                <Link to={`/product/${it.slug}`}>{it.name}</Link>
                <div className="cart__brand">{it.brand}</div>
              </div>
              <input
                className="cart__qty"
                type="number"
                min="1"
                value={it.qty}
                onChange={(e) =>
                  dispatch({
                    type: "SET_QTY",
                    id: it.id,
                    qty: Number(e.target.value),
                  })
                }
              />
              <div className="cart__price">{money(it.price * it.qty)}</div>
              <button
                className="cart__remove"
                onClick={() => dispatch({ type: "REMOVE", id: it.id })}
              >
                Ukloni
              </button>
            </div>
          ))}
          <div className="hr"></div>
          <div className="cart__total">
            <div>Ukupno:</div>
            <div className="cart__totalPrice">{money(total)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Link to="/checkout" className="cart__checkout">
              Nastavi na naplatu
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
