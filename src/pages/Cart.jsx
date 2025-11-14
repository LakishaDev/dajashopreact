import React from "react";
import "./Cart.css";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import { money } from "../utils/currency.js";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

const clampQty = (n) => Math.max(1, Math.min(99, Number.isNaN(n) ? 1 : n));

export default function Cart() {
  const { items, total, dispatch } = useCart();

  return (
    <div className="cart container">
      <div className="cart__header">
        <div className="cart__title">
          <ShoppingBag aria-hidden /> <h1>Vaša korpa</h1>
        </div>

        {items.length > 0 && (
          <div className="cart__badge" aria-label={`${items.length} stavki u korpi`}>
            {items.length}
          </div>
        )}
      </div>

      {items.length === 0 && (
        <div className="empty glass card">
          <div className="empty__iconWrap">
            <ShoppingBag className="empty__icon" aria-hidden />
          </div>
          <h2>Korpa je prazna</h2>
          <p className="muted">
            Dodaj komade koji ti legnu na ruku i stil — Casio, Daniel Klein, Q&Q…
          </p>
          <Link to="/catalog" className="btn btn-primary">
            U katalog <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <motion.div
          className="card glass cart__wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="cart__rows" role="list">
            <AnimatePresence initial={false}>
              {items.map((it, idx) => (
                <motion.div
                  role="listitem"
                  key={it.id}
                  className="cart__row"
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
                >
                  <img
                    className="cart__thumb"
                    src={it.image}
                    alt={it.name}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="cart__meta">
                    <Link to={`/product/${it.slug}`} className="cart__name">
                      {it.name}
                    </Link>
                    <div className="cart__brand">{it.brand}</div>
                  </div>

                  <div className="cart__qtyWrap" aria-label="Količina">
                    <button
                      type="button"
                      className="qty__btn"
                      onClick={() =>
                        dispatch({
                          type: "SET_QTY",
                          id: it.id,
                          qty: clampQty(it.qty - 1),
                        })
                      }
                      aria-label="Smanji količinu"
                    >
                      <Minus size={16} aria-hidden />
                    </button>

                    <input
                      className="cart__qty"
                      type="number"
                      min="1"
                      max="99"
                      value={it.qty}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_QTY",
                          id: it.id,
                          qty: clampQty(parseInt(e.target.value, 10)),
                        })
                      }
                      aria-label="Količina proizvoda"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />

                    <button
                      type="button"
                      className="qty__btn"
                      onClick={() =>
                        dispatch({
                          type: "SET_QTY",
                          id: it.id,
                          qty: clampQty(it.qty + 1),
                        })
                      }
                      aria-label="Povećaj količinu"
                    >
                      <Plus size={16} aria-hidden />
                    </button>
                  </div>

                  <div className="cart__price">{money(it.price * it.qty)}</div>

                  <button
                    className="cart__remove"
                    onClick={() => dispatch({ type: "REMOVE", id: it.id })}
                    aria-label="Ukloni iz korpe"
                    title="Ukloni"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="hr" role="separator"></div>

          <div className="cart__summary">
            <div className="cart__note">
              <ShieldCheck size={18} aria-hidden /> Sigurna naplata i garancija
            </div>

            <div className="cart__total">
              <span>Ukupno</span>
              <span className="cart__totalPrice">{money(total)}</span>
            </div>

            <div className="cart__actions">
              <Link to="/catalog" className="btn btn-ghost">
                Nastavi kupovinu
              </Link>
              <Link to="/checkout" className="btn btn-primary">
                Nastavi na naplatu <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
