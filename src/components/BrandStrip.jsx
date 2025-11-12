import React from "react";
import "./BrandStrip.css";

export default function BrandStrip({ brands = [] }) {
  return (
    <section className="brandstrip">
      <div className="container brandstrip__row">
        {brands.map((b) => (
          <div key={b} className="brandstrip__item">
            {b}
          </div>
        ))}
      </div>
    </section>
  );
}
