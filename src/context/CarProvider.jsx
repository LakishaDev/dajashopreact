import { useEffect, useMemo, useReducer, useRef } from 'react';
import { CartCtx } from './CartContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Inicijalno samo za goste
const initial = () => {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const i = state.findIndex((x) => x.id === action.item.id);
      if (i >= 0) {
        const next = [...state];
        next[i] = { ...next[i], qty: next[i].qty + (action.qty || 1) };
        return next;
      }
      return [...state, { ...action.item, qty: action.qty || 1 }];
    }
    case 'REMOVE':
      return state.filter((x) => x.id !== action.id);
    case 'SET_QTY':
      return state.map((x) =>
        x.id === action.id ? { ...x, qty: Math.max(1, action.qty) } : x
      );
    case 'CLEAR':
      return [];
    case 'REPLACE':
      // Ovo koristimo kad stignu podaci iz baze
      return action.items || [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], initial);
  const { user, userInfo } = useAuth();

  // Zastavica koja nam govori da li je trenutna promena došla sa servera (baze)
  // ili od korisnika (klik mišem). Ovo sprečava "infinite loop".
  const isServerUpdate = useRef(false);

  // 1. SINHRONIZACIJA SA BAZOM (INCOMING - Baza -> Aplikacija)
  useEffect(() => {
    // Ako smo ulogovani i imamo podatke u bazi...
    if (user && userInfo && userInfo.cart) {
      // Proveravamo da li se korpa stvarno razlikuje da ne bi renderovali bezveze
      const currentCartStr = JSON.stringify(items);
      const serverCartStr = JSON.stringify(userInfo.cart);

      if (currentCartStr !== serverCartStr) {
        isServerUpdate.current = true; // Dižemo zastavicu: "Ovo je update sa servera!"
        dispatch({ type: 'REPLACE', items: userInfo.cart });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userInfo]); // Slušamo userInfo promene (real-time)

  // 2. MERGE KOD LOGOVANJA (Samo jednom kad se user pojavi)
  useEffect(() => {
    if (
      user &&
      items.length > 0 &&
      (!userInfo || !userInfo.cart || userInfo.cart.length === 0)
    ) {
      // Slučaj: Korisnik je bio gost, napunio korpu, pa se ulogovao.
      // A u bazi mu je korpa prazna. Treba da pošaljemo lokalnu korpu gore.
      const syncLocalToCloud = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, { cart: items }, { merge: true });
        } catch (err) {
          console.error('Merge error:', err);
        }
      };
      syncLocalToCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Okida se samo pri loginu

  // 3. ČUVANJE PROMENA (OUTGOING - Aplikacija -> Baza/Local)
  useEffect(() => {
    // Ako je promena došla sa servera (isServerUpdate je true), ne šaljemo nazad u bazu
    // jer je baza već ažurna. Samo resetujemo zastavicu.
    if (isServerUpdate.current) {
      isServerUpdate.current = false;
      return;
    }

    // Ako je promena došla od korisnika (kliknuo add/remove)...
    if (user) {
      // ... i korisnik je ulogovan -> Šalji u Firestore
      const saveToDb = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, { cart: items }, { merge: true });
        } catch (error) {
          console.error('Greška pri čuvanju korpe:', error);
        }
      };
      // Mali debounce da ne ubijemo bazu ako korisnik brzo klikće
      const timeoutId = setTimeout(saveToDb, 500);
      return () => clearTimeout(timeoutId);
    } else {
      // ... a ako je gost -> Šalji u LocalStorage
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, user]);

  const total = useMemo(
    () => items.reduce((s, x) => s + x.price * x.qty, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);

  const value = { items, dispatch, total, count };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
