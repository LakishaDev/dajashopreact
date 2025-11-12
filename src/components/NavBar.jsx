import React from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";

const nav = [
  {
    label: "DANIEL KLEIN",
    children: [{ label: "MUŠKI" }, { label: "ŽENSKI" }],
  },
  {
    label: "CASIO",
    children: [
      { label: "G-SHOCK" },
      { label: "BABY-G" },
      { label: "EDIFICE" },
      { label: "SHEEN" },
      { label: "RETRO" },
    ],
  },
  {
    label: "ORIENT",
    children: [{ label: "200m DIVERS" }, { label: "ŽENSKI" }],
  },
  { label: "Q&Q", children: [{ label: "MUŠKI" }, { label: "ŽENSKI" }] },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="container navbar__row">
        <Link to="/catalog" className="navbar__all">
          Katalog
        </Link>
        {nav.map((group) => (
          <div key={group.label} className="navbar__group">
            <span className="navbar__label">{group.label}</span>
            <div className="navbar__dropdown card">
              {group.children.map((c) => (
                <Link
                  key={c.label}
                  to={`/catalog?brand=${encodeURIComponent(
                    group.label
                  )}&category=${encodeURIComponent(c.label)}`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
