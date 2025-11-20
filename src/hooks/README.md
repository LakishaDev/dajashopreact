# Hooks - Custom React Hooks

Custom React hooks za ponovno korišćenje logike i state management-a u DajaShop aplikaciji.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Authentication Hooks](#authentication-hooks)
- [Cart Hooks](#cart-hooks)
- [Form Hooks](#form-hooks)
- [Product Hooks](#product-hooks)
- [UI Hooks](#ui-hooks)
- [Best Practices](#best-practices)

## 🎯 Pregled

Hooks omogućavaju ponovno korišćenje logike između komponenti bez potrebe za wrapping komponentama. Svi custom hooks u ovom projektu prate React Hook konvencije:

- **Imenovanje:** Svi hooks počinju sa `use` prefiksom
- **Funkcionalnost:** Izvlače logiku iz komponenti
- **Zavisnosti:** Koriste React built-in hooks (useState, useEffect, useContext)

## 🔐 Authentication Hooks

### useAuth.js

**Namena:** Pristup autentifikacionom context-u i korisničkim podacima.

**Karakteristike:**
- Pristup trenutnom korisniku
- Login/Logout funkcije
- OAuth metodi (Google, Facebook)
- Email/Password autentifikacija
- Phone SMS verifikacija
- Auth state management

**Korišćenje:**
```jsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { 
    user,              // Trenutni korisnik (null ako nije ulogovan)
    authOpen,          // Da li je auth modal otvoren
    mode,              // 'login' ili 'register'
    login,             // Funkcija za prijavu
    register,          // Funkcija za registraciju
    logout,            // Funkcija za odjavu
    oauth,             // OAuth funkcija (Google, Facebook)
    hideAuth,          // Zatvori auth modal
    showAuth,          // Otvori auth modal
    setMode            // Postavi mode (login/register)
  } = useAuth();
  
  // Provera da li je korisnik ulogovan
  if (!user) {
    return <p>Molimo prijavite se</p>;
  }
  
  return (
    <div>
      <h1>Dobrodošli, {user.displayName}!</h1>
      <button onClick={logout}>Odjavi se</button>
    </div>
  );
}
```

**User Object:**
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  displayName: "Ime Prezime",
  photoURL: "https://...",
  emailVerified: true
}
```

**Funkcije:**

**login(email, password)**
```jsx
const handleLogin = async () => {
  try {
    await login('user@example.com', 'password123');
    console.log('Uspešna prijava!');
  } catch (error) {
    console.error('Greška:', error.message);
  }
};
```

**register(email, password, displayName)**
```jsx
const handleRegister = async () => {
  try {
    await register('user@example.com', 'password123', 'Ime Prezime');
    console.log('Uspešna registracija!');
  } catch (error) {
    console.error('Greška:', error.message);
  }
};
```

**oauth(provider)**
```jsx
// Google OAuth
const handleGoogleLogin = async () => {
  await oauth('google');
};

// Facebook OAuth
const handleFacebookLogin = async () => {
  await oauth('facebook');
};
```

**Related:**
- `src/context/AuthContext.jsx`
- `src/services/firebase.js`

---

## 🛒 Cart Hooks

### useCart.js

**Namena:** Upravljanje shopping cart funkcionalošću.

**Karakteristike:**
- Dodavanje proizvoda u korpu
- Uklanjanje proizvoda
- Ažuriranje količina
- Kalkulacija ukupne cene
- Persist u localStorage
- Undo funkcionalnost

**Korišćenje:**
```jsx
import { useCart } from '../hooks/useCart';

function ProductPage() {
  const {
    cart,           // Array proizvoda u korpi
    count,          // Ukupan broj stavki
    total,          // Ukupna cena
    addItem,        // Dodaj proizvod
    removeItem,     // Ukloni proizvod
    updateQty,      // Ažuriraj količinu
    clearCart       // Isprazni korpu
  } = useCart();
  
  const handleAddToCart = (product) => {
    addItem(product, 1); // Dodaj 1 komad
  };
  
  return (
    <div>
      <p>Korpa: {count} stavki - {total} RSD</p>
      <button onClick={() => handleAddToCart(product)}>
        Dodaj u korpu
      </button>
    </div>
  );
}
```

**Cart Item Structure:**
```javascript
{
  id: "product-id",
  name: "Casio G-Shock",
  price: 15000,
  qty: 2,
  imageUrl: "https://...",
  brand: "Casio"
}
```

**Funkcije:**

**addItem(product, quantity = 1)**
```jsx
// Dodaj proizvod sa količinom
addItem(product, 2);

// Ako proizvod već postoji, uvećava količinu
```

**removeItem(productId)**
```jsx
// Ukloni proizvod iz korpe
removeItem('product-123');

// Undo opcija dostupna 5 sekundi
```

**updateQty(productId, newQty)**
```jsx
// Ažuriraj količinu
updateQty('product-123', 5);

// Ako je newQty 0, proizvod se uklanja
```

**clearCart()**
```jsx
// Isprazni celu korpu
clearCart();
```

**Related:**
- `src/context/CartContext.jsx`
- `src/models/CartItem.js`

---

## 📝 Form Hooks

### useFormValidator.js

**Namena:** Validacija formi u realnom vremenu.

**Karakteristike:**
- Real-time validacija
- Custom validation rules
- Error messages
- onChange i onBlur handling
- ValidateAll funkcija

**Korišćenje:**
```jsx
import { useFormValidator } from '../hooks/useFormValidator';

function CheckoutForm() {
  const {
    formData,      // Podaci forme
    errors,        // Validation errors
    handleChange,  // onChange handler
    handleBlur,    // onBlur handler
    validateAll    // Validate sve before submit
  } = useFormValidator({
    email: '',
    phone: '',
    address: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateAll()) {
      // Forma je validna
      console.log('Slanje:', formData);
    } else {
      // Ima grešaka
      console.log('Greške:', errors);
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
      {errors.email && <span className="error">{errors.email}</span>}
      
      {/* Ostala polja... */}
      
      <button type="submit">Potvrdi</button>
    </form>
  );
}
```

**Validation Rules:**

Definisane u `src/data/validationRules.js`:

```javascript
{
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Unesite validnu email adresu'
  },
  phone: {
    regex: /^[0-9+\-\s()]+$/,
    message: 'Unesite validan broj telefona'
  },
  // ... druge validacije
}
```

**Related:**
- `src/data/validationRules.js`

---

### usePromo.js

**Namena:** Validacija i primena promo kodova.

**Karakteristike:**
- Validacija promo koda
- Provera isteka
- Minimum order value provera
- Brand-specific popusti
- Percentage i fixed popusti

**Korišćenje:**
```jsx
import { usePromo } from '../hooks/usePromo';

function Cart() {
  const { cart, total } = useCart();
  const {
    appliedPromo,      // Primenjeni promo (null ako nema)
    validateAndApply,  // Validacija i primena
    removePromo,       // Ukloni promo
    error,             // Error poruka
    successMsg         // Success poruka
  } = usePromo();
  
  const [promoInput, setPromoInput] = useState('');
  
  const handleApplyPromo = () => {
    validateAndApply(promoInput, total, cart);
  };
  
  const finalTotal = appliedPromo 
    ? total - appliedPromo.amount 
    : total;
  
  return (
    <div>
      <p>Iznos: {total} RSD</p>
      
      <input 
        value={promoInput}
        onChange={(e) => setPromoInput(e.target.value)}
        placeholder="Promo kod"
      />
      <button onClick={handleApplyPromo}>Primeni</button>
      
      {error && <p className="error">{error}</p>}
      {successMsg && <p className="success">{successMsg}</p>}
      
      {appliedPromo && (
        <div>
          <p>Popust: -{appliedPromo.amount} RSD</p>
          <button onClick={removePromo}>Ukloni</button>
        </div>
      )}
      
      <p>Ukupno: {finalTotal} RSD</p>
    </div>
  );
}
```

**Applied Promo Object:**
```javascript
{
  code: "WELCOME10",
  percent: 0.10,        // 10%
  amount: 1500,         // Popust u dinarima
  isBrandSpecific: false
}
```

**Related:**
- `src/data/promoCodes.js`

---

## 📦 Product Hooks

### useProduct.js

**Namena:** Učitavanje pojedinačnog proizvoda.

**Karakteristike:**
- Fetch proizvoda po ID-u
- Loading state
- Error handling
- Firebase Firestore integracija

**Korišćenje:**
```jsx
import { useProduct } from '../hooks/useProduct';

function ProductPage({ productId }) {
  const { product, loading, error } = useProduct(productId);
  
  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p>Greška: {error}</p>;
  if (!product) return <p>Proizvod nije pronađen</p>;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price} RSD</p>
    </div>
  );
}
```

---

### useProducts.js

**Namena:** Učitavanje liste proizvoda sa filterima.

**Karakteristike:**
- Fetch svih proizvoda
- Filtriranje (kategorija, brend, cena)
- Sortiranje
- Paginacija
- Search funkcionalnost

**Korišćenje:**
```jsx
import { useProducts } from '../hooks/useProducts';

function CatalogPage() {
  const {
    products,    // Array proizvoda
    loading,     // Loading state
    error,       // Error state
    filters,     // Trenutni filteri
    setFilters,  // Update filtera
    total        // Ukupan broj proizvoda
  } = useProducts({
    category: 'sport',
    minPrice: 0,
    maxPrice: 50000,
    brand: ['Casio', 'Seiko']
  });
  
  if (loading) return <p>Učitavanje...</p>;
  
  return (
    <div>
      <h1>Proizvodi ({total})</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Filter Object:**
```javascript
{
  category: 'sport',      // Kategorija
  brand: ['Casio'],       // Array brendova
  minPrice: 0,            // Min cena
  maxPrice: 100000,       // Max cena
  inStock: true,          // Samo na lageru
  sortBy: 'price',        // Sortiranje
  order: 'asc',           // Redosled
  search: 'casio'         // Search query
}
```

**Related:**
- `src/services/CatalogService.js`
- `src/services/products.js`

---

## 🎨 UI Hooks

### useTheme.js

**Namena:** Upravljanje dark/light mode temom.

**Karakteristike:**
- Toggle tema
- Persist u localStorage
- Smooth transition između tema
- System preference detection

**Korišćenje:**
```jsx
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

**Related:**
- `src/context/ThemeContext.jsx`
- `src/config/themes.js`

---

### useFlash.js

**Namena:** Prikaz flash messages (toasts).

**Karakteristike:**
- Success/Error/Info messages
- Auto-dismiss
- Queue sistem za multiple poruke

**Korišćenje:**
```jsx
import { useFlash } from '../hooks/useFlash';

function MyComponent() {
  const { showFlash } = useFlash();
  
  const handleSuccess = () => {
    showFlash('Proizvod uspešno dodat!', 'success');
  };
  
  const handleError = () => {
    showFlash('Greška pri dodavanju!', 'error');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Uspeh</button>
      <button onClick={handleError}>Greška</button>
    </div>
  );
}
```

**Types:**
- `'success'` - Zelena, success ikona
- `'error'` - Crvena, error ikona
- `'info'` - Plava, info ikona
- `'warning'` - Narandžasta, warning ikona

**Related:**
- `src/context/FlashContext.jsx`
- `src/components/modals/FlashModal.jsx`

---

### useUndo.js

**Namena:** Undo funkcionalnost za obrisane stavke.

**Karakteristike:**
- 5 sekundi timer za undo
- Toast sa undo dugmetom
- Automatic cleanup

**Korišćenje:**
```jsx
import { useUndo } from '../hooks/useUndo';
import { useCart } from '../hooks/useCart';

function CartItem({ item }) {
  const { removeItem, addItem } = useCart();
  const { addUndo } = useUndo();
  
  const handleDelete = () => {
    // Ukloni stavku
    removeItem(item.id);
    
    // Dodaj undo opciju
    addUndo({
      message: `${item.name} uklonjen`,
      action: () => addItem(item, item.qty)
    });
  };
  
  return (
    <div>
      <h3>{item.name}</h3>
      <button onClick={handleDelete}>Ukloni</button>
    </div>
  );
}
```

**Related:**
- `src/context/UndoContext.jsx`
- `src/components/modals/UndoToast.jsx`

---

## 📐 Best Practices

### 1. Imenovanje

```jsx
// ✅ Dobro - Počinje sa 'use'
useAuth.js
useCart.js
useFormValidator.js

// ❌ Loše
auth.js
cartHook.js
formValidator.js
```

### 2. Return Values

```jsx
// ✅ Dobro - Vraća objekat sa imenovanim vrednostima
export function useAuth() {
  return {
    user,
    login,
    logout
  };
}

// ✅ Takođe dobro - Vraća array za destrukturiranje
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue(!value);
  return [value, toggle];
}
```

### 3. Error Handling

```jsx
export function useData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { data, error, loading };
}
```

### 4. Dependencies

```jsx
// ✅ Dobro - Pravilne dependencies
useEffect(() => {
  fetchProducts(category);
}, [category]);

// ❌ Loše - Nedostajuće dependencies
useEffect(() => {
  fetchProducts(category);
}, []); // Warning: category nije u dependencies
```

### 5. Cleanup

```jsx
export function useInterval(callback, delay) {
  useEffect(() => {
    const id = setInterval(callback, delay);
    
    // Cleanup funkcija
    return () => clearInterval(id);
  }, [callback, delay]);
}
```

## 🧪 Testiranje Hooks

Za testiranje custom hooks, koristite `@testing-library/react-hooks`:

```jsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useCart } from './useCart';

test('dodavanje u korpu', () => {
  const { result } = renderHook(() => useCart());
  
  act(() => {
    result.current.addItem(product, 1);
  });
  
  expect(result.current.count).toBe(1);
});
```

## 🔗 Povezane Dokumentacije

- [Context](../context/README.md) - Context provideri
- [Components](../components/README.md) - Komponente
- [Services](../services/README.md) - API servisi

## 💡 Kreiranje Novog Hook-a

1. Kreiraj fajl `useMyHook.js`
2. Implementiraj logiku koristeći React hooks
3. Export funkciju koja počinje sa `use`
4. Dodaj JSDoc komentare
5. Testiraj hook
6. Ažuriraj ovu dokumentaciju

**Template:**

```jsx
/**
 * Custom hook za [opis funkcionalnosti]
 * 
 * @param {*} param - Opis parametra
 * @returns {Object} - Opis return vrednosti
 * 
 * @example
 * const { value, setValue } = useMyHook(initialValue);
 */
export function useMyHook(param) {
  const [state, setState] = useState(null);
  
  // Logika...
  
  return {
    state,
    setState
  };
}
```

---

**Poslednje ažuriranje:** Novembar 2025
