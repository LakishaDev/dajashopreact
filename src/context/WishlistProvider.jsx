import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from 'react';
import { useFlash } from '../hooks/useFlash';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('daja_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { flash } = useFlash();
  const { user, userInfo } = useAuth();
  const isServerUpdate = useRef(false);

  // 1. Dolazni podaci (Real-time iz baze)
  useEffect(() => {
    if (user && userInfo && userInfo.wishlist) {
      const currentStr = JSON.stringify(wishlist);
      const serverStr = JSON.stringify(userInfo.wishlist);

      if (currentStr !== serverStr) {
        isServerUpdate.current = true;
        setWishlist(userInfo.wishlist);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userInfo]);

  // 2. Merge lokalnih želja pri prvom loginu
  useEffect(() => {
    if (
      user &&
      wishlist.length > 0 &&
      (!userInfo || !userInfo.wishlist || userInfo.wishlist.length === 0)
    ) {
      const syncLocal = async () => {
        await setDoc(doc(db, 'users', user.uid), { wishlist }, { merge: true });
      };
      syncLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 3. Čuvanje promena (User Action -> DB/Local)
  useEffect(() => {
    if (isServerUpdate.current) {
      isServerUpdate.current = false;
      return;
    }

    if (user) {
      const saveToDb = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, { wishlist: wishlist }, { merge: true });
        } catch (error) {
          console.error('Wishlist save error:', error);
        }
      };
      const t = setTimeout(saveToDb, 500);
      return () => clearTimeout(t);
    } else {
      localStorage.setItem('daja_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

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

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    flash('Uklonjeno', 'Proizvod uklonjen iz liste želja.', 'info');
  };

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
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
        addToWishlist,
        isInWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
