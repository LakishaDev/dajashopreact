import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__glass">
        <div className="container footer__content">
          {/* 1. Brand & Intro */}
          <div className="footer__col brand-col">
            <Link to="/" className="footer__brand">
              Daja Shop
            </Link>
            <p className="footer__desc">
              Vaša pouzdana destinacija za originalne satove od 2007. Kvalitet,
              tradicija i stil na jednom mestu.
            </p>
            <div className="footer__socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* 2. Linkovi */}
          <div className="footer__col">
            <h3 className="footer__title">Istraži</h3>
            <nav className="footer__nav">
              <Link to="/catalog">Muški satovi</Link>
              <Link to="/catalog">Ženski satovi</Link>
              <Link to="/about">O nama</Link>
              <Link to="/contact">Kontakt</Link>
            </nav>
          </div>

          {/* 3. Kontakt Info - MODIFIKOVANO */}
          <div className="footer__col">
            <h3 className="footer__title">Kontakt</h3>
            <ul className="footer__contact">
              <li>
                <Link
                  to="/contact"
                  className="footer__contact-link"
                  aria-label="Adresa"
                >
                  <MapPin size={18} />
                  <span>Niš, TPC Gorča lokal C31</span>
                </Link>
              </li>
              <li>
                <a
                  href="tel:+381641262425"
                  className="footer__contact-link"
                  aria-label="Telefonski broj"
                >
                  <Phone size={18} />
                  <span>064/126-24-25</span>
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="footer__contact-link"
                  aria-label="Email adresa"
                >
                  <Mail size={18} />
                  <span>cvelenis42@yahoo.com</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Radno vreme */}
          <div className="footer__col">
            <h3 className="footer__title">Radno vreme</h3>
            <ul className="footer__hours">
              <li>
                <span>Pon – Pet:</span> 10:00 – 20:00
              </li>
              <li>
                <span>Subota:</span> 10:00 – 15:00
              </li>
              <li>
                <span>Nedelja:</span> Zatvoreno
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <div className="container footer__bottomWrap">
            <p>&copy; {year} Daja Shop. Sva prava zadržana.</p>
            <div className="footer__links">
              <Link to="/terms">Uslovi korišćenja</Link>
              <Link to="/privacy">Politika privatnosti</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
