# Config - Konfiguracioni Fajlovi

Centralizovane konfiguracione konstante i podešavanja aplikacije.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Fajlovi](#fajlovi)
- [Best Practices](#best-practices)

## 🎯 Pregled

Config direktorijum sadrži konfiguracione fajlove koji definišu konstante, postavke i konfiguracione objekte koji se koriste širom aplikacije.

## 📁 Fajlovi

### themes.js

**Namena:** Definicija tema (light/dark mode) sa CSS varijablama.

**Struktura:**
```javascript
export const themes = {
  light: {
    // Pozadinske boje
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    '--bg-tertiary': '#e0e0e0',
    
    // Tekstualne boje
    '--text-primary': '#000000',
    '--text-secondary': '#666666',
    '--text-tertiary': '#999999',
    
    // Akcent boje
    '--color-primary': '#007bff',
    '--color-secondary': '#6c757d',
    '--color-success': '#28a745',
    '--color-danger': '#dc3545',
    '--color-warning': '#ffc107',
    '--color-info': '#17a2b8',
    
    // Dodatne boje
    '--border-color': '#dee2e6',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)',
    '--hover-bg': '#f8f9fa'
  },
  
  dark: {
    // Pozadinske boje
    '--bg-primary': '#1a1a1a',
    '--bg-secondary': '#2d2d2d',
    '--bg-tertiary': '#3a3a3a',
    
    // Tekstualne boje
    '--text-primary': '#ffffff',
    '--text-secondary': '#cccccc',
    '--text-tertiary': '#999999',
    
    // Akcent boje (iste kao light, ali prilagođene)
    '--color-primary': '#0d6efd',
    '--color-secondary': '#6c757d',
    '--color-success': '#198754',
    '--color-danger': '#dc3545',
    '--color-warning': '#ffc107',
    '--color-info': '#0dcaf0',
    
    // Dodatne boje
    '--border-color': '#404040',
    '--shadow-color': 'rgba(255, 255, 255, 0.1)',
    '--hover-bg': '#2d2d2d'
  }
};
```

**Korišćenje:**

**U ThemeProvider:**
```jsx
import { themes } from '../config/themes';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = themes[theme];
    
    // Primeni CSS varijable
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**U CSS:**
```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.button-primary {
  background-color: var(--color-primary);
  color: var(--text-primary);
}

.card {
  background-color: var(--bg-secondary);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.card:hover {
  background-color: var(--hover-bg);
}
```

**U JSX sa inline styles:**
```jsx
function MyComponent() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      Sadržaj
    </div>
  );
}
```

**Dodavanje Nove Boje:**

```javascript
export const themes = {
  light: {
    // ... postojeće boje
    '--color-gold': '#ffd700',
    '--color-silver': '#c0c0c0'
  },
  dark: {
    // ... postojeće boje
    '--color-gold': '#ffed4e',
    '--color-silver': '#e8e8e8'
  }
};
```

---

## 🎨 CSS Varijable - Kategorije

### Pozadinske Boje
```css
--bg-primary    /* Glavna pozadina (white/black) */
--bg-secondary  /* Sekundarna pozadina (kartice, paneli) */
--bg-tertiary   /* Tercijarna pozadina (hover, active) */
```

### Tekstualne Boje
```css
--text-primary    /* Glavni tekst */
--text-secondary  /* Sekundarni tekst (muted) */
--text-tertiary   /* Tercijarni tekst (placeholder) */
```

### Akcent Boje
```css
--color-primary   /* Primarna akcent boja (dugmad, linkovi) */
--color-secondary /* Sekundarna boja */
--color-success   /* Zelena (success messages) */
--color-danger    /* Crvena (errors, delete) */
--color-warning   /* Narandžasta (upozorenja) */
--color-info      /* Plava (informacije) */
```

### UI Elementi
```css
--border-color  /* Boja border-a */
--shadow-color  /* Boja senke (rgba sa alpha) */
--hover-bg      /* Background na hover */
```

---

## 📐 Best Practices

### 1. Konzistentnost između Tema

```javascript
// ✅ Dobro - Iste varijable u obe theme
export const themes = {
  light: {
    '--bg-primary': '#ffffff',
    '--text-primary': '#000000'
  },
  dark: {
    '--bg-primary': '#1a1a1a',  // Ista varijabla
    '--text-primary': '#ffffff'
  }
};

// ❌ Loše - Različite varijable
export const themes = {
  light: {
    '--background': '#ffffff'  // Različito ime
  },
  dark: {
    '--bg': '#1a1a1a'         // Različito ime
  }
};
```

### 2. Semantička Imenovanja

```javascript
// ✅ Dobro - Semantička imena
'--color-success': '#28a745'
'--color-danger': '#dc3545'

// ❌ Loše - Konkretne boje
'--color-green': '#28a745'
'--color-red': '#dc3545'
```

### 3. Korišćenje u Tailwind-u

**tailwind.config.js:**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'text-primary': 'var(--text-primary)',
        'primary': 'var(--color-primary)'
      }
    }
  }
};
```

**Korišćenje:**
```jsx
<div className="bg-bg-primary text-text-primary">
  Content
</div>
```

### 4. Fallback Vrednosti

```css
/* ✅ Dobro - Sa fallback-om */
.element {
  color: var(--text-primary, #000000);
}

/* ❌ Loše - Bez fallback-a */
.element {
  color: var(--text-primary);
}
```

### 5. Organizacija Varijabli

```javascript
export const themes = {
  light: {
    // === COLORS ===
    // Backgrounds
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f5',
    
    // Text
    '--text-primary': '#000000',
    '--text-secondary': '#666666',
    
    // === ACCENTS ===
    '--color-primary': '#007bff',
    '--color-success': '#28a745',
    
    // === UI ===
    '--border-color': '#dee2e6',
    '--shadow-color': 'rgba(0, 0, 0, 0.1)'
  }
};
```

---

## 🔧 Dodatna Konfiguracija

Ako trebate dodatne konfiguracione fajlove:

### api.js
```javascript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'https://api.dajashop.rs',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### constants.js
```javascript
export const APP_NAME = 'DajaShop';
export const APP_VERSION = '1.0.0';

export const PAGINATION = {
  itemsPerPage: 12,
  maxPages: 10
};

export const CART = {
  maxItems: 50,
  maxQuantityPerItem: 10
};

export const CATEGORIES = [
  { id: 'sport', name: 'Sportski' },
  { id: 'luksuzni', name: 'Luksuzni' },
  { id: 'casual', name: 'Casual' },
  { id: 'smart', name: 'Smart' }
];
```

### routes.js
```javascript
export const ROUTES = {
  HOME: '/',
  CATALOG: '/catalog',
  PRODUCT: '/product/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ACCOUNT: '/account',
  ORDERS: '/orders',
  ABOUT: '/about',
  ADMIN: '/admin'
};
```

---

## 🔗 Povezane Dokumentacije

- [Context](../context/README.md) - ThemeProvider
- [Styles](../styles/README.md) - Globalni CSS
- [Hooks](../hooks/README.md) - useTheme

## 💡 Dodavanje Nove Konfiguracije

1. Kreiraj novi fajl (npr. `myConfig.js`)
2. Export konfiguracione objekte ili konstante
3. Dodaj JSDoc komentare
4. Import i koristi u aplikaciji
5. Ažuriraj ovu dokumentaciju

**Template:**
```javascript
/**
 * Konfiguracija za [funkcionalnost]
 * @module config/myConfig
 */

/**
 * Glavni konfiguracioni objekat
 * @type {Object}
 */
export const MY_CONFIG = {
  option1: 'value1',
  option2: 'value2'
};

/**
 * Konstanta
 * @type {number}
 */
export const MAX_VALUE = 100;
```

---

**Poslednje ažuriranje:** Novembar 2025
