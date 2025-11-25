// src/pages/Admin/utils/generators.js
// --- HELPER: CLEAN SLUG GENERATOR ---
/**
 * Generiše "čist" slug iz datog teksta.
 * Pretvara tekst u mala slova, zamenjuje specijalne karaktere i razmake.
 * @param {string} text - Ulazni tekst koji se konvertuje u slug.
 * @returns {string} - Generisani slug.
 * /
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/đ/g, 'dj')
    .replace(/ž/g, 'z')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};
