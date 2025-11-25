// src/pages/Admin/utils/sanitizers.js
// --- 1. SANITIZE FUNKCIJA (Čišćenje podataka pre upisa) ---
/**
 * Čisti objekat pre upisa u bazu podataka. Briše undefined polja i prazan ID.
 * @param {Object} item - Objekat koji se čisti.
 * @returns {Object} - Očišćen objekat spreman za upis.
 */
export const sanitizeItem = (item) => {
  const clean = { ...item };
  // Brišemo undefined polja jer ih Firestore ne voli
  Object.keys(clean).forEach((key) => {
    if (clean[key] === undefined) delete clean[key];
  });
  // Ako je ID prazan string, brišemo ga da bi Firebase generisao novi ID
  if (!clean.id || clean.id === '') delete clean.id;
  return clean;
};
