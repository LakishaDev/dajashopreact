import React, { useEffect, useRef, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const nav = useNavigate();

  const hasValue = q.trim().length > 0;

  function submit() {
    const v = q.trim();
    if (!v) return;
    nav(`/catalog?q=${encodeURIComponent(v)}`);
  }

  function clear() {
    setQ("");
    inputRef.current?.focus();
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      clear();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  // "/" fokusira kada ne kucaš u nekom polju
  useEffect(() => {
    function onDocKey(e) {
      const el = document.activeElement;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onDocKey);
    return () => window.removeEventListener("keydown", onDocKey);
  }, []);

  return (
    <div
      className={[
        "searchNeo",
        focused ? "is-focused" : "",
        hasValue ? "has-value" : "",
      ].join(" ")}
      role="search"
      aria-label="Pretraga"
      onMouseDown={() => inputRef.current?.focus()}
    >
      <Search className="s2__leading" size={18} aria-hidden />

      <input
        ref={inputRef}
        className="s2__input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Pretraži modele, brendove…"
        inputMode="search"
        autoComplete="off"
        aria-label="Unesi termin za pretragu"
      />

      <button
        type="button"
        className="s2__clear"
        onClick={clear}
        aria-label="Obriši"
        tabIndex={hasValue ? 0 : -1}
      >
        <X size={14} />
      </button>

      <button
        type="button"
        className="s2__submit"
        onClick={submit}
        disabled={!hasValue}
        aria-label="Traži"
        tabIndex={hasValue ? 0 : -1}
      >
        <ArrowRight className="s2__submitIcon" size={18} />
        <span className="s2__pulse" aria-hidden />
      </button>
    </div>
  );
}
