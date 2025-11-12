import React, { useEffect, useMemo, useState } from "react";
import "./Filters.css";
import { useSearchParams } from "react-router-dom";
import catalog from "../services/CatalogService.js";

/** Mali header za sekciju sa badge i "Očisti" */
function SectionHeader({ title, count, onClear }) {
  return (
    <div className="f-head">
      <span className="f-title">{title}</span>
      <div className="f-actions">
        {count > 0 && (
          <span className="f-badge" aria-label={`${count} izabrano`}>
            {count}
          </span>
        )}
        {count > 0 && (
          <button type="button" className="f-clear" onClick={onClear}>
            Očisti
          </button>
        )}
      </div>
    </div>
  );
}

export default function Filters() {
  // Pretpostavka: catalog.* vraća niz stringova
  const brands = useMemo(() => catalog.brands(), []);
  const genders = useMemo(() => catalog.genders(), []);
  const categories = useMemo(() => catalog.categories(), []);

  const [sp, setSp] = useSearchParams();
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");

  // Helper za sigurno menjanje URLSearchParams
  function setParams(mutator) {
    const next = new URLSearchParams(sp);
    mutator(next);
    setSp(next, { replace: true });
  }

  function toggleParam(key, val) {
    setParams((p) => {
      const arr = p.getAll(key);
      const has = arr.includes(val);
      p.delete(key);
      (has ? arr.filter((x) => x !== val) : [...arr, val]).forEach((v) =>
        p.append(key, v)
      );
    });
  }

  function checked(key, val) {
    return sp.getAll(key).includes(val);
  }

  function countSelected(key) {
    return sp.getAll(key).length;
  }

  function clearKey(key) {
    setParams((p) => p.delete(key));
  }

  function clearAll() {
    setParams((p) => {
      ["brand", "gender", "category", "min", "max"].forEach((k) => p.delete(k));
    });
    setMin("");
    setMax("");
  }

  function setRange() {
    setParams((p) => {
      if (min) p.set("min", min);
      else p.delete("min");
      if (max) p.set("max", max);
      else p.delete("max");
    });
  }

  // Sync local state sa URL-a
  useEffect(() => {
    setMin(sp.get("min") || "");
    setMax(sp.get("max") || "");
  }, [sp]);

  const activeTotal =
    countSelected("brand") +
    countSelected("gender") +
    countSelected("category") +
    (sp.get("min") || sp.get("max") ? 1 : 0);

  return (
    <aside className="filters card glass" aria-label="Filteri kataloga">
      {/* Top bar */}
      <div className="f-top">
        <h3 className="f-top-title">Filteri</h3>
        <div className="f-top-actions">
          {activeTotal > 0 && <span className="f-badge">{activeTotal}</span>}
          {activeTotal > 0 && (
            <button type="button" className="f-clear" onClick={clearAll}>
              Očisti sve
            </button>
          )}
        </div>
      </div>

      {/* Brend */}
      <section className="f-section" aria-label="Brend">
        <SectionHeader
          title="Brend"
          count={countSelected("brand")}
          onClear={() => clearKey("brand")}
        />
        <div className="chips" role="group" aria-label="Brend">
          {brands.map((b) => (
            <label key={b} className="chip">
              <input
                type="checkbox"
                checked={checked("brand", b)}
                onChange={() => toggleParam("brand", b)}
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Pol */}
      <section className="f-section" aria-label="Pol">
        <SectionHeader
          title="Pol"
          count={countSelected("gender")}
          onClear={() => clearKey("gender")}
        />
        <div className="chips" role="group" aria-label="Pol">
          {genders.map((g) => (
            <label key={g} className="chip">
              <input
                type="checkbox"
                checked={checked("gender", g)}
                onChange={() => toggleParam("gender", g)}
              />
              <span>{g}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Kategorija */}
      <section className="f-section" aria-label="Kategorija">
        <SectionHeader
          title="Kategorija"
          count={countSelected("category")}
          onClear={() => clearKey("category")}
        />
        <div className="chips" role="group" aria-label="Kategorija">
          {categories.map((c) => (
            <label key={c} className="chip">
              <input
                type="checkbox"
                checked={checked("category", c)}
                onChange={() => toggleParam("category", c)}
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Cena */}
      <section className="f-section" aria-label="Cena">
        <SectionHeader
          title="Cena"
          count={sp.get("min") || sp.get("max") ? 1 : 0}
          onClear={() =>
            setParams((p) => {
              p.delete("min");
              p.delete("max");
            })
          }
        />
        <div className="price">
          <div className="price-inputs">
            <div className="input">
              <span className="prefix">Min</span>
              <input
                inputMode="numeric"
                value={min}
                onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setMin((v) => (v.length > 9 ? v.slice(0, 9) : v))}
                placeholder="0"
                aria-label="Minimalna cena"
              />
              <span className="suffix">RSD</span>
            </div>
            <div className="input">
              <span className="prefix">Max</span>
              <input
                inputMode="numeric"
                value={max}
                onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
                onBlur={() => setMax((v) => (v.length > 9 ? v.slice(0, 9) : v))}
                placeholder="50000"
                aria-label="Maksimalna cena"
              />
              <span className="suffix">RSD</span>
            </div>
          </div>

          <div className="price-actions">
            <button type="button" className="btn-primary" onClick={setRange}>
              Primeni
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setMin("");
                setMax("");
              }}
            >
              Reset polja
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}
