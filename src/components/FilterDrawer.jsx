import React, { useEffect, useState, useCallback } from "react";
import "./FilterBar.css";
import { useSearchParams } from "react-router-dom";
import Filters from "./Filters";

/* Broj aktivnih filtera iz URL-a */
function useActiveCount() {
  const [sp] = useSearchParams();
  const [count, setCount] = useState(0);

  const calc = useCallback(() => {
    const sum =
      sp.getAll("brand").length +
      sp.getAll("gender").length +
      sp.getAll("category").length +
      (sp.get("min") || sp.get("max") ? 1 : 0);
    setCount(sum);
  }, [sp]);

  useEffect(() => { calc(); }, [calc]);
  return count;
}

/* Zaključaj body dok je sheet otvoren (iOS-safe) */
function useLockBody(isLocked) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    let scrollY = 0;

    if (isLocked) {
      scrollY = window.scrollY || window.pageYOffset;
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      html.style.height = "100%";
    }

    return () => {
      const y = body.style.top;
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overscrollBehavior = "";
      html.style.height = "";
      if (y) {
        const restore = parseInt(y.replace("-", ""), 10) || 0;
        window.scrollTo(0, restore);
      }
    };
  }, [isLocked]);
}

/**
 * FilterBar – sedi ispod headera, full width u katalogu.
 * Header visinu čita iz CSS varijable --header-h (fallback 64px).
 */
export default function FilterBar() {
  const [open, setOpen] = useState(false);
  const active = useActiveCount();

  useLockBody(open);

  // ESC za zatvaranje
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fokus na dugme "Zatvori" pri otvaranju
  const setInitialFocus = (node) => {
    if (node) {
      const btn = node.querySelector(".fb-close");
      if (btn) btn.focus();
    }
  };

  return (
    <>
      {/* Traka ispod headera */}
      <div className="filterbar" role="region" aria-label="Filter traka">
        <button
          type="button"
          className="fb-button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="filters-sheet"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 5h18M6 12h12M10 19h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Filteri</span>
          {active > 0 && <span className="fb-badge" aria-label={`${active} aktivno`}>{active}</span>}
        </button>
      </div>

      {/* Overlay koji počinje ispod headera */}
      {open && (
        <div
          className="fb-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filteri"
          id="filters-sheet"
          onClick={(e) => {
            if (e.target.classList.contains("fb-overlay")) setOpen(false);
          }}
        >
          <div className="fb-sheet" ref={setInitialFocus}>
            <div className="fb-topbar">
              <button
                type="button"
                className="fb-close"
                onClick={() => setOpen(false)}
                aria-label="Zatvori filtere"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Zatvori</span>
              </button>
              <div className="fb-title">
                <span>Filteri</span>
                {active > 0 && <span className="fb-badge">{active}</span>}
              </div>
              <div className="fb-spacer" />
            </div>

            <div className="fb-content">
              {/* Tvoj postojeći Filters UI */}
              <Filters />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
