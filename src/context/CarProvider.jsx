import { useEffect, useMemo, useReducer, useRef } from 'react';
import { CartCtx } from './CartContext.jsx';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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
      return action.items || [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], initial);
  const { user, userInfo } = useAuth();

  const isServerUpdate = useRef(false);

  // 1. LOGIKA PRIJAVE I ODJAVE
  useEffect(() => {
    // --- SLUČAJ A: KORISNIK SE PRIJAVIO ---
    if (user && items.length > 0) {
      const mergeLocalToCloud = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const snap = await getDoc(docRef);
          let serverCart = [];
          if (snap.exists() && snap.data().cart) {
            serverCart = snap.data().cart;
          }

          const finalCart = [...serverCart];
          let hasChanges = false;

          items.forEach((localItem) => {
            const existsOnServer = finalCart.some(
              (srvItem) => srvItem.id === localItem.id
            );
            if (!existsOnServer) {
              finalCart.push(localItem);
              hasChanges = true;
            }
          });

          if (
            hasChanges ||
            (serverCart.length === 0 && items.length > 0 && !hasChanges)
          ) {
            await setDoc(docRef, { cart: finalCart }, { merge: true });
          }
        } catch (err) {
          console.error('Merge cart error:', err);
        }
      };
      mergeLocalToCloud();
    }

    // --- SLUČAJ B: KORISNIK SE ODJAVIO (Logout) ---
    else if (!user) {
      // OVO JE ONO ŠTO SI TRAŽIO:
      // Čim user postane null, mi praznimo lokalnu korpu.
      // Ovo NE briše podatke iz baze (jer user više nije setovan, pa saveToDb neće okinuti).
      // Samo čisti ekran da sledeći gost ne vidi tuđe stvari.
      dispatch({ type: 'CLEAR' });

      // Opciono: Očisti i localStorage da bude skroz čisto za gosta
      localStorage.removeItem('cart');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 2. SINHRONIZACIJA SA SERVERA (Dok je ulogovan)
  useEffect(() => {
    if (user && userInfo && userInfo.cart) {
      const currentCartStr = JSON.stringify(items);
      const serverCartStr = JSON.stringify(userInfo.cart);

      if (currentCartStr !== serverCartStr) {
        isServerUpdate.current = true;
        dispatch({ type: 'REPLACE', items: userInfo.cart });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userInfo]);

  // 3. ČUVANJE PROMENA
  useEffect(() => {
    if (isServerUpdate.current) {
      isServerUpdate.current = false;
      return;
    }

    if (user) {
      // Čuvaj u bazu samo ako je user tu
      const saveToDb = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          await setDoc(docRef, { cart: items }, { merge: true });
        } catch (error) {
          console.error('Cart save error:', error);
        }
      };
      const t = setTimeout(saveToDb, 500);
      return () => clearTimeout(t);
    } else {
      // Ako je gost (ili se upravo izlogovao i korpa je prazna), ažuriraj localStorage
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
