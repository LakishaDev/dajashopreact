import React, { useState, useRef } from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import SearchBar from "./SearchBar.jsx";
import { useCart } from "../hooks/useCart.js";
import HeaderLoginButton from "./HeaderLoginButton.jsx";
import { useAuth } from "../hooks/useAuth.js";

import HamburgerMenu from "./HamburgerMenu.jsx";

export default function Header() {
  // 1. OVDE: Dodali smo 'cart' u destrukturiranje
  const { count, cart } = useCart();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const anchorRef = useRef(null);

  return (
    <header className="header card shadow">
      <div className="container header__grid">
        <Link to="/" className="header__brand">
          DajaShop
        </Link>

        <div className="header__search">
          <SearchBar />
        </div>

        <div className="header__actions">
          <Link className="header__cart" to="/cart">
            Korpa <span className="badge">{count}</span>
          </Link>
          
          {user && (
            <Link to="/account" className="header__account">
              Moj nalog
            </Link>
          )}
          
          <HeaderLoginButton />

          <button
            ref={anchorRef}
            className="hamburger"
            aria-label={menuOpen ? "Zatvori meni" : "Otvori meni"}
            aria-expanded={menuOpen}
            aria-controls="hm-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <NavBar />
      
      {/* 2. OVDE: Prosleđujemo 'cart' u meni */}
      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        count={count}
        cart={cart} // <--- NOVO
        user={user}
        anchorEl={anchorRef} 
      />
    </header>
  );
}