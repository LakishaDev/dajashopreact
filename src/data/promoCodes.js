export const PROMO_CODES = [
  {
    code: "DAJA20",
    discountPercent: 0.20, // 20%
    minOrderValue: 0,      // Nema limita
    validBrands: [],       // Prazno = važi za sve
    expiresAt: "2025-12-31", // Format: GGGG-MM-DD
  },
  {
    code: "CASIO10",
    discountPercent: 0.10,
    minOrderValue: 5000,   // Moraš da potrošiš bar 5000
    validBrands: ["CASIO", "G-SHOCK", "EDIFICE"], // Važi samo za Casio grupu
    expiresAt: "2024-06-01",
  },
  {
    code: "VIP5000",
    discountPercent: 0.15,
    minOrderValue: 15000,  // Za velike porudžbine
    validBrands: [],
    expiresAt: "2025-12-01",
  }
];