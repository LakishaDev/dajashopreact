import React, { useState } from "react";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  function submit(e) {
    e.preventDefault();
    nav(`/catalog?q=${encodeURIComponent(q)}`);
  }
  return (
    <form className="search" onSubmit={submit} role="search">
      <input
        className="search__input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pretraga satova…"
      />
      <button className="search__btn" type="submit">
        Traži
      </button>
    </form>
  );
}
