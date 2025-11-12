import React from "react";
import "./Checkout.css";
import { useCart } from "../hooks/useCart.js";
import { money } from "../utils/currency.js";

export default function Checkout() {
  const { total } = useCart();
  return (
    <div
      className="checkout grid"
      style={{ gridTemplateColumns: "1fr 360px", gap: "16px" }}
    >
      <div className="card checkout__form">
        <h2>Podaci za isporuku</h2>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <input placeholder="Ime" />
          <input placeholder="Prezime" />
          <input placeholder="Telefon" />
          <input placeholder="E-mail" />
          <input className="wide" placeholder="Adresa" />
          <input placeholder="Grad" />
          <input placeholder="Poštanski broj" />
        </div>
        <h3>Način isporuke</h3>
        <label>
          <input type="radio" name="ship" defaultChecked /> Post Express
          (Srbija)
        </label>
        <h3>Način plaćanja</h3>
        <label>
          <input type="radio" name="pay" defaultChecked /> Pouzećem
        </label>
        <button className="checkout__btn">Potvrdi porudžbinu</button>
      </div>
      <div className="card checkout__summary">
        <h2>Sažetak</h2>
        <div className="checkout__total">
          Ukupno: <span>{money(total)}</span>
        </div>
        <p className="muted">Isporuka i popusti se obračunavaju kasnije.</p>
      </div>
    </div>
  );
}
