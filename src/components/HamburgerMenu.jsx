// ==============================
// Desktop: mala drop-lista (centrirana ispod dugmeta)
// Mobile: slide-over panel
// ==============================
import React, {
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./HamburgerMenu.css";

const DROPDOWN_WIDTH = 220; // ⇦ promeni ako želiš šire/uže (menjaš i u CSS/style)

export default function HamburgerMenu({
  open,
  onClose,
  count = 0,
  user = null,
  anchorEl = null, // ref ka hamburger dugmetu u Header-u
}) {
  const isDesktop = useIsDesktop();
  const loc = useLocation();

  // auto-zatvori na promenu rute
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname]);

  return isDesktop ? (
    <DesktopDropdown
      open={open}
      onClose={onClose}
      count={count}
      user={user}
      anchorEl={anchorEl}
    />
  ) : (
    <MobileSheet open={open} onClose={onClose} count={count} user={user} />
  );
}

/* ----- hook: desktop detekcija ----- */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width:1024px)").matches
      : false
  );
  useEffect(() => {
    const m = window.matchMedia("(min-width:1024px)");
    const fn = () => setIsDesktop(m.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return isDesktop;
}

/* ----- DESKTOP: centriran dropdown ----- */
function DesktopDropdown({ open, onClose, count, user, anchorEl }) {
  const ddRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

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
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, recalc]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    const onDown = (e) => {
      if (!ddRef.current) return;
      const clickInDrop = ddRef.current.contains(e.target);
      const clickInBtn = anchorEl?.current?.contains(e.target);
      if (!clickInDrop && !clickInBtn) onClose?.();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
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
            position: "fixed",
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
            {user ? (
              <DDItem to="/account" label="Moj nalog" onClose={onClose} />
            ) : (
              <DDItem to="/login" label="Prijava / Registracija" onClose={onClose} />
            )}
            <DDItem to="/cart" label={`Korpa (${count})`} onClose={onClose} strong />
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DDItem({ to, label, strong, onClose }) {
  return (
    <Link
      to={to}
      className={`hm__ddItem${strong ? " is-strong" : ""}`}
      role="menuitem"
      onClick={onClose}
    >
      {label}
    </Link>
  );
}

/* ----- MOBILE: slide-over panel ----- */
function MobileSheet({ open, onClose, count, user }) {
  const panelRef = useRef(null);
  const firstFocusableRef = useRef(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables?.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus(); e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus(); e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFocusableRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  const onBackdropClick = useCallback(
    (e) => {
      if (e.target.getAttribute("data-backdrop") === "1") onClose?.();
    },
    [onClose]
  );

  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, transition: { duration: 0.16 } },
  };
  const panel = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 420, damping: 36 },
    },
    exit: { x: "100%", transition: { duration: 0.18 } },
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
            <div className="hm__head">
              <h2 id="hm-title" className="hm__title">Meni</h2>
              <button
                ref={firstFocusableRef}
                className="hm__close"
                aria-label="Zatvori meni"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            <nav className="hm__nav">
              <Link className="hm__link" to="/about" onClick={onClose}>O nama</Link>
              <Link className="hm__link" to="/catalog" onClick={onClose}>Prodavnica</Link>
              <Link className="hm__link" to="/usluge" onClick={onClose}>Usluge</Link>

              {user ? (
                <Link className="hm__link" to="/account" onClick={onClose}>Moj nalog</Link>
              ) : (
                <Link className="hm__link" to="/login" onClick={onClose}>Prijava / Registracija</Link>
              )}

              <Link className="hm__link hm__cart" to="/cart" onClick={onClose}>
                <span className="hm__cartIcon">🛒</span>
                <span>Korpa</span>
                <span className="hm__badge">{count}</span>
              </Link>
            </nav>

            <div className="hm__footer">
              <Link to="/kontakt" className="hm__muted" onClick={onClose}>Kontakt</Link>
              <span className="hm__dot">•</span>
              <Link to="/faq" className="hm__muted" onClick={onClose}>FAQ</Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
/* ----- KRAJ ----- */