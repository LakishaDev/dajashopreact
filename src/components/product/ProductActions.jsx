import React from 'react';
import { Heart } from 'lucide-react';
import './ProductActions.css'; // OBAVEZNO: Uvozi svoj CSS

export default function ProductActions({ onAdd, onWishlist, isLiked }) {
  return (
    <div className="actions-container">
      {/* Dugme Dodaj u korpu */}
      <button className="cta-button" onClick={onAdd}>
        Dodaj u korpu
      </button>

      {/* Dugme Lista želja (Srce) */}
      <button
        className="wishlist-button"
        onClick={onWishlist}
        title={isLiked ? 'Ukloni iz želja' : 'Dodaj u želje'}
      >
        <Heart
          size={24}
          className={isLiked ? 'heart-icon active' : 'heart-icon'}
        />
      </button>
    </div>
  );
}
