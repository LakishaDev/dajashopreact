export const PROMO_CODES = [
  {
    code: 'DAJA20',
    discountPercent: 0.2,
    minOrderValue: 0,
    validBrands: [],
    expiresAt: '2025-12-31',
  },
  {
    code: 'CASIO10',
    discountPercent: 0.1,
    minOrderValue: 5000,
    validBrands: ['CASIO', 'G-SHOCK', 'EDIFICE'],
    expiresAt: '2024-06-01',
  },
  {
    code: 'VIP5000',
    discountPercent: 0.15,
    minOrderValue: 15000,
    validBrands: [],
    expiresAt: '2025-12-01',
  },
  // NOVI KOD ZA NEWSLETTER
  {
    code: 'DOBRODOSLI10',
    discountPercent: 0.1,
    minOrderValue: 0,
    validBrands: [],
    expiresAt: '2030-01-01',
    // NOVO: Definišemo pravila validacije
    autoApply: true,
    rules: {
      requiresLogin: true, // Mora biti ulogovan
      requiresNewsletter: true, // Mora biti u newsletter bazi
      firstOrderOnly: true, // Ne sme imati prethodne porudžbine
    },
  },
];
