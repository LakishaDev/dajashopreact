import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import SearchBar from "./SearchBar.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import { useCart } from "../hooks/useCart.js";
import HeaderLoginButton from "./HeaderLoginButton.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useState } from "react";

import HamburgerMenu from "./HamburgerMenu.jsx";

export default function Header() {
  const { count } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header card shadow">
      {/* GRID: desktop (brand | search | actions), mobile (brand+actions | search) */}
      <div className="container header__grid">
        <Link to="/" className="header__brand">
          DajaShop
        </Link>

        <div className="header__search">
          <SearchBar />
        </div>

        <div className="header__actions">
          {/* <ThemeSwitcher /> */}
          <button
            className="hamburger"
            aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
            aria-expanded={menuOpen}
            aria-controls="hm-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
          <Link className="header__cart" to="/cart">
            Korpa <span className="badge">{count}</span>
          </Link>
          {user && (
            <Link to="/account" className="header__account">
              Moj nalog
            </Link>
          )}
          <HeaderLoginButton />
        </div>
      </div>

      <NavBar />
        {/* ⬇️ OVO JE FALILO: ubaci slide-over meni */}
     <HamburgerMenu
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  count={count}
  user={user}
/>
    </header>
  );
}
