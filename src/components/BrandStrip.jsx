import React from 'react';
import './BrandStrip.css';
import { Link } from 'react-router-dom';

export default function BrandStrip({ brands = [] }) {
  // Funkcija koja određuje pravi link za svaku stavku
  const getBrandUrl = (label) => {
    const upper = label.toUpperCase().trim();

    // --- 1. POSEBNE STRANICE (Iz Navbara - Ostalo) ---
    if (upper === 'DALJINSKI') return '/daljinski';
    if (upper === 'BATERIJE') return '/baterije';
    if (upper === 'NAOČARE' || upper === 'NAOCARE') return '/naocare';

    // --- 2. POD-KATEGORIJE PO BRENDOVIMA (Kolekcije) ---
    // Casio
    if (upper === 'RETRO') return '/catalog?brand=CASIO&category=RETRO';
    if (upper === 'G-SHOCK') return '/catalog?brand=CASIO&category=G-SHOCK';
    if (upper === 'BABY-G') return '/catalog?brand=CASIO&category=BABY-G';
    if (upper === 'EDIFICE') return '/catalog?brand=CASIO&category=EDIFICE';

    // Orient
    if (upper.includes('DIVERS'))
      return '/catalog?brand=ORIENT&category=200m%20DIVERS';

    // --- 3. OPŠTE KATEGORIJE (Pol) ---
    if (upper === 'MUŠKI' || upper === 'MUSKI')
      return '/catalog?category=MUŠKI';
    if (upper === 'ŽENSKI' || upper === 'ZENSKI')
      return '/catalog?category=ŽENSKI';

    // --- 4. PODRAZUMEVANO (Pretraga po brendu) ---
    // Za Daniel Klein, Q&Q, Casio, Orient, Seiko...
    return `/catalog?brand=${encodeURIComponent(label)}`;
  };

  // Dupliramo listu da bi animacija bila "beskonačna"
  const looped = [...brands, ...brands];

  return (
    <section className="brandstrip">
      <div className="container brandstrip__row">
        <div className="brandstrip__track">
          {looped.map((b, i) => {
            const url = getBrandUrl(b);

            return (
              <Link
                key={`${b}-${i}`}
                className="brandstrip__item"
                to={url}
                aria-label={`Pogledaj ${b}`}
              >
                {b}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
