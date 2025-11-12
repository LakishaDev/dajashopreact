import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import SearchBar from "./SearchBar.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import { useCart } from "../context/CartContext.jsx";
import FilterDrawer from "../components/FilterDrawer";
import Filters from "./Filters.jsx";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="header card shadow">
      <div className="container header__row">
        <Link to="/" className="header__brand">
          DajaShop
        </Link>
        <SearchBar />
        <div className="header__actions">
          <ThemeSwitcher />
          <Link className="header__cart" to="/cart">
            Korpa <span className="badge">{count}</span>
          </Link>
          <Link to="/account" className="header__account">
            Moj nalog
          </Link>

          
        </div>
      </div>
      <NavBar />
    </header>
  );
}
