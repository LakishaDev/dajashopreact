# Data - Statički Podaci i Konfiguracija

Direktorijum sa statičkim podacima, konstantama i mock podacima za razvoj.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Fajlovi](#fajlovi)
- [Mock Podaci](#mock-podaci)
- [Korišćenje](#korišćenje)

## 🎯 Pregled

Ovaj direktorijum sadrži:
- **Validation rules** - Regex i pravila za validaciju formi
- **Promo kodovi** - Definicije promo kodova i popusta
- **Mock podaci** - Test podaci za razvoj (proizvodi)

## 📁 Fajlovi

### validationRules.js

**Namena:** Definicija validation rules za forme (registracija, checkout, itd).

**Struktura:**
```javascript
export const FORM_RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Unesite validnu email adresu'
  },
  phone: {
    regex: /^[0-9+\-\s()]+$/,
    message: 'Unesite validan broj telefona'
  },
  // ... ostala pravila
};
```

**Korišćenje:**
```jsx
import { FORM_RULES } from '../data/validationRules';
import { useFormValidator } from '../hooks/useFormValidator';

function MyForm() {
  const { formData, errors, handleChange, handleBlur, validateAll } = 
    useFormValidator({ email: '', phone: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      // Submit forme
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
}
```

**Dostupna Pravila:**
- `email` - Email format validation
- `phone` - Phone number format
- `name` - Ime i prezime (slova i razmaci)
- `address` - Adresa
- `city` - Grad
- `zipCode` - Poštanski broj

**Dodavanje Novog Pravila:**
```javascript
export const FORM_RULES = {
  // ... postojeća pravila
  username: {
    regex: /^[a-zA-Z0-9_]{3,16}$/,
    message: 'Username mora biti 3-16 karaktera (slova, brojevi, _)'
  }
};
```

---

### promoCodes.js

**Namena:** Definicija promo kodova za popuste.

**Struktura:**
```javascript
export const PROMO_CODES = [
  {
    code: "WELCOME10",
    discountPercent: 0.10,        // 10% popust
    minOrderValue: 10000,         // Min. 10,000 RSD
    validBrands: [],              // Važi za sve brendove
    expiresAt: "2025-12-31"       // Datum isteka
  },
  {
    code: "CASIO20",
    discountPercent: 0.20,        // 20% popust
    minOrderValue: 15000,
    validBrands: ["Casio"],       // Samo za Casio
    expiresAt: "2025-06-30"
  }
];
```

**Properties:**

- **code** (string) - Promo kod (UPPERCASE)
- **discountPercent** (number) - Procenat popusta (0.10 = 10%)
- **minOrderValue** (number) - Minimalna vrednost porudžbine
- **validBrands** (array) - Brendovi za koje važi (prazan = svi)
- **expiresAt** (string) - Datum isteka (ISO format)

**Korišćenje:**
```jsx
import { usePromo } from '../hooks/usePromo';

function CheckoutPage() {
  const { cart, total } = useCart();
  const { appliedPromo, validateAndApply, removePromo, error } = usePromo();
  
  const [promoInput, setPromoInput] = useState('');
  
  const handleApply = () => {
    validateAndApply(promoInput, total, cart);
  };
  
  const finalTotal = appliedPromo 
    ? total - appliedPromo.amount 
    : total;
  
  return (
    <div>
      <input 
        value={promoInput}
        onChange={(e) => setPromoInput(e.target.value)}
        placeholder="Promo kod"
      />
      <button onClick={handleApply}>Primeni</button>
      
      {error && <p className="error">{error}</p>}
      {appliedPromo && (
        <p>Popust: -{appliedPromo.amount} RSD</p>
      )}
      
      <p>Ukupno: {finalTotal} RSD</p>
    </div>
  );
}
```

**Validacija:**

Hook `usePromo` automatski validira:
1. ✅ Da li kod postoji
2. ✅ Da li je istekao
3. ✅ Da li je ispunjen minimum
4. ✅ Da li važi za brendove u korpi

**Dodavanje Novog Promo Koda:**
```javascript
export const PROMO_CODES = [
  // ... postojeći kodovi
  {
    code: "SUMMER25",
    discountPercent: 0.25,
    minOrderValue: 20000,
    validBrands: ["Seiko", "Citizen"],
    expiresAt: "2025-09-30"
  }
];
```

---

## 📦 Mock Podaci

### mock/products.js

**Namena:** Test proizvodi za razvoj bez Firebase-a.

**Struktura:**
```javascript
export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Casio G-Shock GA-2100",
    brand: "Casio",
    category: "sport",
    price: 15000,
    description: "Izdržljiv sportski sat sa carbon core guard strukturom.",
    imageUrl: "/products/casio-gshock.jpg",
    inStock: true,
    features: [
      "Vodoottpornost 200m",
      "Shock resistant",
      "LED osvetljenje"
    ],
    createdAt: "2024-01-15T10:00:00Z"
  },
  // ... više proizvoda
];
```

**Korišćenje u Razvoju:**

```jsx
import { MOCK_PRODUCTS } from '../data/mock/products';

function CatalogPage() {
  // U development mode-u
  const products = import.meta.env.DEV 
    ? MOCK_PRODUCTS 
    : useProducts(); // Real data
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Product Properties:**

- `id` (string) - Jedinstveni ID
- `name` (string) - Naziv proizvoda
- `brand` (string) - Brend (Casio, Seiko, Citizen, itd.)
- `category` (string) - Kategorija (sport, luksuzni, casual, smart)
- `price` (number) - Cena u dinarima
- `description` (string) - Opis proizvoda
- `imageUrl` (string) - URL slike
- `inStock` (boolean) - Dostupnost
- `features` (array) - Lista karakteristika
- `createdAt` (string) - Datum kreiranja (ISO format)

**Dodavanje Mock Proizvoda:**
```javascript
export const MOCK_PRODUCTS = [
  // ... postojeći proizvodi
  {
    id: "10",
    name: "Seiko Presage Cocktail Time",
    brand: "Seiko",
    category: "luksuzni",
    price: 45000,
    description: "Elegantan automatski sat inspirisan koktelima.",
    imageUrl: "/products/seiko-presage.jpg",
    inStock: true,
    features: [
      "Automatski mehanizam",
      "Safirno staklo",
      "Vodootpornost 50m"
    ],
    createdAt: new Date().toISOString()
  }
];
```

---

## 🎯 Best Practices

### 1. Konstante

Koristi UPPER_SNAKE_CASE za konstante:

```javascript
// ✅ Dobro
export const MAX_DISCOUNT = 0.50;
export const MIN_ORDER_VALUE = 5000;

// ❌ Loše
export const maxDiscount = 0.50;
export const minOrderValue = 5000;
```

### 2. Validacija

Definiši jasne error poruke:

```javascript
// ✅ Dobro
{
  message: 'Email mora biti u formatu: primer@domen.com'
}

// ❌ Loše
{
  message: 'Invalid email'
}
```

### 3. Datumi

Koristi ISO 8601 format za datume:

```javascript
// ✅ Dobro
expiresAt: "2025-12-31T23:59:59Z"

// ❌ Loše
expiresAt: "31/12/2025"
```

### 4. Mock vs Real Data

Odvoji mock od real podataka:

```javascript
// ✅ Dobro - Jasna razlika
const products = isDevelopment ? MOCK_PRODUCTS : realProducts;

// ❌ Loše - Mešanje mock i real podataka
const products = [...MOCK_PRODUCTS, ...realProducts];
```

## 🔗 Povezane Dokumentacije

- [Hooks](../hooks/README.md) - useFormValidator, usePromo
- [Services](../services/README.md) - API servisi
- [Models](../models/README.md) - Data modeli

## 💡 Dodavanje Novih Podataka

### Novi Validation Rule

1. Otvori `validationRules.js`
2. Dodaj novo pravilo u `FORM_RULES`
3. Testiraj regex sa različitim inputima
4. Dokumentuj u ovom fajlu

### Novi Promo Kod

1. Otvori `promoCodes.js`
2. Dodaj novi objekat u `PROMO_CODES` array
3. Proveri datum isteka
4. Testiraj sa `usePromo` hook-om

### Novi Mock Proizvod

1. Otvori `mock/products.js`
2. Dodaj novi objekat u `MOCK_PRODUCTS` array
3. Osiguraj da ima sve properties
4. Dodaj sliku u `/public/products/`

---

**Poslednje ažuriranje:** Novembar 2025
