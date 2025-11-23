// src/components/NavBar.jsx

import React, { useEffect, useState, useRef } from 'react';
import './Navbar.css';
// Dodajemo useNavigate za forsiranje navigacije na klik dugmeta
import { Link, useNavigate } from 'react-router-dom';

const nav = [
  {
    label: 'DANIEL KLEIN',
    children: [{ label: 'MUŠKI' }, { label: 'ŽENSKI' }],
  },
  {
    label: 'CASIO',
    children: [
      { label: 'G-SHOCK' },
      { label: 'BABY-G' },
      { label: 'EDIFICE' },
      { label: 'SHEEN' },
      { label: 'RETRO' },
    ],
  },
  {
    label: 'ORIENT',
    children: [{ label: '200m DIVERS' }, { label: 'ŽENSKI' }],
  },
  { label: 'Q&Q', children: [{ label: 'MUŠKI' }, { label: 'ŽENSKI' }] },
  {
    label: 'OSTALO',
    children: [
      { label: 'DALJINSKI' },
      { label: 'BATERIJE' },
      { label: 'NAOČARE' },
    ],
  },
];

export default function NavBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const rowRef = useRef(null);
  const subRowRef = useRef(null);
  const navigate = useNavigate(); // Inicijalizacija navigate hooka

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Resetujemo otvoreni indeks pri prelasku na desktop
  useEffect(() => {
    if (!isMobile) setOpenIdx(null);
  }, [isMobile]);

  // Reset horizontalnog skrola na početak kad uđemo u mobilni režim
  useEffect(() => {
    if (isMobile && rowRef.current) {
      requestAnimationFrame(() => {
        rowRef.current.scrollTo({ left: 0, top: 0, behavior: 'auto' });
      });
    }
  }, [isMobile]);

  // Nova funkcija za navigaciju na klik BRENDA (koristi se na desktopu)
  const handleBrandClick = (label) => {
    navigate(`/catalog?brand=${encodeURIComponent(label)}`);
  };

  return (
    <nav className="navbar" aria-label="Navigacija brendova">
      <div className="container navbar__wrap">
        <div className="navbar__row" ref={rowRef}>
          <Link to="/catalog" className="navbar__all">
            Katalog
          </Link>

          {nav.map((g, i) => (
            <div
              key={g.label}
              className="navbar__group"
              data-open={isMobile && openIdx === i ? 'true' : 'false'}
            >
              {/* DESKTOP: label (hover dropdown) - SADA je i klikabilna */}
              <button
                className="navbar__label"
                type="button"
                onClick={() => handleBrandClick(g.label)} // Dodajemo navigaciju na klik
              >
                {g.label}
              </button>

              {/* MOBILNI: chip (tap otvara red ispod) - ZADRŽAVAMO funkcionalnost otvaranja pod-reda */}
              <button
                type="button"
                className="navbar__chip"
                aria-expanded={isMobile && openIdx === i}
                onClick={() =>
                  isMobile && setOpenIdx((p) => (p === i ? null : i))
                }
              >
                {g.label}
              </button>

              {/* DESKTOP dropdown (hover) - ZADRŽAVAMO */}
              <div className="navbar__dropdown card" role="menu">
                {/* Prvi link u dropdownu bi uvek trebalo da bude "SVI [BREND]" za kompletnu listu */}
                <Link
                  key={`all-${g.label}`}
                  role="menuitem"
                  to={`/catalog?brand=${encodeURIComponent(g.label)}`}
                  style={{ fontWeight: 'bold' }}
                >
                  Svi {g.label}
                </Link>

                {g.children.map((c) => (
                  <Link
                    key={c.label}
                    role="menuitem"
                    to={`/catalog?brand=${encodeURIComponent(
                      g.label
                    )}&category=${encodeURIComponent(c.label)}`}
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
          <div
            className="navbar__sub"
            role="region"
            aria-label={`${nav[openIdx].label} kategorije`}
          >
            <div className="navbar__subrow" ref={subRowRef}>
              {/* Dodajemo opciju "SVI" u mobilni pod-red */}
              <Link
                key={`all-mobile-${nav[openIdx].label}`}
                className="navbar__pill"
                to={`/catalog?brand=${encodeURIComponent(nav[openIdx].label)}`}
                onClick={() => setOpenIdx(null)}
                style={{ fontWeight: 'bold' }}
              >
                Svi {nav[openIdx].label}
              </Link>

              {nav[openIdx].children.map((c) => (
                <Link
                  key={c.label}
                  className="navbar__pill"
                  to={`/catalog?brand=${encodeURIComponent(
                    nav[openIdx].label
                  )}&category=${encodeURIComponent(c.label)}`}
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
