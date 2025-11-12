import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import SearchBar from "./SearchBar.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import { useCart } from "../hooks/useCart.js";
import HeaderLoginButton from "./HeaderLoginButton.jsx";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="header card shadow">
      {/* GRID: desktop (brand | search | actions), mobile (brand+actions | search) */}
      <div className="container header__grid">
        <Link to="/" className="header__brand">DajaShop</Link>

        <div className="header__search">
          <SearchBar />
        </div>

        <div className="header__actions">
          <ThemeSwitcher />
          <Link className="header__cart" to="/cart">
            Korpa <span className="badge">{count}</span>
          </Link>
          <Link to="/account" className="header__account">
            Moj nalog
          </Link>
          <HeaderLoginButton />
        </div>
      </div>

      <NavBar />
    </header>
  );
}
