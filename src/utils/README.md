# Utils - Utility Funkcije

Pomoćne funkcije i utility metode koje se koriste širom aplikacije.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Dostupne Utility Funkcije](#dostupne-utility-funkcije)
- [Currency Utils](#currency-utils)
- [Best Practices](#best-practices)

## 🎯 Pregled

Utils direktorijum sadrži pure funkcije koje:
- **Ne zavise od React-a** - Mogu se koristiti bilo gde
- **Nemaju side effects** - Isti input = isti output
- **Reusable** - Koriste se na više mesta
- **Testirajuće** - Lako se testiraju

## 📁 Dostupne Utility Funkcije

### currency.js

**Namena:** Formatiranje novčanih iznosa i valutnih operacija.

**Funkcije:**

#### formatCurrency(amount, includeSymbol = true)

Formatira iznos u srpski format sa separatorima hiljada.

**Parametri:**
- `amount` (number) - Iznos u dinarima
- `includeSymbol` (boolean) - Da li dodati "RSD" simbol (default: true)

**Vraća:**
- `string` - Formatiran iznos

**Primeri:**
```javascript
import { formatCurrency } from '../utils/currency';

formatCurrency(15000);           // "15.000 RSD"
formatCurrency(15000, false);    // "15.000"
formatCurrency(1500.50);         // "1.500,50 RSD"
formatCurrency(150000);          // "150.000 RSD"
formatCurrency(0);               // "0 RSD"
```

**Implementacija:**
```javascript
/**
 * Formatira iznos u srpski format
 * @param {number} amount - Iznos u dinarima
 * @param {boolean} includeSymbol - Dodaj "RSD" simbol
 * @returns {string} Formatiran iznos
 */
export function formatCurrency(amount, includeSymbol = true) {
  const formatted = amount.toLocaleString('sr-RS', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return includeSymbol ? `${formatted} RSD` : formatted;
}
```

---

#### calculateDiscount(originalPrice, discountPercent)

Izračunava popust i finalnu cenu.

**Parametri:**
- `originalPrice` (number) - Originalna cena
- `discountPercent` (number) - Procenat popusta (0.10 = 10%)

**Vraća:**
- `Object` - { discountAmount, finalPrice }

**Primeri:**
```javascript
import { calculateDiscount } from '../utils/currency';

const result = calculateDiscount(10000, 0.20);
// { discountAmount: 2000, finalPrice: 8000 }

const result2 = calculateDiscount(15000, 0.10);
// { discountAmount: 1500, finalPrice: 13500 }
```

**Implementacija:**
```javascript
/**
 * Izračunava popust i finalnu cenu
 * @param {number} originalPrice - Originalna cena
 * @param {number} discountPercent - Procenat (0.20 = 20%)
 * @returns {Object} { discountAmount, finalPrice }
 */
export function calculateDiscount(originalPrice, discountPercent) {
  const discountAmount = originalPrice * discountPercent;
  const finalPrice = originalPrice - discountAmount;
  
  return {
    discountAmount: Math.round(discountAmount),
    finalPrice: Math.round(finalPrice)
  };
}
```

---

#### formatPrice(price)

Skraćena verzija formatCurrency-ja (uvek sa simbolom).

**Parametri:**
- `price` (number) - Cena

**Vraća:**
- `string` - Formatirana cena

**Primeri:**
```javascript
import { formatPrice } from '../utils/currency';

formatPrice(15000);  // "15.000 RSD"
```

---

## 🔧 Dodatne Utility Funkcije

Možete dodati više utility fajlova po potrebi:

### date.js

```javascript
/**
 * Formatira datum u srpski format
 * @param {Date|string} date - Datum
 * @returns {string} Formatiran datum (DD.MM.YYYY)
 */
export function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Formatira datum i vreme
 * @param {Date|string} date - Datum
 * @returns {string} Formatiran datum i vreme (DD.MM.YYYY HH:MM)
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const dateStr = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Proverava da li je datum u prošlosti
 * @param {Date|string} date - Datum
 * @returns {boolean}
 */
export function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Računa razliku u danima
 * @param {Date} date1 - Prvi datum
 * @param {Date} date2 - Drugi datum
 * @returns {number} Broj dana razlike
 */
export function daysDiff(date1, date2) {
  const diff = Math.abs(date1 - date2);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
```

**Korišćenje:**
```javascript
import { formatDate, formatDateTime, isPast } from '../utils/date';

formatDate(new Date());              // "20.11.2025"
formatDateTime(new Date());          // "20.11.2025 14:30"
isPast('2024-01-01');                // true
daysDiff(new Date(), new Date('2025-12-31'));  // broj dana
```

---

### string.js

```javascript
/**
 * Capitalize prvo slovo
 * @param {string} str - String
 * @returns {string}
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string na određenu dužinu
 * @param {string} str - String
 * @param {number} maxLength - Max dužina
 * @param {string} suffix - Suffix (default: '...')
 * @returns {string}
 */
export function truncate(str, maxLength, suffix = '...') {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Slug za URL (bez specijalnih karaktera)
 * @param {string} str - String
 * @returns {string}
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pretvara string u latinicu
 * @param {string} str - String na ćirilici
 * @returns {string} String na latinici
 */
export function toLatinSerbian(str) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
    'ђ': 'đ', 'е': 'e', 'ж': 'ž', 'з': 'z', 'и': 'i',
    'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj', 'м': 'm',
    'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r',
    'с': 's', 'т': 't', 'ћ': 'ć', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'c', 'ч': 'č', 'џ': 'dž', 'ш': 'š'
  };
  
  return str.split('').map(char => map[char] || char).join('');
}
```

**Korišćenje:**
```javascript
import { capitalize, truncate, slugify } from '../utils/string';

capitalize('casio g-shock');              // "Casio g-shock"
truncate('Vrlo dugačak tekst...', 10);    // "Vrlo du..."
slugify('Casio G-Shock GA-2100');         // "casio-g-shock-ga-2100"
```

---

### array.js

```javascript
/**
 * Grupiše array po određenom key-u
 * @param {Array} array - Array objekata
 * @param {string} key - Key za grupiranje
 * @returns {Object}
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Sortira array po određenom key-u
 * @param {Array} array - Array objekata
 * @param {string} key - Key za sortiranje
 * @param {string} order - 'asc' ili 'desc'
 * @returns {Array}
 */
export function sortBy(array, key, order = 'asc') {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
}

/**
 * Uklanja duplikate iz array-a
 * @param {Array} array - Array
 * @param {string} key - Opcionalni key za objekte
 * @returns {Array}
 */
export function unique(array, key) {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Shuffle array (random order)
 * @param {Array} array - Array
 * @returns {Array}
 */
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

**Korišćenje:**
```javascript
import { groupBy, sortBy, unique, shuffle } from '../utils/array';

// Grupisanje proizvoda po brendu
const grouped = groupBy(products, 'brand');
// { Casio: [...], Seiko: [...] }

// Sortiranje po ceni
const sorted = sortBy(products, 'price', 'desc');

// Uklanjanje duplikata
const uniqueBrands = unique(products, 'brand');

// Shuffle proizvoda
const randomProducts = shuffle(products);
```

---

### validation.js

```javascript
/**
 * Validacija email adrese
 * @param {string} email - Email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validacija broja telefona (srpski format)
 * @param {string} phone - Telefon
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const regex = /^(\+381|0)[6-9][0-9]{7,8}$/;
  return regex.test(phone.replace(/[\s\-]/g, ''));
}

/**
 * Validacija jačine lozinke
 * @param {string} password - Lozinka
 * @returns {Object} { isValid, strength, message }
 */
export function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  let strength = 0;
  let message = '';
  
  if (password.length < minLength) {
    return {
      isValid: false,
      strength: 0,
      message: `Lozinka mora imati najmanje ${minLength} karaktera`
    };
  }
  
  if (hasUpper) strength++;
  if (hasLower) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  
  const strengthLabels = ['Slaba', 'Srednja', 'Jaka', 'Veoma jaka'];
  message = strengthLabels[strength - 1] || 'Slaba';
  
  return {
    isValid: strength >= 2,
    strength,
    message
  };
}
```

---

## 📐 Best Practices

### 1. Pure Functions

```javascript
// ✅ Dobro - Pure function
export function add(a, b) {
  return a + b;
}

// ❌ Loše - Side effect
let total = 0;
export function add(a, b) {
  total = a + b;  // Menja eksterni state
  return total;
}
```

### 2. JSDoc Komentari

```javascript
/**
 * Formatira cenu
 * 
 * @param {number} price - Cena u dinarima
 * @param {boolean} [includeSymbol=true] - Dodaj "RSD" simbol
 * @returns {string} Formatirana cena
 * 
 * @example
 * formatPrice(15000);        // "15.000 RSD"
 * formatPrice(15000, false); // "15.000"
 */
export function formatPrice(price, includeSymbol = true) {
  // ...
}
```

### 3. Error Handling

```javascript
/**
 * Parsira JSON string
 * @param {string} jsonString - JSON string
 * @returns {Object|null} Parsed object ili null ako greška
 */
export function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}
```

### 4. Default Parameters

```javascript
// ✅ Dobro - Sa default vrednostima
export function formatCurrency(amount, symbol = 'RSD', locale = 'sr-RS') {
  return `${amount.toLocaleString(locale)} ${symbol}`;
}

// ❌ Loše - Bez defaults
export function formatCurrency(amount, symbol, locale) {
  symbol = symbol || 'RSD';
  locale = locale || 'sr-RS';
  // ...
}
```

### 5. Immutability

```javascript
// ✅ Dobro - Ne menja original
export function sortArray(array) {
  return [...array].sort();
}

// ❌ Loše - Menja original
export function sortArray(array) {
  return array.sort();  // Mutira original array
}
```

## 🔗 Povezane Dokumentacije

- [Data](../data/README.md) - Validation rules
- [Models](../models/README.md) - Data modeli
- [Hooks](../hooks/README.md) - Custom hooks

## 💡 Dodavanje Nove Utility Funkcije

1. Kreiraj/otvori odgovarajući fajl (npr. `string.js`)
2. Napiši pure funkciju
3. Dodaj JSDoc komentare
4. Export funkciju
5. Testiraj sa različitim inputima
6. Ažuriraj ovu dokumentaciju

**Template:**
```javascript
/**
 * Kratak opis funkcije
 * 
 * @param {type} param - Opis parametra
 * @returns {type} Opis return vrednosti
 * 
 * @example
 * myFunction(input); // output
 */
export function myFunction(param) {
  // Logika...
  return result;
}
```

---

**Poslednje ažuriranje:** Novembar 2025
