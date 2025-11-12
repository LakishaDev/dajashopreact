import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <div className="footer__brand">Daja Shop</div>
          <div className="footer__muted">online prodavnica satova</div>
        </div>
        <div>
          <div className="footer__title">Kontakt</div>
          <div>Tel: 064/1262425 · 065/2408400</div>
          <div>Niš, TPC Gorča lokal C31</div>
          <div>E-mail: cvelenis42@yahoo.com</div>
        </div>
        <div>
          <div className="footer__title">Radno vreme</div>
          <div>Pon – Pet: 09:00 – 20:00</div>
          <div>Subota: 09:00 – 15:00</div>
          <div>Nedelja: Zatvoreno</div>
        </div>
      </div>
      <div className="footer__bottom">
        © {new Date().getFullYear()} Daja Shop
      </div>
    </footer>
  );
}
