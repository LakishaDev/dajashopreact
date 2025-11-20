# Context - React Context Providers

React Context API provideri za globalno stanje aplikacije. Context omogućava deljenje podataka između komponenti bez potrebe za prop drilling.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Dostupni Contexti](#dostupni-contexti)
- [Authentication Context](#authentication-context)
- [Cart Context](#cart-context)
- [Theme Context](#theme-context)
- [Flash Context](#flash-context)
- [Undo Context](#undo-context)
- [Best Practices](#best-practices)

## 🎯 Pregled

Svaki Context se sastoji od:
1. **Context** fajl - Definiše Context objekat (`createContext()`)
2. **Provider** fajl - Komponenta koja wrappuje app i pruža vrednosti
3. **Hook** fajl - Custom hook za pristup Context-u (`src/hooks/`)

### Arhitektura

```
Context Definition (AuthContext.jsx)
         ↓
Provider Component (AuthProvider.jsx)
         ↓
Custom Hook (useAuth.js)
         ↓
Components koriste hook
```

## 📚 Dostupni Contexti

### 1. AuthContext + AuthProvider
**Fajlovi:**
- `AuthContext.jsx` - Context definition
- `AuthProvider.jsx` - Provider implementation

**Hook:** `useAuth()` (`src/hooks/useAuth.js`)

**Odgovornost:** 
- Korisničke informacije
- Login/Logout funkcionalnost
- OAuth autentifikacija
- Session management

---

### 2. CartContext
**Fajl:** `CartContext.jsx` (kombinavani Context i Provider)

**Hook:** `useCart()` (`src/hooks/useCart.js`)

**Odgovornost:**
- Shopping cart state
- Dodavanje/uklanjanje proizvoda
- Kalkulacija ukupne cene
- Persist u localStorage

---

### 3. ThemeContext + ThemeProvider
**Fajlovi:**
- `ThemeContext.jsx` - Context definition
- `ThemeProvider.jsx` - Provider implementation

**Hook:** `useTheme()` (`src/hooks/useTheme.js`)

**Odgovornost:**
- Dark/Light mode
- Theme switching
- Persist preference u localStorage

---

### 4. FlashContext
**Fajl:** `FlashContext.jsx`

**Hook:** `useFlash()` (`src/hooks/useFlash.js`)

**Odgovornost:**
- Toast/Flash messages
- Success/Error notifications
- Auto-dismiss messages

---

### 5. UndoContext + UndoProvider
**Fajlovi:**
- `UndoContext.jsx` - Context definition
- `UndoProvider.jsx` - Provider implementation

**Hook:** `useUndo()` (`src/hooks/useUndo.js`)

**Odgovornost:**
- Undo funkcionalnost
- Toast sa undo dugmetom
- Timer za auto-dismiss

---

## 🔐 Authentication Context

### Setup

**App.jsx:**
```jsx
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <AuthProvider>
      {/* Vaša aplikacija */}
    </AuthProvider>
  );
}
```

### Korišćenje

```jsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const {
    user,              // Trenutni korisnik ili null
    authOpen,          // Da li je auth modal otvoren
    mode,              // 'login' ili 'register'
    showAuth,          // Funkcija za otvaranje modala
    hideAuth,          // Funkcija za zatvaranje modala
    setMode,           // Postavi mode ('login' ili 'register')
    login,             // Email/Password login
    register,          // Email/Password registracija
    logout,            // Odjava
    oauth,             // OAuth login (Google, Facebook)
    sendPhoneCode,     // Pošalji SMS kod
    confirmPhoneCode,  // Potvrdi SMS kod
    pendingEmailVerify // Da li čeka email verifikaciju
  } = useAuth();
  
  // Primer: Prijava
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      alert('Uspešna prijava!');
    } catch (error) {
      alert('Greška: ' + error.message);
    }
  };
  
  // Primer: OAuth
  const handleGoogleLogin = async () => {
    await oauth('google');
  };
  
  return (
    <div>
      {user ? (
        <>
          <p>Ulogovani kao: {user.displayName}</p>
          <button onClick={logout}>Odjavi se</button>
        </>
      ) : (
        <button onClick={() => showAuth('login')}>Prijavi se</button>
      )}
    </div>
  );
}
```

### State Struktura

```javascript
{
  user: {
    uid: "firebase-uid",
    email: "user@example.com",
    displayName: "Ime Prezime",
    photoURL: "https://...",
    emailVerified: true
  } || null,
  
  authOpen: false,
  mode: 'login', // ili 'register'
  pendingEmailVerify: false
}
```

### Funkcije

**login(email, password)**
- Email/Password autentifikacija
- Vraća Promise
- Throws error ako neuspešno

**register(email, password, displayName)**
- Kreira novi nalog
- Šalje verification email
- Automatski login nakon registracije

**logout()**
- Odjavljuje korisnika
- Čisti session
- Redirect na home page

**oauth(provider)**
- `provider`: 'google' ili 'facebook'
- Otvara popup za OAuth
- Automatski kreira/login korisnika

**sendPhoneCode(phoneNumber)**
- Šalje SMS verification kod
- Vraća confirmation object

**confirmPhoneCode(verificationCode)**
- Potvrđuje SMS kod
- Završava phone autentifikaciju

---

## 🛒 Cart Context

### Setup

**App.jsx:**
```jsx
import { CartProvider } from './context/CartProvider';

function App() {
  return (
    <CartProvider>
      {/* Vaša aplikacija */}
    </CartProvider>
  );
}
```

### Korišćenje

```jsx
import { useCart } from './hooks/useCart';

function ProductCard({ product }) {
  const {
    cart,          // Array proizvoda u korpi
    count,         // Ukupan broj stavki
    total,         // Ukupna cena
    addItem,       // Dodaj proizvod
    removeItem,    // Ukloni proizvod
    updateQty,     // Ažuriraj količinu
    clearCart      // Isprazni korpu
  } = useCart();
  
  const handleAddToCart = () => {
    addItem(product, 1);
    alert('Proizvod dodat u korpu!');
  };
  
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price} RSD</p>
      <button onClick={handleAddToCart}>Dodaj u korpu</button>
    </div>
  );
}
```

### State Struktura

```javascript
{
  cart: [
    {
      id: "prod-123",
      name: "Casio G-Shock",
      price: 15000,
      qty: 2,
      imageUrl: "https://...",
      brand: "Casio"
    }
  ],
  count: 2,     // Ukupan broj proizvoda
  total: 30000  // Ukupna cena (price * qty)
}
```

### Funkcije

**addItem(product, quantity = 1)**
```jsx
// Dodaj novi proizvod
addItem(product, 1);

// Ako proizvod već postoji, uvećava količinu
addItem(existingProduct, 2);
```

**removeItem(productId)**
```jsx
// Ukloni proizvod
removeItem('prod-123');

// Pruža undo opciju kroz UndoContext
```

**updateQty(productId, newQuantity)**
```jsx
// Ažuriraj količinu
updateQty('prod-123', 5);

// Ako je newQuantity 0, uklanja proizvod
updateQty('prod-123', 0);
```

**clearCart()**
```jsx
// Isprazni celu korpu
clearCart();

// Koristi se nakon uspešne porudžbine
```

### LocalStorage Persistence

Cart se automatski čuva u localStorage:
- Key: `'dajashop_cart'`
- Automatski save na svaku promenu
- Automatski load pri inicijalizaciji

---

## 🎨 Theme Context

### Setup

**App.jsx:**
```jsx
import { ThemeProvider } from './context/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      {/* Vaša aplikacija */}
    </ThemeProvider>
  );
}
```

### Korišćenje

```jsx
import { useTheme } from './hooks/useTheme';

function ThemeToggle() {
  const {
    theme,        // 'light' ili 'dark'
    toggleTheme,  // Toggle funkcija
    isDark        // Boolean - Da li je dark mode
  } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}
```

### State Struktura

```javascript
{
  theme: 'light', // ili 'dark'
  isDark: false   // computed boolean
}
```

### CSS Variables

ThemeProvider automatski primenjuje CSS varijable:

**Light Mode:**
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* ... */
}
```

**Dark Mode:**
```css
:root {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  /* ... */
}
```

### LocalStorage Persistence

- Key: `'dajashop_theme'`
- Default: System preference (`prefers-color-scheme`)
- Automatski persist na promenu

---

## 💬 Flash Context

### Setup

**App.jsx:**
```jsx
import { FlashProvider } from './context/FlashProvider';

function App() {
  return (
    <FlashProvider>
      {/* Vaša aplikacija */}
      <FlashModal /> {/* Mora biti uključen! */}
    </FlashProvider>
  );
}
```

### Korišćenje

```jsx
import { useFlash } from './hooks/useFlash';

function MyComponent() {
  const { showFlash } = useFlash();
  
  const handleSuccess = () => {
    showFlash('Uspešno sačuvano!', 'success');
  };
  
  const handleError = () => {
    showFlash('Greška pri čuvanju!', 'error');
  };
  
  const handleInfo = () => {
    showFlash('Ovo je informacija.', 'info');
  };
  
  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
      <button onClick={handleInfo}>Info</button>
    </div>
  );
}
```

### Message Types

- `'success'` - ✅ Zelena boja, success ikona
- `'error'` - ❌ Crvena boja, error ikona
- `'info'` - ℹ️ Plava boja, info ikona
- `'warning'` - ⚠️ Narandžasta boja, warning ikona

### Auto-Dismiss

- Default timeout: 3 sekunde
- Klikni na poruku za manual dismiss
- Queue sistem za multiple poruke

---

## ↩️ Undo Context

### Setup

**App.jsx:**
```jsx
import { UndoProvider } from './context/UndoProvider';

function App() {
  return (
    <UndoProvider>
      {/* Vaša aplikacija */}
      <UndoToast /> {/* Mora biti uključen! */}
    </UndoProvider>
  );
}
```

### Korišćenje

```jsx
import { useUndo } from './hooks/useUndo';
import { useCart } from './hooks/useCart';

function CartItem({ item }) {
  const { removeItem, addItem } = useCart();
  const { addUndo } = useUndo();
  
  const handleRemove = () => {
    // Ukloni stavku
    removeItem(item.id);
    
    // Dodaj undo opciju
    addUndo({
      message: `${item.name} uklonjen iz korpe`,
      action: () => {
        // Restore funkcija
        addItem(item, item.qty);
      }
    });
  };
  
  return (
    <div>
      <h3>{item.name}</h3>
      <button onClick={handleRemove}>Ukloni</button>
    </div>
  );
}
```

### Undo Object

```javascript
{
  message: "Proizvod uklonjen",
  action: () => {
    // Funkcija koja vraća promenu
    restoreItem(item);
  }
}
```

### Timer

- Undo dostupan 5 sekundi
- Toast sa countdown timer
- Auto-dismiss nakon isteka

---

## 📐 Best Practices

### 1. Provider Hijerarhija

Redosled wrappovanja je bitan:

```jsx
function App() {
  return (
    <ThemeProvider>          {/* Prvo tema */}
      <AuthProvider>         {/* Zatim auth */}
        <CartProvider>       {/* Zatim cart */}
          <FlashProvider>    {/* Zatim flash */}
            <UndoProvider>   {/* Na kraju undo */}
              <Router>
                <Routes />
              </Router>
            </UndoProvider>
          </FlashProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

### 2. Error Handling

```jsx
export function useMyContext() {
  const context = useContext(MyContext);
  
  if (!context) {
    throw new Error(
      'useMyContext mora biti korišćen unutar MyProvider'
    );
  }
  
  return context;
}
```

### 3. Performance

**Memoizacija vrednosti:**

```jsx
export function MyProvider({ children }) {
  const [state, setState] = useState(initialState);
  
  // Memoizuj value da izbegneš nepotrebne re-renders
  const value = useMemo(() => ({
    state,
    setState,
    // ... ostale funkcije
  }), [state]);
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
```

### 4. Split Contexti

Ne stavljaj sve u jedan Context:

```jsx
// ❌ Loše - Jedan veliki Context
<AppContext.Provider value={{
  user, cart, theme, notifications, ...
}}>

// ✅ Dobro - Odvojeni Contexti po domenu
<AuthProvider>
  <CartProvider>
    <ThemeProvider>
      <NotificationProvider>
```

### 5. TypeScript (Future)

Kada se doda TypeScript:

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

## 🔗 Povezane Dokumentacije

- [Hooks](../hooks/README.md) - Custom hooks
- [Components](../components/README.md) - Komponente
- [Services](../services/README.md) - API servisi

## 💡 Kreiranje Novog Context-a

1. **Kreiraj Context fajl:**
```jsx
// MyContext.jsx
import { createContext } from 'react';
export const MyContext = createContext();
```

2. **Kreiraj Provider fajl:**
```jsx
// MyProvider.jsx
import { useState } from 'react';
import { MyContext } from './MyContext';

export function MyProvider({ children }) {
  const [state, setState] = useState(null);
  
  const value = {
    state,
    setState
  };
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}
```

3. **Kreiraj custom hook:**
```jsx
// useMyContext.js (u src/hooks/)
import { useContext } from 'react';
import { MyContext } from '../context/MyContext';

export function useMyContext() {
  const context = useContext(MyContext);
  
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  
  return context;
}
```

4. **Dodaj Provider u App:**
```jsx
<MyProvider>
  <App />
</MyProvider>
```

5. **Koristi u komponentama:**
```jsx
const { state, setState } = useMyContext();
```

---

**Poslednje ažuriranje:** Novembar 2025
