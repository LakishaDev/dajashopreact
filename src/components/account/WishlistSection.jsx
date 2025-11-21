// src/components/account/WishlistSection.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { money } from '../../utils/currency.js'; // Uvezeno

function WishlistSection() {
  const savedItems = [
    {
      id: 1,
      name: 'Casio G-Shock',
      price: 14500,
      image:
        '/images/casio-g-shock-original-ga-2100-4aer-carbon-core-guard_183960_205228.jpg',
      brand: 'CASIO',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Lista želja</h3>
      </div>
      {savedItems.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} className="text-muted" style={{ opacity: 0.3 }} />
          <p>Još niste sačuvali nijedan sat.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="card glass p-4 flex items-center gap-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover bg-white"
              />
              <div className="flex-1">
                <h4 className="font-bold text-sm md:text-base">{item.name}</h4>
                <p className="text-[var(--color-primary)] font-mono text-sm">
                  {money(item.price)}
                </p>
              </div>
              <button className="btn-icon-danger" title="Ukloni">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default WishlistSection;
