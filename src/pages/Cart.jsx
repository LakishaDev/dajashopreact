import React, { useState, useEffect } from "react";
import "./Cart.css";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart.js";
import { useFlash } from "../hooks/useFlash.js";
import { money } from "../utils/currency.js";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";
import {
  ShoppingBag,
  ShieldCheck,
  Trash2,
  ArrowRight,
  Minus,
  Plus,
  Ticket,
  XCircle,
} from "lucide-react";

function QtyInput({ value, id, dispatch }) {
  const [localVal, setLocalVal] = useState(value);
  const clampQty = (n) => Math.max(1, Math.min(99, n));

  useEffect(() => setLocalVal(value), [value]);

  const handleBlur = () => {
    let n = parseInt(localVal, 10);
    n = clampQty(isNaN(n) ? 1 : n);
    setLocalVal(n);
    if (n !== value) dispatch({ type: "SET_QTY", id: id, qty: n });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
      e.target.blur();
    }
  };

  return (
    <input
      className="cart__qty no-spin" /* Dodata klasa no-spin */
      type="number"
      min="1"
      max="99"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label="Količina proizvoda"
      inputMode="numeric"
    />
  );
}

function PromoCodeSection() {
  const [code, setCode] = useState("");
  const { flash } = useFlash();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.toLowerCase() === "daja20") {
      flash("Kupon primenjen", "Popust je uspešno dodat.", "success");
    } else {
      flash("Kôd nije validan", "Proverite uneti kod za popust.", "info");
    }
    setCode("");
  };

  return (
    <form className="promo-box" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <Ticket size={18} className="icon" aria-hidden />
        <input
          type="text"
          placeholder="Promo kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <button 
        type="submit"
        className="btn btn-primary promo-btn"
        disabled={code.length < 3}
        aria-label="Primeni promo kod"
      >
        Potvrdi
      </button>
    </form>
  );
}

export default function Cart() {
  const { items, total, dispatch } = useCart();
  const { flash } = useFlash();
  const [showClearModal, setShowClearModal] = useState(false);

  const clampQty = (n) => Math.max(1, Math.min(99, n));

  // LOGIKA ZA MINUS DUGME
  const handleDecrease = (item) => {
    if (item.qty > 1) {
      // Standardno smanjenje
      dispatch({ type: "SET_QTY", id: item.id, qty: item.qty - 1 });
    } else {
      // Brisanje sa UNDO opcijom
      dispatch({ type: "REMOVE", id: item.id });
      
      flash(
        "Uklonjeno", 
        `${item.name} je obrisan.`, 
        "trash",
        {
          label: "Vrati",
          onClick: () => dispatch({ type: "ADD", item: item }) // Vraća item nazad
        }
      );
    }
  };

  const performClear = () => {
    dispatch({ type: "CLEAR" });
    flash("Korpa ispražnjena", "Svi artikli su uklonjeni.", "info");
  };

  return (
    <div className="cart container">
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={performClear}
        title="Isprazni korpu?"
        description="Da li ste sigurni da želite da uklonite sve proizvode?"
        confirmText="Da, isprazni"
        cancelText="Odustani"
        isDanger={true}
      />

      <div className="cart__header">
        <div className="cart__title">
          <ShoppingBag aria-hidden /> <h1>Vaša korpa</h1>
        </div>
        <div className="header-actions">
          {items.length > 0 && (
            <div className="cart__badge" aria-label={`${items.length} stavki`}>{items.length}</div>
          )}
        </div>
      </div>

      {items.length === 0 && (
        <motion.div 
          className="empty glass card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty__iconWrap">
            <ShoppingBag className="empty__icon" aria-hidden />
          </div>
          <h2>Korpa je prazna</h2>
          <p className="muted">Pogledaj našu kolekciju satova i pronađi onaj pravi.</p>
          <Link to="/catalog" className="btn btn-primary">
            U katalog <ArrowRight size={18} aria-hidden />
          </Link>
        </motion.div>
      )}

      {items.length > 0 && (
        <div className="cart-content-grid">
          <motion.div
            className="card glass cart__wrap items-list-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="cart__rows">
              <AnimatePresence initial={false}>
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    className="cart__row"
                    layout
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <img className="cart__thumb" src={it.image} alt={it.name} loading="lazy" />
                    
                    <div className="cart__meta">
                      <Link to={`/product/${it.slug}`} className="cart__name">{it.name}</Link>
                      <div className="cart__brand">{it.brand}</div>
                    </div>

                    <div className="cart__qtyWrap">
                      {/* Pozivamo pametnu funkciju handleDecrease */}
                      <button className="qty__btn" onClick={() => handleDecrease(it)}>
                        <Minus size={14} />
                      </button>
                      
                      <QtyInput value={it.qty} id={it.id} dispatch={dispatch} />
                      
                      <button className="qty__btn" onClick={() => dispatch({ type: "SET_QTY", id: it.id, qty: clampQty(it.qty + 1) })}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="cart__price">{money(it.price * it.qty)}</div>
                    
                    <button className="cart__remove" onClick={() => handleDecrease(it)} title="Ukloni">
                      <XCircle size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="cart__clear-row">
              <button className="btn btn-ghost btn-clear-all" onClick={() => setShowClearModal(true)}>
                <Trash2 size={16} /> Isprazni celu korpu
              </button>
            </div>
          </motion.div>

          <motion.div 
             className="card glass cart__summary-panel"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
          >
            <h3 className="summary-title">Pregled porudžbine</h3>
            <div className="hr" />
            
            <PromoCodeSection />
            
            <div className="summary-details">
                <div className="summary-row subtotal"><span className="muted">Međuzbir:</span><span>{money(total)}</span></div>
                <div className="summary-row shipping"><span className="muted">Isporuka:</span><span className="text-primary">Besplatna</span></div>
            </div>
            
            <div className="cart__total"><span>Ukupno za uplatu</span><span className="cart__totalPrice">{money(total)}</span></div>
            
            <Link to="/checkout" className="btn btn-primary checkout-btn">
              Nastavi na plaćanje <ArrowRight size={18} aria-hidden />
            </Link>
            
            <div className="cart__note"><ShieldCheck size={16} aria-hidden /> Sigurna kupovina i garancija</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}