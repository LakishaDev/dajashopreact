import React from "react";
import "./BrandStrip.css";
import { Link } from "react-router-dom";

export default function BrandStrip({ brands = [] }) {
  // dupliramo listu da bi animacija bila "beskonačna"
  const looped = [...brands, ...brands];

  return (
    <section className="brandstrip">
      <div className="container brandstrip__row">
        <div className="brandstrip__track">
          {looped.map((b, i) => (
            <Link
              key={`${b}-${i}`}
              className="brandstrip__item"
              to={`/catalog?brand=${encodeURIComponent(b)}`}
              aria-label={`Pogledaj ${b} satove`}
            >
              {b}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
