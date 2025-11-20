/**
 * @file src/components/HamburgerMenu.jsx
 * @description Hamburger Menu za mobilne i dropdown za desktop. Integracija sa AuthModal.
 * @version 1.0.1
 */
import React, {
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js'; // <-- NOVO: Import useAuth
// 👇 Nove ikonice za footer menija
import {
  Phone,
  HelpCircle,
  Facebook,
  Instagram,
  MapPin,
  X,
} from 'lucide-react';
import './HamburgerMenu.css';
import { ADMIN_EMAILS } from '../services/firebase.js';

const DROPDOWN_WIDTH = 220;

export default function HamburgerMenu({
  open,
  onClose,
  count = 0,
  user = null,
  anchorEl = null,
}) {
  const isDesktop = useIsDesktop();
  const loc = useLocation();
  const { showAuth } = useAuth(); // <-- NOVO: Dohvatamo showAuth funkciju

  useEffect(() => {
    if (open) onClose?.(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    isDesktop ? (
      <DesktopDropdown
        open={open}
        onClose={onClose}
        count={count}
        user={user}
        anchorEl={anchorEl}
        showAuth={showAuth} // <-- Prosleđujemo
      />
    ) : (
      <MobileSheet
        open={open}
        onClose={onClose}
        user={user}
        showAuth={showAuth} // <-- Prosleđujemo
      />
    ),
    document.body
  );
}

/* ----- hook: desktop detekcija (ostaje nepromenjen) ----- */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width:1024px)').matches
      : false
  );
  useEffect(() => {
    const m = window.matchMedia('(min-width:1024px)');
    const fn = () => setIsDesktop(m.matches);
    m.addEventListener?.('change', fn);
    return () => m.removeEventListener?.('change', fn);
  }, []);
  return isDesktop;
}

/* ----- DESKTOP: centriran dropdown ----- */
function DesktopDropdown({ open, onClose, count, user, anchorEl, showAuth }) {
  const ddRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  const recalc = useCallback(() => {
    if (!anchorEl?.current) return;
    const r = anchorEl.current.getBoundingClientRect();
    const GAP = 8;
    const leftCentered = Math.round(r.left + r.width / 2 - DROPDOWN_WIDTH / 2);
    const clampedLeft = Math.max(
      8,
      Math.min(leftCentered, window.innerWidth - DROPDOWN_WIDTH - 8)
    );
    setPos({ top: Math.round(r.bottom + GAP), left: clampedLeft });
  }, [anchorEl]);

  useLayoutEffect(() => {
    if (!open) return;
    recalc();
    const onScroll = () => recalc();
    const onResize = () => recalc();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, recalc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    const onDown = (e) => {
      if (!ddRef.current) return;
      const clickInDrop = ddRef.current.contains(e.target);
      const clickInBtn = anchorEl?.current?.contains(e.target);
      if (!clickInDrop && !clickInBtn) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [open, onClose, anchorEl]);

  const variants = {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.14 } },
    exit: { opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ddRef}
          className="hm__dropdown card"
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: DROPDOWN_WIDTH,
            zIndex: 90,
          }}
          role="menu"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <nav className="hm__ddNav">
            <DDItem to="/about" label="O nama" onClose={onClose} />

            <DDItem to="/catalog" label="Prodavnica" onClose={onClose} />
            <DDItem to="/usluge" label="Usluge" onClose={onClose} />

            {/* NOVO: Dodati Kontakt i Pomoć (FAQ) linkovi */}
            <DDItem to="/contact" label="Kontakt" onClose={onClose} />
            <DDItem to="/faq" label="Pomoć / FAQ" onClose={onClose} />

            {isAdmin && (
              <DDItem to="/admin" label="Admin Panel" onClose={onClose} />
            )}

            {user ? (
              <DDItem to="/account" label="Moj nalog" onClose={onClose} />
            ) : (
              <button // <-- IZMENA: Dugme za otvaranje modala
                type="button"
                role="menuitem"
                className="hm__ddItem"
                onClick={() => {
                  showAuth('login');
                  onClose();
                }}
              >
                Prijava / Registracija
              </button>
            )}

            <DDItem
              to="/cart"
              label={`Korpa (${count})`}
              onClose={onClose}
              strong
            />
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DDItem({ to, label, strong, onClose }) {
  // U DesktopDropdown-u se koristi samo za rutiranje
  return (
    <Link
      to={to}
      className={`hm__ddItem${strong ? ' is-strong' : ''}`}
      role="menuitem"
      onClick={onClose}
    >
      {label}
    </Link>
  );
}

