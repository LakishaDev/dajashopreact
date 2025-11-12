import React from "react";
import "./Home.css";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <section className="hero card shadow">
        <div className="hero__wrap container">
          <div className="hero__copy">
            <h1>Vreme je da zablistaš</h1>
            <p>
              Odaberi sat koji priča tvoj stil — Casio, Daniel Klein, Q&Q i još
              mnogo toga.
            </p>
            <div className="hero__actions">
              <Link to="/catalog" className="btn-primary">
                Pogledaj katalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
