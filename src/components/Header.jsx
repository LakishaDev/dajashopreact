import React, { useState, useRef } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import SearchBar from './SearchBar.jsx';
import { useCart } from '../hooks/useCart.js';
import HeaderLoginButton from './HeaderLoginButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistProvider.jsx';

import HamburgerMenu from './HamburgerMenu.jsx';

export default function Header() {
  const { count, cart } = useCart();
  const { count: wishlistCount } = useWishlist();
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
          {/* IZMENA OVDE: Dodato ?tab=wishlist */}

          <Link className="header__cart" to="/cart">
            Korpa <span className="badge">{count}</span>
          </Link>
          <Link
            className="header__cart"
            to="/account?tab=wishlist"
            title="Lista želja"
          >
            <Heart size={22} />
            {wishlistCount > 0 && (
              <span className="badge">{wishlistCount}</span>
            )}
          </Link>
          <HeaderLoginButton />

          <button
            ref={anchorRef}
            className="hamburger"
            aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
            aria-expanded={menuOpen}
            aria-controls="hm-panel"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <NavBar />

      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        count={count}
        cart={cart}
        user={user}
        anchorEl={anchorRef}
      />
    </header>
  );
}
