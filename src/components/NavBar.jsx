import React, { useEffect, useState, useRef } from 'react';
import './Navbar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const navSatovi = [
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
      { label: 'RETRO' },
    ],
  },
  {
    label: 'ORIENT',
    children: [{ label: '200m DIVERS' }, { label: 'ŽENSKI' }],
  },
  { label: 'Q&Q', children: [{ label: 'MUŠKI' }, { label: 'ŽENSKI' }] },
];

export default function NavBar() {
  const [isMobile, setIsMobile] = useState(false);
  const [openIdx, setOpenIdx] = useState(null);
  const [ostaloOpen, setOstaloOpen] = useState(false); // State za "Ostalo" dropdown

  const rowRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (!isMobile) setOpenIdx(null);
  }, [isMobile]);

  const handleBrandClick = (label) => {
    navigate(`/catalog?brand=${encodeURIComponent(label)}`);
  };

  const isActive = (path) =>
    location.pathname === path ? 'navbar__all active' : 'navbar__all';

  return (
    <nav className="navbar" aria-label="Glavna navigacija">
      <div className="container navbar__wrap">
        <div className="navbar__row" ref={rowRef}>
          {/* Link ka Satovima */}
          <Link to="/catalog" className={isActive('/catalog')}>
            SVI SATOVI
          </Link>

          {/* Brendovi Satova (Prikazuju se samo ako smo na /catalog ili Home, ili uvek ako želiš) */}
          {navSatovi.map((g, i) => (
            <div
              key={g.label}
              className="navbar__group"
              data-open={isMobile && openIdx === i ? 'true' : 'false'}
            >
              <button
                className="navbar__label"
                onClick={() => handleBrandClick(g.label)}
              >
                {g.label}
              </button>
              <button
                className="navbar__chip"
                onClick={() =>
                  isMobile && setOpenIdx((p) => (p === i ? null : i))
                }
              >
                {g.label}
              </button>

              <div className="navbar__dropdown card">
                <Link
                  to={`/catalog?brand=${encodeURIComponent(g.label)}`}
                  style={{ fontWeight: 'bold' }}
                >
                  Svi {g.label}
                </Link>
                {g.children.map((c) => (
                  <Link
                    key={c.label}
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

          {/* "OSTALO" Dropdown (Daljinski, Baterije, Naočare) */}
          <div
            className="navbar__group"
            onMouseEnter={() => !isMobile && setOstaloOpen(true)}
            onMouseLeave={() => !isMobile && setOstaloOpen(false)}
          >
            <button
              className="navbar__label"
              onClick={() => isMobile && setOstaloOpen(!ostaloOpen)}
            >
              Ostalo{' '}
              <ChevronDown size={14} style={{ marginLeft: 4, opacity: 0.6 }} />
            </button>
            {/* Mobilni chip za Ostalo */}
            <button
              className="navbar__chip"
              onClick={() => setOstaloOpen(!ostaloOpen)}
            >
              Ostalo
            </button>

            {/* Dropdown meni */}
            <div
              className={`navbar__dropdown card ${
                ostaloOpen ? 'show-override' : ''
              }`}
              style={
                ostaloOpen && isMobile
                  ? {
                      display: 'grid',
                      position: 'static',
                      boxShadow: 'none',
                      border: 'none',
                      paddingLeft: 0,
                    }
                  : {}
              }
            >
              <Link to="/daljinski">Daljinski</Link>
              <Link to="/baterije">Baterije</Link>
              <Link to="/naocare">Naočare</Link>
            </div>
          </div>
        </div>

        {/* Mobilni pod-meni za brendove satova */}
        {isMobile && openIdx !== null && (
          <div className="navbar__sub">
            <div className="navbar__subrow">
              <Link
                className="navbar__pill"
                to={`/catalog?brand=${encodeURIComponent(
                  navSatovi[openIdx].label
                )}`}
                onClick={() => setOpenIdx(null)}
                style={{ fontWeight: 'bold' }}
              >
                Svi {navSatovi[openIdx].label}
              </Link>
              {navSatovi[openIdx].children.map((c) => (
                <Link
                  key={c.label}
                  className="navbar__pill"
                  to={`/catalog?brand=${encodeURIComponent(
                    navSatovi[openIdx].label
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
