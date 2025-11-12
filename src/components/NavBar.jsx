import React, { useEffect, useState, useRef } from "react";
import "./NavBar.css";
import { Link } from "react-router-dom";

const nav = [
  { label: "DANIEL KLEIN", children: [{ label: "MUŠKI" }, { label: "ŽENSKI" }] },
  {
    label: "CASIO",
    children: [{ label: "G-SHOCK" }, { label: "BABY-G" }, { label: "EDIFICE" }, { label: "SHEEN" }, { label: "RETRO" }],
  },
  { label: "ORIENT", children: [{ label: "200m DIVERS" }, { label: "ŽENSKI" }] },
  { label: "Q&Q", children: [{ label: "MUŠKI" }, { label: "ŽENSKI" }] },
];

export default function NavBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const rowRef = useRef(null);
  const subRowRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!isMobile) setOpenIdx(null);
  }, [isMobile]);

  // Reset horizontalnog skrola na početak kad uđemo u mobilni režim
  useEffect(() => {
    if (isMobile && rowRef.current) {
      requestAnimationFrame(() => {
        rowRef.current.scrollTo({ left: 0, top: 0, behavior: "auto" });
      });
    }
  }, [isMobile]);

  return (
    <nav className="navbar" aria-label="Navigacija brendova">
      <div className="container navbar__wrap">
        <div className="navbar__row" ref={rowRef}>
          <Link to="/catalog" className="navbar__all">Katalog</Link>

          {nav.map((g, i) => (
            <div
              key={g.label}
              className="navbar__group"
              data-open={isMobile && openIdx === i ? "true" : "false"}
            >
              {/* DESKTOP: label (hover dropdown) */}
              <button className="navbar__label" type="button">{g.label}</button>

              {/* MOBILNI: chip (tap otvara red ispod) */}
              <button
                type="button"
                className="navbar__chip"
                aria-expanded={isMobile && openIdx === i}
                onClick={() => isMobile && setOpenIdx(p => (p === i ? null : i))}
              >
                {g.label}
              </button>

              {/* DESKTOP dropdown */}
              <div className="navbar__dropdown card" role="menu">
                {g.children.map(c => (
                  <Link
                    key={c.label}
                    role="menuitem"
                    to={`/catalog?brand=${encodeURIComponent(g.label)}&category=${encodeURIComponent(c.label)}`}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* MOBILNI: red 2 sa podkategorijama */}
        {isMobile && openIdx !== null && (
          <div className="navbar__sub" role="region" aria-label={`${nav[openIdx].label} kategorije`}>
            <div className="navbar__subrow" ref={subRowRef}>
              {nav[openIdx].children.map(c => (
                <Link
                  key={c.label}
                  className="navbar__pill"
                  to={`/catalog?brand=${encodeURIComponent(nav[openIdx].label)}&category=${encodeURIComponent(c.label)}`}
                  onClick={() => setOpenIdx(null)}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
