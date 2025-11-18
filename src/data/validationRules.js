export const FORM_RULES = {
  email: {
    // Standardni email regex
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Unesite validnu email adresu (npr. ime@primer.com)."
  },
  phone: {
    // Srpski mobilni/fiksni: podržava 06x, +3816x, itd.
    regex: /^(\+381|0)6[0-9]{7,8}$/,
    message: "Unesite validan broj (npr. 0641234567)."
  },
  postalCode: {
    // Tačno 5 cifara za Srbiju
    regex: /^\d{5}$/,
    message: "Poštanski broj mora imati tačno 5 cifara."
  },
  name: {
    // Bar 2 slova
    regex: /^[a-zA-Z\u00C0-\u024F\s]{2,}$/,
    message: "Ime mora imati bar 2 slova."
  },
  address: {
    // Bar 5 karaktera
    regex: /^.{5,}$/,
    message: "Unesite punu adresu (Ulica i broj)."
  }
};