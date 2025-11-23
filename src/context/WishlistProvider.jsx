import React, { createContext, useState, useEffect, useContext } from 'react';
import { useFlash } from '../hooks/useFlash';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('daja_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const { flash } = useFlash();

  useEffect(() => {
    localStorage.setItem('daja_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Standardni toggle (za srce dugme)
  const toggleWishlist = (product) => {
    const exists = wishlist.find((item) => item.id === product.id);

    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      flash('Uklonjeno', 'Proizvod uklonjen iz liste želja.', 'info');
    } else {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        slug: product.slug,
      };
      setWishlist((prev) => [...prev, itemToAdd]);
      flash('Sačuvano', 'Proizvod dodat u listu želja.', 'success');
    }
  };

  // Samo za brisanje
  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    flash('Uklonjeno', 'Proizvod uklonjen iz liste želja.', 'info');
  };

  // --- NOVO: SAMO ZA UNDO ---
  // Ova funkcija nasilno vraća proizvod u listu bez toggle provere
  const addToWishlist = (product) => {
    setWishlist((prev) => {
      // Provera da ne dupliramo za svaki slučaj
      if (prev.some((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
    // Opciono: Možemo prikazati poruku ili ne
    flash('Vraćeno', 'Proizvod vraćen u listu želja.', 'success');
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        addToWishlist, // <--- Izvozimo novu funkciju
        isInWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
