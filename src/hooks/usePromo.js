import { useState } from 'react';
import { PROMO_CODES } from '../data/promoCodes';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../services/firebase'; // Pretpostavljam da je ovde tvoja inicijalizacija

export function usePromo() {
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [loading, setLoading] = useState(false); // Novo: Loading stanje dok proveravamo bazu
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sada primamo i 'user' objekat (iz AuthContext-a) jer nam treba za proveru
  const validateAndApply = async (inputCode, cartTotal, cartItems, user) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const normalizedCode = inputCode.trim().toUpperCase();
      const promo = PROMO_CODES.find((p) => p.code === normalizedCode);

      // 1. Osnovne provere (staticne)
      if (!promo) {
        throw new Error('Kod nije pronađen.');
      }

      const today = new Date();
      if (today > new Date(promo.expiresAt)) {
        throw new Error('Ovaj kod je istekao.');
      }

      if (cartTotal < promo.minOrderValue) {
        throw new Error(
          `Kod važi samo za porudžbine preko ${promo.minOrderValue} RSD.`
        );
      }

      // 2. NAPREDNE PROVERE (Baza podataka)
      if (promo.rules) {
        // 2a. Provera prijave (Login)
        if (promo.rules.requiresLogin && !user) {
          throw new Error('Morate biti ulogovani da biste koristili ovaj kod.');
        }

        // 2b. Provera prve kupovine (First Order)
        if (promo.rules.firstOrderOnly && user) {
          // Tražimo porudžbine ovog korisnika
          const ordersRef = collection(db, 'orders');
          // Pretpostavka: tvoje porudžbine imaju polje 'userId' ili 'customerEmail'
          // Prilagodi upit tvojoj strukturi baze!
          const q = query(ordersRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            throw new Error('Ovaj kod važi samo za Vašu prvu kupovinu.');
          }
        }

        // 2c. Provera newsletter pretplate
        if (promo.rules.requiresNewsletter && user) {
          // Proveravamo da li email postoji u 'newsletter' kolekciji
          const newsRef = doc(db, 'newsletter', user.email);
          const newsSnap = await getDoc(newsRef);

          if (!newsSnap.exists()) {
            throw new Error(
              'Ovaj kod je ekskluzivan za članove newsletter-a. Prijavite se prvo.'
            );
          }
        }
      }

      // 3. Obračun popusta (ako su sve provere prošle)
      let discountAmount = 0;

      if (promo.validBrands && promo.validBrands.length > 0) {
        const eligibleItems = cartItems.filter((item) =>
          promo.validBrands
            .map((b) => b.toUpperCase())
            .includes(item.brand.toUpperCase())
        );

        if (eligibleItems.length === 0) {
          throw new Error(
            `Kod važi samo za brendove: ${promo.validBrands.join(', ')}.`
          );
        }

        const eligibleTotal = eligibleItems.reduce(
          (acc, item) => acc + item.price * item.qty,
          0
        );
        discountAmount = eligibleTotal * promo.discountPercent;
      } else {
        discountAmount = cartTotal * promo.discountPercent;
      }

      // Uspeh!
      setAppliedPromo({
        code: promo.code,
        percent: promo.discountPercent,
        amount: discountAmount,
        isBrandSpecific: promo.validBrands.length > 0,
      });
      setSuccessMsg(
        `Uspešno! ${
          promo.validBrands.length > 0 ? 'Popust na brend' : 'Popust'
        } primenjen.`
      );
    } catch (err) {
      setError(err.message);
      setAppliedPromo(null);
    } finally {
      setLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setError(null);
    setSuccessMsg(null);
  };

  return {
    appliedPromo,
    validateAndApply,
    removePromo,
    error,
    successMsg,
    loading, // Vraćamo i loading status da bi UI znao da vrti spiner
  };
}
