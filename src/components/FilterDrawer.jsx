import React, { useEffect, useState, useCallback } from "react";
import "./FilterDrawer.css";
import { useSearchParams } from "react-router-dom";
import Filters from "./Filters";

/** Utility: izračunaj ukupan broj aktivnih filtera */
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

  useEffect(() => {
    calc();
  }, [calc]);

  return count;
}

/** Hook za zabranu skrolovanja kad je drawer otvoren */
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


export default function FilterDrawer({ className = "" }) {
  const [open, setOpen] = useState(false);
  const activeCount = useActiveCount();

  useLockBody(open);

  // ESC za zatvaranje
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fokus po otvaranju
  const setInitialFocus = (node) => {
    if (node) {
      const btn = node.querySelector(".fd-close");
      if (btn) btn.focus();
    }
  };

  return (
    <>
      {/* Trigger dugme (vidljivo primarno na mobilnom, ali može i na desktopu po želji) */}
      <button
        type="button"
        className={`fd-trigger ${className}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="filter-drawer"
      >
        {/* Ikonica filter (SVG) */}
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M3 5h18M6 12h12M10 19h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>Filteri</span>
        {activeCount > 0 && (
          <span className="fd-badge" aria-label={`${activeCount} aktivno`}>
            {activeCount}
          </span>
        )}
      </button>

      {/* Overlay + Drawer */}
      {open && (
        <div
          className="fd-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filteri"
          id="filter-drawer"
          onClick={(e) => {
            if (e.target.classList.contains("fd-overlay")) setOpen(false);
          }}
        >
          <div className="fd-sheet" ref={setInitialFocus}>
            <div className="fd-topbar">
              <button
                type="button"
                className="fd-close"
                onClick={() => setOpen(false)}
                aria-label="Zatvori filtere"
              >
                {/* X ikonica */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Zatvori</span>
              </button>
              <div className="fd-title">
                <span>Filteri</span>
                {activeCount > 0 && (
                  <span className="fd-badge">{activeCount}</span>
                )}
              </div>
              <div className="fd-spacer" />
            </div>

            <div className="fd-content">
              {/* Reuse desktop Filters UI unutra (isti komponent) */}
              <Filters />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
