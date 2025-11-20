# Styles - Globalni Stilovi i CSS

Globalni CSS stilovi, varijable i Tailwind CSS konfiguracija.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Base CSS](#base-css)
- [Tailwind CSS](#tailwind-css)
- [CSS Varijable](#css-varijable)
- [Best Practices](#best-practices)

## 🎯 Pregled

Styles direktorijum sadrži:
- **base.css** - Globalni CSS (reset, typography, utilities)
- **CSS Custom Properties** - CSS varijable za teme
- **Tailwind Configuration** - `tailwind.config.js` (root folder)

## 🎨 Base CSS

### base.css

**Namena:** Globalni CSS koji se primenjuje na celu aplikaciju.

**Sekcije:**

#### 1. CSS Reset & Base Styles

```css
/* Reset margina i paddinga */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Base font */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
               'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

/* Links */
a {
  text-decoration: none;
  color: inherit;
}

/* Lists */
ul, ol {
  list-style: none;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Buttons */
button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}
```

---

#### 2. Typography

```css
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.5em;
}

h1 { font-size: 2.5rem; }   /* 40px */
h2 { font-size: 2rem; }     /* 32px */
h3 { font-size: 1.75rem; }  /* 28px */
h4 { font-size: 1.5rem; }   /* 24px */
h5 { font-size: 1.25rem; }  /* 20px */
h6 { font-size: 1rem; }     /* 16px */

p {
  margin-bottom: 1em;
}

/* Responsive typography */
@media (max-width: 768px) {
  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
}
```

---

#### 3. Utility Classes

```css
/* Spacing */
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Text */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-bold { font-weight: bold; }
.text-italic { font-style: italic; }

/* Display */
.hidden { display: none; }
.visible { display: block; }

/* Responsive */
@media (max-width: 768px) {
  .hidden-mobile { display: none; }
}

@media (min-width: 769px) {
  .hidden-desktop { display: none; }
}
```

---

#### 4. Component Classes

```css
/* Card */
.card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.card:hover {
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* Button */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-block;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-outline {
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-success {
  background-color: var(--color-success);
  color: white;
}

.badge-danger {
  background-color: var(--color-danger);
  color: white;
}

/* Input */
.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-error {
  border-color: var(--color-danger);
}

/* Error message */
.error-message {
  color: var(--color-danger);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Success message */
.success-message {
  color: var(--color-success);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
```

---

#### 5. Animations

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Spin (Loading) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🎨 CSS Varijable

CSS Custom Properties definisane u `src/config/themes.js` i primenjene u ThemeProvider.

### Light Theme

```css
:root {
  /* Pozadine */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #e0e0e0;
  
  /* Tekst */
  --text-primary: #000000;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  
  /* Akcent boje */
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;
  
  /* UI */
  --border-color: #dee2e6;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --hover-bg: #f8f9fa;
}
```

### Dark Theme

```css
:root[data-theme="dark"] {
  /* Pozadine */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-tertiary: #3a3a3a;
  
  /* Tekst */
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-tertiary: #999999;
  
  /* UI */
  --border-color: #404040;
  --shadow-color: rgba(255, 255, 255, 0.1);
  --hover-bg: #2d2d2d;
}
```

### Korišćenje Varijabli

```css
/* U CSS */
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.button-primary {
  background-color: var(--color-primary);
  color: white;
}

.card {
  background: var(--bg-secondary);
  box-shadow: 0 2px 8px var(--shadow-color);
}
```

---

## 🎨 Tailwind CSS

### Konfiguracija

**tailwind.config.js** (u root direktorijumu):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Custom boje iz CSS varijabli
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'primary': 'var(--color-primary)',
        'success': 'var(--color-success)',
        'danger': 'var(--color-danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/vite')
  ],
}
```

### Najčešće Korišćene Klase

```jsx
// Layout
<div className="container mx-auto px-4">
<div className="flex items-center justify-between">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Spacing
<div className="mt-4 mb-8 px-6 py-4">

// Typography
<h1 className="text-3xl font-bold text-center">
<p className="text-gray-600 text-sm">

// Colors
<div className="bg-blue-500 text-white">
<button className="bg-green-500 hover:bg-green-600">

// Borders & Shadows
<div className="border border-gray-300 rounded-lg shadow-md">

// Responsive
<div className="hidden md:block">
<div className="w-full md:w-1/2 lg:w-1/3">

// States
<button className="hover:bg-blue-600 active:scale-95 focus:outline-none">

// Animations
<div className="transition-all duration-300 ease-in-out">
<div className="animate-pulse">
```

---

## 📐 Best Practices

### 1. Kombinacija Tailwind i Custom CSS

```css
/* ✅ Dobro - Koristi Tailwind za standardne stilove */
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">

/* ✅ Custom CSS za specifične potrebe */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

/* ❌ Loše - Ne duplirati Tailwind klase u custom CSS */
.my-card {
  display: flex;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
}
```

### 2. CSS Varijable za Teme

```css
/* ✅ Dobro - Koristi CSS varijable */
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* ❌ Loše - Hardcoded boje */
.component {
  background-color: #ffffff;
  color: #000000;
}
```

### 3. Mobile-First Approach

```css
/* ✅ Dobro - Mobile first */
.container {
  width: 100%;
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* ❌ Loše - Desktop first */
.container {
  padding: 2rem;
}

@media (max-width: 767px) {
  .container {
    padding: 1rem;
  }
}
```

### 4. BEM Naming za Custom CSS

```css
/* ✅ Dobro - BEM convention */
.product-card { }
.product-card__image { }
.product-card__title { }
.product-card__price { }
.product-card--featured { }

/* ❌ Loše - Nejasno imenovanje */
.card { }
.img { }
.title { }
.price { }
```

### 5. Avoid !important

```css
/* ✅ Dobro - Bez !important */
.button {
  background-color: var(--color-primary);
}

.button:hover {
  background-color: var(--color-primary-dark);
}

/* ❌ Loše - Sa !important */
.button {
  background-color: var(--color-primary) !important;
}
```

### 6. Group Related Styles

```css
/* ✅ Dobro - Grupisani stilovi */
/* === Layout === */
.container { }
.grid { }
.flex { }

/* === Typography === */
.heading { }
.paragraph { }

/* === Components === */
.button { }
.card { }
.modal { }

/* === Utilities === */
.text-center { }
.hidden { }
```

## 🔗 Povezane Dokumentacije

- [Config](../config/README.md) - Theme configuration
- [Components](../components/README.md) - Component styles
- [Pages](../pages/README.md) - Page styles

## 💡 Dodavanje Novih Stilova

### Za Globalne Stilove

1. Otvori `src/styles/base.css`
2. Dodaj novi stil u odgovarajuću sekciju
3. Koristi CSS varijable za boje
4. Testiraj u light i dark mode-u

### Za Component Stilove

1. Kreiraj `ComponentName.css` uz komponentu
2. Koristi BEM naming convention
3. Koristi Tailwind za standardne stilove
4. Custom CSS samo za specifične potrebe

### Za Tailwind Extensions

1. Otvori `tailwind.config.js`
2. Dodaj u `theme.extend` sekciju
3. Rebuild projekta
4. Koristi nove klase

---

**Poslednje ažuriranje:** Novembar 2025
