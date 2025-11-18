import { useState } from "react";
import { PROMO_CODES } from "../data/promoCodes";

export function usePromo() {
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const validateAndApply = (inputCode, cartTotal, cartItems) => {
    setError(null);
    setSuccessMsg(null);
    
    const normalizedCode = inputCode.trim().toUpperCase();
    const promo = PROMO_CODES.find((p) => p.code === normalizedCode);

    // 1. Da li kod postoji?
    if (!promo) {
      setError("Kod nije pronađen.");
      return;
    }

    // 2. Da li je istekao?
    const today = new Date();
    const expirationDate = new Date(promo.expiresAt);
    if (today > expirationDate) {
      setError("Ovaj kod je istekao.");
      return;
    }

    // 3. Da li je ispunjen minimalni iznos korpe?
    if (cartTotal < promo.minOrderValue) {
      setError(`Kod važi samo za porudžbine preko ${promo.minOrderValue} RSD.`);
      return;
    }

    // 4. Provera brenda i obračun popusta
    // Ako je validBrands prazan, popust ide na CEO iznos.
    // Ako ima brendova, popust se računa SAMO na artikle tih brendova.
    let discountAmount = 0;

    if (promo.validBrands && promo.validBrands.length > 0) {
      // Filtriramo artikle koji su na akciji
      const eligibleItems = cartItems.filter(item => 
        promo.validBrands.map(b => b.toUpperCase()).includes(item.brand.toUpperCase())
      );

      if (eligibleItems.length === 0) {
        setError(`Kod važi samo za brendove: ${promo.validBrands.join(", ")}.`);
        return;
      }

      // Sabiramo cenu samo tih artikala
      const eligibleTotal = eligibleItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
      discountAmount = eligibleTotal * promo.discountPercent;
    
    } else {
      // Globalni popust na sve
      discountAmount = cartTotal * promo.discountPercent;
    }

    // Uspeh!
    setAppliedPromo({
      code: promo.code,
      percent: promo.discountPercent,
      amount: discountAmount,
      isBrandSpecific: promo.validBrands.length > 0
    });
    setSuccessMsg(`Uspešno! ${promo.validBrands.length > 0 ? 'Popust na brend' : 'Popust'} primenjen.`);
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
    successMsg
  };
}