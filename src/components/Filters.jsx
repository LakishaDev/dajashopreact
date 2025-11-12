import React, { useEffect, useMemo, useState } from "react";
import "./Filters.css";
import { useSearchParams } from "react-router-dom";
import catalog from "../services/CatalogService.js";

export default function Filters() {
  const brands = useMemo(() => catalog.brands(), []);
  const genders = useMemo(() => catalog.genders(), []);
  const categories = useMemo(() => catalog.categories(), []);

  const [sp, setSp] = useSearchParams();
  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");

  function toggleParam(key, val) {
    const arr = sp.getAll(key) || [];
    const has = arr.includes(val);
    const next = has ? arr.filter((x) => x !== val) : [...arr, val];
    sp.delete(key);
    next.forEach((v) => sp.append(key, v));
    setSp(sp, { replace: true });
  }
  function setRange() {
    if (min) sp.set("min", min);
    else sp.delete("min");
    if (max) sp.set("max", max);
    else sp.delete("max");
    setSp(sp, { replace: true });
  }

  function checked(key, val) {
    return sp.getAll(key).includes(val);
  }

  useEffect(() => {
    setMin(sp.get("min") || "");
    setMax(sp.get("max") || "");
  }, [sp]);

  return (
    <aside className="filters card">
      <div className="filters__section">
        <div className="filters__title">Brend</div>
        <div className="filters__list">
          {brands.map((b) => (
            <label key={b}>
              <input
                type="checkbox"
                checked={checked("brand", b)}
                onChange={() => toggleParam("brand", b)}
              />{" "}
              {b}
            </label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Pol</div>
        <div className="filters__list">
          {genders.map((g) => (
            <label key={g}>
              <input
                type="checkbox"
                checked={checked("gender", g)}
                onChange={() => toggleParam("gender", g)}
              />{" "}
              {g}
            </label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Kategorija</div>
        <div className="filters__list">
          {categories.map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={checked("category", c)}
                onChange={() => toggleParam("category", c)}
              />{" "}
              {c}
            </label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Cena</div>
        <div className="filters__range">
          <input
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
          />
          <input
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
          />
          <button onClick={setRange}>Primeni</button>
        </div>
      </div>
    </aside>
  );
}