/* ----- MOBILE: slide-over panel ----- */
function MobileSheet({ open, onClose, user, showAuth }) {
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const { items, count } = useCart();
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase());

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFocusableRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  const onBackdropClick = useCallback(
    (e) => {
      if (e.target.getAttribute('data-backdrop') === '1') onClose?.();
    },
    [onClose]
  );

  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.16 } },
  };
  const panel = {
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: { type: 'spring', stiffness: 420, damping: 36 },
    },
    exit: { x: '100%', transition: { duration: 0.18 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="hm__backdrop"
          data-backdrop="1"
          role="presentation"
          onMouseDown={onBackdropClick}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdrop}
          style={{ zIndex: 9999 }}
        >
          <motion.aside
            id="hm-panel"
            ref={panelRef}
            className="hm__panel card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hm-title"
            variants={panel}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120 || info.velocity.x > 800) onClose?.();
            }}
          >
            {/* HEADER MENIJA */}
            <div className="hm__head">
              <h2 id="hm-title" className="hm__title">
                Meni
              </h2>

              <button
                ref={firstFocusableRef}
                className="hm__close"
                aria-label="Zatvori meni"
                onClick={onClose}
              >
                <X size={24} />
              </button>
            </div>
            {/* NAVIGACIJA */}
            <nav className="hm__nav">
              <Link className="hm__link" to="/about" onClick={onClose}>
                O nama
              </Link>

              <Link className="hm__link" to="/catalog" onClick={onClose}>
                Prodavnica
              </Link>

              <Link className="hm__link" to="/usluge" onClick={onClose}>
                Usluge
              </Link>

              {user ? (
                <>
                  <Link className="hm__link" to="/account" onClick={onClose}>
                    Moj nalog
                  </Link>

                  {isAdmin && (
                    <Link className="hm__link" to="/admin" onClick={onClose}>
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <button // <-- IZMENA: Dugme za otvaranje modala
                  type="button"
                  className="hm__link"
                  onClick={() => {
                    showAuth('login');
                    onClose();
                  }}
                >
                  Prijava / Registracija
                </button>
              )}

              <Link className="hm__link hm__cart" to="/cart" onClick={onClose}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="hm__cartIcon" style={{ margin: 0 }}>
                    🛒
                  </span>
                  <span>Korpa</span>
                </div>
                <span className="hm__badge">{count}</span>
              </Link>
              {/* Mini Cart Items */}
              {items.length > 0 && (
                <div className="hm__miniCart">
                  {items.map((item) => (
                    <div key={item.id} className="hm__miniItem">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="hm__miniImg"
                        loading="lazy"
                      />

                      <div className="hm__miniInfo">
                        <div className="hm__miniName">{item.name}</div>

                        <div className="hm__miniQty">{item.qty} kom.</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </nav>
            {/* NOVI FOOTER MENIJA - "STICKY" DNO */}
            <div className="hm__footer">
              <div className="hm__f-info">
                <Link to="/contact" className="hm__f-btn" onClick={onClose}>
                  <Phone size={16} /> Kontakt
                </Link>

                <Link to="/faq" className="hm__f-btn" onClick={onClose}>
                  <HelpCircle size={16} /> Pomoć
                </Link>

                {/* IZMENJENO: Lokacija sada vodi na Contact */}
                <Link to="/contact" className="hm__f-btn" onClick={onClose}>
                  <MapPin size={16} /> Lokacija
                </Link>
              </div>

              <div className="hm__f-bottom">
                <div className="hm__f-socials">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                  >
                    <Facebook size={18} />
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                </div>

                <div className="hm__f-copy">
                  Daja Shop © {new Date().getFullYear()}
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
