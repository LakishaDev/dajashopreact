# DajaShop — Vite + React e‑commerce starter (OOP domain + eksterni CSS + global theme config)

> Minimalan, ali kompletan temelj: katalog, filtriranje, pretraga, stranica proizvoda, korpa, checkout, nalozi (placeholder), orders (placeholder), brendovi, breadcrumb, paginacija, kontekst za Korpu i Temu, OOP domenski sloj (Product, CartItem, CatalogService, ProductRepository).

---

## 📁 Struktura projekta
```
dajashop/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ router.jsx
│  ├─ config/
│  │  └─ themes.js
│  ├─ context/
│  │  ├─ ThemeContext.jsx
│  │  └─ CartContext.jsx
│  ├─ domain/
│  │  ├─ Product.js
│  │  └─ CartItem.js
│  ├─ services/
│  │  └─ CatalogService.js
│  ├─ data/
│  │  └─ mock/products.js
│  ├─ utils/
│  │  └─ currency.js
│  ├─ components/
│  │  ├─ Header.jsx
│  │  ├─ Header.css
│  │  ├─ Footer.jsx
│  │  ├─ Footer.css
│  │  ├─ NavBar.jsx
│  │  ├─ NavBar.css
│  │  ├─ SearchBar.jsx
│  │  ├─ SearchBar.css
│  │  ├─ Breadcrumbs.jsx
│  │  ├─ Breadcrumbs.css
│  │  ├─ ProductCard.jsx
│  │  ├─ ProductCard.css
│  │  ├─ ProductGrid.jsx
│  │  ├─ ProductGrid.css
│  │  ├─ Filters.jsx
│  │  ├─ Filters.css
│  │  ├─ Pagination.jsx
│  │  ├─ Pagination.css
│  │  ├─ ThemeSwitcher.jsx
│  │  └─ ThemeSwitcher.css
│  ├─ pages/
│  │  ├─ Home.jsx
│  │  ├─ Home.css
│  │  ├─ Catalog.jsx
│  │  ├─ Catalog.css
│  │  ├─ Product.jsx
│  │  ├─ Product.css
│  │  ├─ Cart.jsx
│  │  ├─ Cart.css
│  │  ├─ Checkout.jsx
│  │  ├─ Checkout.css
│  │  ├─ Account.jsx
│  │  └─ Orders.jsx
│  └─ styles/
│     └─ base.css
└─ public/
   └─ placeholder.png
```

---

## ⚙️ package.json
```json
{
  "name": "dajashop",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.2",
    "vite": "^5.4.10"
  }
}
```

---

## 🔧 vite.config.js
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

---

## 🧱 index.html
```html
<!doctype html>
<html lang="sr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DajaShop — online prodavnica satova</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 🎨 Global theme config (jedan fajl, 5–6 boja po temi)
### src/config/themes.js
```js
// Svaka tema ima: primary, accent, bg, surface, text, muted
export const themes = {
  luxGold: {
    name: 'luxGold',
    primary: '#C8A94E',    // zlatna
    accent: '#1F2937',     // duboka antracit
    bg: '#0B0E12',         // skoro crna
    surface: '#151923',     // tamna površina
    text: '#F5F6F7',       // skoro belo
    muted: '#8B8F98'       // siva
  },
  midnightBlue: {
    name: 'midnightBlue',
    primary: '#4F46E5',
    accent: '#0B1020',
    bg: '#0A0C14',
    surface: '#12172A',
    text: '#F1F5F9',
    muted: '#94A3B8'
  },
  emerald: {
    name: 'emerald',
    primary: '#10B981',
    accent: '#0C1A12',
    bg: '#0A0F0D',
    surface: '#10231B',
    text: '#ECFDF5',
    muted: '#86EFAC'
  },
  crimson: {
    name: 'crimson',
    primary: '#EF4444',
    accent: '#1B0B0B',
    bg: '#0F0A0A',
    surface: '#1E1515',
    text: '#FEF2F2',
    muted: '#FCA5A5'
  },
  royalViolet: {
    name: 'royalViolet',
    primary: '#8B5CF6',
    accent: '#1B1026',
    bg: '#0F0B16',
    surface: '#1A1030',
    text: '#F4F3FF',
    muted: '#C4B5FD'
  }
};

export function applyTheme(theme) {
  const t = typeof theme === 'string' ? themes[theme] : theme;
  if (!t) return;
  const r = document.documentElement.style;
  r.setProperty('--color-primary', t.primary);
  r.setProperty('--color-accent', t.accent);
  r.setProperty('--color-bg', t.bg);
  r.setProperty('--color-surface', t.surface);
  r.setProperty('--color-text', t.text);
  r.setProperty('--color-muted', t.muted);
}
```

---

## 🧩 Global base CSS (promenljive + reset)
### src/styles/base.css
```css
:root {
  --color-primary: #C8A94E;
  --color-accent: #1F2937;
  --color-bg: #0B0E12;
  --color-surface: #151923;
  --color-text: #F5F6F7;
  --color-muted: #8B8F98;
}
* { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  background: var(--color-bg);
  color: var(--color-text);
}
a { color: inherit; text-decoration: none; }
button { cursor: pointer; }
.container { width: min(1200px, 92vw); margin: 0 auto; }
.card { background: var(--color-surface); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
.shadow { box-shadow: 0 10px 25px rgba(0,0,0,0.25); }
.badge { display:inline-block; padding:.25rem .5rem; border-radius:999px; font-size:.75rem; background: var(--color-accent); color: var(--color-text); opacity:.9 }
.hr { height:1px; background: rgba(255,255,255,.08); border:0; margin: 16px 0; }
.grid { display:grid; gap: 16px; }
```

---

## 🚀 main.jsx
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/base.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

---

## 🛣️ router.jsx
```jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Account from './pages/Account.jsx';
import Orders from './pages/Orders.jsx';

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:slug" element={<Product />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/orders" element={<Orders />} />
    </Routes>
  );
}
```

---

## 🧠 App.jsx
```jsx
import React from 'react';
import AppRoutes from './router.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';

export default function App(){
  return (
    <div className="app-root">
      <Header />
      <main className="container" style={{padding: '20px 0 48px'}}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}
```

---

## 🟡 ThemeContext (runtime temiranje celog sajta iz jednog mesta)
### src/context/ThemeContext.jsx
```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, applyTheme } from '../config/themes.js';

const ThemeCtx = createContext();

export function ThemeProvider({ children }){
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'luxGold');

  useEffect(() => { applyTheme(theme); localStorage.setItem('theme', theme); }, [theme]);

  const value = {
    theme,
    setTheme,
    available: Object.keys(themes)
  };

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(){ return useContext(ThemeCtx); }
```

---

## 🛒 CartContext (perzistencija u localStorage)
### src/context/CartContext.jsx
```jsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartCtx = createContext();

const initial = () => {
  try { return JSON.parse(localStorage.getItem('cart')||'[]'); } catch { return []; }
};

function reducer(state, action){
  switch(action.type){
    case 'ADD': {
      const i = state.findIndex(x => x.id === action.item.id);
      if (i >= 0){
        const next = [...state];
        next[i] = { ...next[i], qty: next[i].qty + (action.qty||1) };
        return next;
      }
      return [...state, { ...action.item, qty: action.qty||1 }];
    }
    case 'REMOVE': return state.filter(x => x.id !== action.id);
    case 'SET_QTY': return state.map(x => x.id===action.id?{...x, qty: Math.max(1, action.qty)}:x);
    case 'CLEAR': return [];
    default: return state;
  }
}

export function CartProvider({ children }){
  const [items, dispatch] = useReducer(reducer, [], initial);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const total = useMemo(() => items.reduce((s,x)=> s + x.price*x.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s,x)=> s + x.qty, 0), [items]);

  const value = { items, dispatch, total, count };
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart(){ return useContext(CartCtx); }
```

---

## 🧱 Domain modeli (OOP)
### src/domain/Product.js
```js
export default class Product {
  constructor({ id, brand, name, slug, price, oldPrice=null, gender=null, category=null, image, specs={} }){
    this.id = id; this.brand = brand; this.name = name; this.slug = slug;
    this.price = price; this.oldPrice = oldPrice; this.gender = gender; this.category = category;
    this.image = image; this.specs = specs;
  }
}
```

### src/domain/CartItem.js
```js
export default class CartItem {
  constructor(product, qty=1){
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.image = product.image;
    this.brand = product.brand;
    this.slug = product.slug;
    this.qty = qty;
  }
}
```

---

## 📦 CatalogService (sa Repository slojem)
### src/services/CatalogService.js
```js
import Product from '../domain/Product.js';
import data from '../data/mock/products.js';

class ProductRepository{
  constructor(rows){
    this.rows = rows.map(r => new Product(r));
  }
  all(){ return this.rows; }
  bySlug(slug){ return this.rows.find(p => p.slug === slug); }
  filter({q, brand, gender, category, min, max}){
    let out = [...this.rows];
    if (q){
      const s = q.toLowerCase();
      out = out.filter(p => `${p.brand} ${p.name}`.toLowerCase().includes(s));
    }
    if (brand && brand.length) out = out.filter(p => brand.includes(p.brand));
    if (gender && gender.length) out = out.filter(p => gender.includes(p.gender));
    if (category && category.length) out = out.filter(p => category.includes(p.category));
    if (min!=null) out = out.filter(p => p.price >= min);
    if (max!=null) out = out.filter(p => p.price <= max);
    return out;
  }
}

class CatalogService{
  constructor(){ this.repo = new ProductRepository(data); }
  list(params){ return this.repo.filter(params||{}); }
  get(slug){ return this.repo.bySlug(slug); }
  brands(){ return [...new Set(this.repo.all().map(p=>p.brand))]; }
  genders(){ return [...new Set(this.repo.all().map(p=>p.gender).filter(Boolean))]; }
  categories(){ return [...new Set(this.repo.all().map(p=>p.category).filter(Boolean))]; }
}

const catalog = new CatalogService();
export default catalog;
```

---

## 🧮 utils/currency.js
```js
export const money = (n) => new Intl.NumberFormat('sr-RS', { style:'currency', currency:'RSD', maximumFractionDigits: 0 }).format(n);
```

---

## 🧪 Mock podaci (zamisli ih kao seed; slike zameni realnim)
### src/data/mock/products.js
```js
export default [
  {
    id: 'casio-mtp-vd02b-1e', brand: 'CASIO', name: 'MTP-VD02B-1EUDF', slug: 'casio-mtp-vd02b-1e',
    price: 5500, gender: 'MUŠKI', category: 'RETRO', image: '/placeholder.png',
    specs: { staklo: 'Mineralno', vodootpornost: 'WR ISO 22810', baterija: '3 godine' }
  },
  {
    id: 'casio-mtp-1314pl-8a', brand: 'CASIO', name: 'MTP-1314PL-8AVEF', slug: 'casio-mtp-1314pl-8a',
    price: 4900, gender: 'MUŠKI', category: 'RETRO', image: '/placeholder.png',
    specs: { staklo: 'Mineralno', vodootpornost: 'WR ISO 22810', baterija: '2 godine' }
  },
  {
    id: 'qq-ladies-01', brand: 'Q&Q', name: 'Q&Q Ženski Classic', slug: 'qq-zenski-classic',
    price: 3990, gender: 'ŽENSKI', category: 'CLASSIC', image: '/placeholder.png',
    specs: { narukvica: 'Čelik', mehanizam: 'Quartz' }
  },
  {
    id: 'daniel-klein-men-01', brand: 'DANIEL KLEIN', name: 'DK Men Steel', slug: 'daniel-klein-men-steel',
    price: 7990, gender: 'MUŠKI', category: 'FASHION', image: '/placeholder.png',
    specs: { narukvica: 'Čelik', prikaz: 'Analogni' }
  },
  {
    id: 'orient-diver-200', brand: 'ORIENT', name: '200m Diver', slug: 'orient-200m-diver',
    price: 29990, gender: 'MUŠKI', category: '200m DIVERS', image: '/placeholder.png',
    specs: { vodootpornost: '200m', staklo: 'Mineralno' }
  }
];
```

---

## 🔝 Header
### src/components/Header.jsx
```jsx
import React from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import SearchBar from './SearchBar.jsx';
import ThemeSwitcher from './ThemeSwitcher.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Header(){
  const { count } = useCart();
  return (
    <header className="header card shadow">
      <div className="container header__row">
        <Link to="/" className="header__brand">DajaShop</Link>
        <SearchBar />
        <div className="header__actions">
          <ThemeSwitcher />
          <Link className="header__cart" to="/cart">Korpa <span className="badge">{count}</span></Link>
          <Link to="/account" className="header__account">Moj nalog</Link>
        </div>
      </div>
      <NavBar />
    </header>
  );
}
```

### src/components/Header.css
```css
.header { position: sticky; top: 0; z-index: 40; backdrop-filter: blur(6px); }
.header__row { display:flex; align-items:center; gap:16px; padding: 10px 0; }
.header__brand { font-size: 1.25rem; font-weight: 700; color: var(--color-primary); }
.header__actions { margin-left:auto; display:flex; align-items:center; gap:12px; }
.header__cart, .header__account { padding:8px 12px; border-radius: 10px; background: rgba(255,255,255,0.04); }
```

---

## 🧭 NavBar (sa brendovima i podkategorijama)
### src/components/NavBar.jsx
```jsx
import React from 'react';
import './NavBar.css';
import { Link } from 'react-router-dom';

const nav = [
  { label:'DANIEL KLEIN', children:[{label:'MUŠKI'},{label:'ŽENSKI'}] },
  { label:'CASIO', children:[{label:'G-SHOCK'},{label:'BABY-G'},{label:'EDIFICE'},{label:'SHEEN'},{label:'RETRO'}] },
  { label:'ORIENT', children:[{label:'200m DIVERS'},{label:'ŽENSKI'}] },
  { label:'Q&Q', children:[{label:'MUŠKI'},{label:'ŽENSKI'}] }
];

export default function NavBar(){
  return (
    <nav className="navbar">
      <div className="container navbar__row">
        <Link to="/catalog" className="navbar__all">Katalog</Link>
        {nav.map(group => (
          <div key={group.label} className="navbar__group">
            <span className="navbar__label">{group.label}</span>
            <div className="navbar__dropdown card">
              {group.children.map(c => (
                <Link key={c.label} to={`/catalog?brand=${encodeURIComponent(group.label)}&category=${encodeURIComponent(c.label)}`}>{c.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
```

### src/components/NavBar.css
```css
.navbar { border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
.navbar__row { display:flex; gap: 18px; align-items:center; }
.navbar__all { color: var(--color-text); padding: 10px 12px; border-radius: 8px; background: rgba(255,255,255,0.04); }
.navbar__group { position: relative; }
.navbar__label { padding: 10px 8px; opacity: .9; }
.navbar__group:hover .navbar__dropdown { display: grid; }
.navbar__dropdown { display:none; position: absolute; top: 100%; left: 0; padding: 8px; grid-template-columns: 1fr; gap: 6px; }
.navbar__dropdown a { padding: 8px 10px; border-radius: 8px; }
.navbar__dropdown a:hover { background: rgba(255,255,255,0.06); }
```

---

## 🔎 SearchBar
### src/components/SearchBar.jsx
```jsx
import React, { useState } from 'react';
import './SearchBar.css';
import { useNavigate } from 'react-router-dom';

export default function SearchBar(){
  const [q, setQ] = useState('');
  const nav = useNavigate();
  function submit(e){ e.preventDefault(); nav(`/catalog?q=${encodeURIComponent(q)}`); }
  return (
    <form className="search" onSubmit={submit} role="search">
      <input className="search__input" value={q} onChange={e=>setQ(e.target.value)} placeholder="Pretraga satova…" />
      <button className="search__btn" type="submit">Traži</button>
    </form>
  );
}
```

### src/components/SearchBar.css
```css
.search { display:flex; gap:8px; flex: 1 1 auto; }
.search__input { flex:1; padding:10px 12px; border-radius: 10px; border:1px solid rgba(255,255,255,0.06); background: var(--color-surface); color: var(--color-text); }
.search__btn { padding: 10px 14px; border-radius: 10px; border:0; background: var(--color-primary); color: #111; font-weight:700; }
```

---

## 🧭 Breadcrumbs
### src/components/Breadcrumbs.jsx
```jsx
import React from 'react';
import './Breadcrumbs.css';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ trail }){
  return (
    <div className="breadcrumbs">
      <Link to="/">Početak</Link>
      {trail?.map((t,i) => (
        <span key={i}>/ <Link to={t.href||'#'}>{t.label}</Link></span>
      ))}
    </div>
  );
}
```

### src/components/Breadcrumbs.css
```css
.breadcrumbs { font-size: .9rem; opacity: .85; display:flex; gap: 8px; align-items:center; margin-bottom: 12px; }
.breadcrumbs a { color: var(--color-muted); }
```

---

## 🧱 ProductCard
### src/components/ProductCard.jsx
```jsx
import React from 'react';
import './ProductCard.css';
import { Link } from 'react-router-dom';
import { money } from '../utils/currency.js';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ p }){
  const { dispatch } = useCart();
  return (
    <div className="product-card card">
      <Link to={`/product/${p.slug}`} className="product-card__img">
        <img src={p.image} alt={p.name} loading="lazy"/>
      </Link>
      <div className="product-card__body">
        <div className="product-card__brand">{p.brand}</div>
        <Link to={`/product/${p.slug}`} className="product-card__name">{p.name}</Link>
        <div className="product-card__price">{money(p.price)}</div>
        <button className="product-card__btn" onClick={()=> dispatch({type:'ADD', item:{id:p.id, name:p.name, price:p.price, image:p.image, brand:p.brand, slug:p.slug}})}>Dodaj u korpu</button>
      </div>
    </div>
  );
}
```

### src/components/ProductCard.css
```css
.product-card { overflow:hidden; }
.product-card__img { display:block; aspect-ratio: 1 / 1; background: #0e1218; }
.product-card__img img { width:100%; height:100%; object-fit: cover; display:block; }
.product-card__body { padding: 12px; display:grid; gap: 6px; }
.product-card__brand { color: var(--color-muted); font-size: .85rem; }
.product-card__name { font-weight: 600; }
.product-card__price { color: var(--color-primary); font-weight: 700; }
.product-card__btn { margin-top: 6px; padding: 10px 12px; border:0; border-radius: 10px; background: var(--color-primary); color: #111; font-weight: 700; }
```

---

## 🧱 ProductGrid
### src/components/ProductGrid.jsx
```jsx
import React from 'react';
import './ProductGrid.css';
import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ items }){
  return (
    <div className="product-grid">
      {items.map(p => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}
```

### src/components/ProductGrid.css
```css
.product-grid { display:grid; grid-template-columns: repeat( auto-fill, minmax(220px, 1fr) ); gap: 16px; }
```

---

## 🧰 Filters
### src/components/Filters.jsx
```jsx
import React, { useEffect, useMemo, useState } from 'react';
import './Filters.css';
import { useSearchParams } from 'react-router-dom';
import catalog from '../services/CatalogService.js';

export default function Filters(){
  const brands = useMemo(()=> catalog.brands(), []);
  const genders = useMemo(()=> catalog.genders(), []);
  const categories = useMemo(()=> catalog.categories(), []);

  const [sp, setSp] = useSearchParams();
  const [min, setMin] = useState(sp.get('min')||'');
  const [max, setMax] = useState(sp.get('max')||'');

  function toggleParam(key, val){
    const arr = (sp.getAll(key) || []);
    const has = arr.includes(val);
    const next = has ? arr.filter(x => x!==val) : [...arr, val];
    sp.delete(key);
    next.forEach(v => sp.append(key, v));
    setSp(sp, { replace: true });
  }
  function setRange(){
    if (min) sp.set('min', min); else sp.delete('min');
    if (max) sp.set('max', max); else sp.delete('max');
    setSp(sp, { replace: true });
  }

  function checked(key, val){ return sp.getAll(key).includes(val); }

  useEffect(()=>{ setMin(sp.get('min')||''); setMax(sp.get('max')||''); }, [sp]);

  return (
    <aside className="filters card">
      <div className="filters__section">
        <div className="filters__title">Brend</div>
        <div className="filters__list">
          {brands.map(b => (
            <label key={b}><input type="checkbox" checked={checked('brand', b)} onChange={()=>toggleParam('brand', b)} /> {b}</label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Pol</div>
        <div className="filters__list">
          {genders.map(g => (
            <label key={g}><input type="checkbox" checked={checked('gender', g)} onChange={()=>toggleParam('gender', g)} /> {g}</label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Kategorija</div>
        <div className="filters__list">
          {categories.map(c => (
            <label key={c}><input type="checkbox" checked={checked('category', c)} onChange={()=>toggleParam('category', c)} /> {c}</label>
          ))}
        </div>
      </div>
      <div className="filters__section">
        <div className="filters__title">Cena</div>
        <div className="filters__range">
          <input value={min} onChange={e=>setMin(e.target.value)} placeholder="Min" />
          <input value={max} onChange={e=>setMax(e.target.value)} placeholder="Max" />
          <button onClick={setRange}>Primeni</button>
        </div>
      </div>
    </aside>
  );
}
```

### src/components/Filters.css
```css
.filters { padding: 14px; position: sticky; top: 76px; align-self: start; }
.filters__section + .filters__section { margin-top: 12px; }
.filters__title { font-weight: 700; margin-bottom: 8px; }
.filters__list { display:grid; gap: 6px; }
.filters__range { display:flex; gap: 8px; }
.filters__range input { flex:1; padding:8px; border-radius: 10px; border:1px solid rgba(255,255,255,0.06); background: var(--color-surface); color: var(--color-text); }
.filters__range button { padding: 8px 10px; border-radius: 10px; border:0; background: var(--color-primary); color:#111; font-weight:700; }
```

---

## ⏭️ Pagination
### src/components/Pagination.jsx
```jsx
import React from 'react';
import './Pagination.css';

export default function Pagination({ page, total, perPage, onChange }){
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      {Array.from({length: pages}).map((_,i)=> (
        <button key={i} className={`pagination__btn ${page===i+1?'is-active':''}`} onClick={()=>onChange(i+1)}>{i+1}</button>
      ))}
    </div>
  );
}
```

### src/components/Pagination.css
```css
.pagination { display:flex; gap: 8px; justify-content:center; margin-top: 16px; }
.pagination__btn { padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08); background: var(--color-surface); color: var(--color-text); }
.pagination__btn.is-active { background: var(--color-primary); color:#111; border-color: transparent; }
```

---

## 🎚️ ThemeSwitcher
### src/components/ThemeSwitcher.jsx
```jsx
import React from 'react';
import './ThemeSwitcher.css';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeSwitcher(){
  const { theme, setTheme, available } = useTheme();
  return (
    <select className="theme-switcher" value={theme} onChange={(e)=>setTheme(e.target.value)}>
      {available.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}
```

### src/components/ThemeSwitcher.css
```css
.theme-switcher { padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,.08); background: var(--color-surface); color: var(--color-text); }
```

---

## 🏠 Home
### src/pages/Home.jsx
```jsx
import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

export default function Home(){
  return (
    <div className="home">
      <section className="hero card shadow">
        <div className="hero__wrap container">
          <div className="hero__copy">
            <h1>Vreme je da zablistaš</h1>
            <p>Odaberi sat koji priča tvoj stil — Casio, Daniel Klein, Q&Q i još mnogo toga.</p>
            <div className="hero__actions">
              <Link to="/catalog" className="btn-primary">Pogledaj katalog</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### src/pages/Home.css
```css
.hero { background: linear-gradient(135deg, var(--color-accent), transparent), url('/placeholder.png') center/cover no-repeat; border: 1px solid rgba(255,255,255,.06); }
.hero__wrap { padding: 48px 0; }
.hero__copy h1 { font-size: clamp(28px, 4vw, 44px); margin: 0 0 8px; color: var(--color-primary); }
.hero__actions .btn-primary { display:inline-block; padding: 12px 16px; background: var(--color-primary); color: #111; border-radius: 10px; font-weight: 800; }
```

---

## 🗂️ Catalog (grid + filter + paginacija + query params)
### src/pages/Catalog.jsx
```jsx
import React, { useMemo, useState } from 'react';
import './Catalog.css';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Filters from '../components/Filters.jsx';
import Pagination from '../components/Pagination.jsx';
import catalog from '../services/CatalogService.js';
import { useSearchParams } from 'react-router-dom';

const PER_PAGE = 12;

export default function Catalog(){
  const [sp] = useSearchParams();
  const params = useMemo(()=>({
    q: sp.get('q')||'',
    brand: sp.getAll('brand'),
    gender: sp.getAll('gender'),
    category: sp.getAll('category'),
    min: sp.get('min')?Number(sp.get('min')):null,
    max: sp.get('max')?Number(sp.get('max')):null
  }), [sp]);

  const data = useMemo(()=> catalog.list(params), [params]);

  const [page, setPage] = useState(1);
  const start = (page-1)*PER_PAGE;
  const items = data.slice(start, start+PER_PAGE);

  return (
    <div className="catalog grid" style={{gridTemplateColumns:'260px 1fr'}}>
      <Filters />
      <div>
        <Breadcrumbs trail={[{label:'Katalog', href:'/catalog'}]} />
        <div className="catalog__count">Ukupno: {data.length}</div>
        <ProductGrid items={items} />
        <Pagination page={page} total={data.length} perPage={PER_PAGE} onChange={setPage} />
      </div>
    </div>
  );
}
```

### src/pages/Catalog.css
```css
.catalog__count { margin-bottom: 12px; color: var(--color-muted); }
```

---

## 📄 Product (detalji)
### src/pages/Product.jsx
```jsx
import React from 'react';
import './Product.css';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import catalog from '../services/CatalogService.js';
import { money } from '../utils/currency.js';
import { useCart } from '../context/CartContext.jsx';

export default function Product(){
  const { slug } = useParams();
  const p = catalog.get(slug);
  const { dispatch } = useCart();
  if (!p) return <div>Proizvod nije pronađen.</div>
  return (
    <div className="product grid" style={{gridTemplateColumns:'1fr 1fr', alignItems:'start'}}>
      <div className="card product__media"><img src={p.image} alt={p.name} /></div>
      <div>
        <Breadcrumbs trail={[{label:'Katalog', href:'/catalog'}, {label: p.brand}]} />
        <h1 className="product__title">{p.brand} — {p.name}</h1>
        <div className="product__price">{money(p.price)}</div>
        <div className="product__specs card">
          {Object.entries(p.specs||{}).map(([k,v])=> (
            <div className="product__spec" key={k}><strong>{k}:</strong> {v}</div>
          ))}
        </div>
        <button className="product__cta" onClick={()=> dispatch({type:'ADD', item:{id:p.id, name:p.name, price:p.price, image:p.image, brand:p.brand, slug:p.slug}})}>Dodaj u korpu</button>
      </div>
    </div>
  );
}
```

### src/pages/Product.css
```css
.product__media { padding: 12px; }
.product__media img { width:100%; border-radius: 12px; display:block; }
.product__title { margin: 8px 0; }
.product__price { color: var(--color-primary); font-weight: 900; font-size: 1.25rem; margin-bottom: 12px; }
.product__specs { padding: 12px; display:grid; gap: 6px; }
.product__cta { margin-top: 12px; padding: 12px 14px; border:0; border-radius: 12px; background: var(--color-primary); color:#111; font-weight: 800; }
```

---

## 🧺 Cart
### src/pages/Cart.jsx
```jsx
import React from 'react';
import './Cart.css';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/currency.js';

export default function Cart(){
  const { items, total, dispatch } = useCart();
  return (
    <div className="cart">
      <h1>Vaša korpa</h1>
      {items.length === 0 && (
        <p>Korpa je prazna. <Link to="/catalog">Nastavi kupovinu</Link></p>
      )}
      {items.length > 0 && (
        <div className="card cart__wrap">
          {items.map(it => (
            <div key={it.id} className="cart__row">
              <img src={it.image} alt="thumb"/>
              <div className="cart__meta">
                <Link to={`/product/${it.slug}`}>{it.name}</Link>
                <div className="cart__brand">{it.brand}</div>
              </div>
              <input className="cart__qty" type="number" min="1" value={it.qty} onChange={e=>dispatch({type:'SET_QTY', id:it.id, qty:Number(e.target.value)})}/>
              <div className="cart__price">{money(it.price * it.qty)}</div>
              <button className="cart__remove" onClick={()=>dispatch({type:'REMOVE', id: it.id})}>Ukloni</button>
            </div>
          ))}
          <div className="hr"></div>
          <div className="cart__total">
            <div>Ukupno:</div>
            <div className="cart__totalPrice">{money(total)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <Link to="/checkout" className="cart__checkout">Nastavi na naplatu</Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

### src/pages/Cart.css
```css
.cart__wrap { padding: 12px; }
.cart__row { display:grid; grid-template-columns: 72px 1fr 90px 120px 80px; align-items:center; gap: 12px; padding: 8px 0; }
.cart__row img { width:72px; height:72px; object-fit: cover; border-radius: 8px; }
.cart__meta a { font-weight: 600; }
.cart__brand { color: var(--color-muted); font-size: .85rem; }
.cart__qty { width:80px; padding:8px; border-radius:10px; border:1px solid rgba(255,255,255,.06); background: var(--color-surface); color: var(--color-text); }
.cart__price { text-align:right; font-weight: 700; }
.cart__remove { border:0; background: transparent; color: var(--color-muted); }
.cart__total { display:flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; }
.cart__totalPrice { color: var(--color-primary); }
.cart__checkout { display:inline-block; padding: 12px 16px; border-radius: 12px; background: var(--color-primary); color:#111; font-weight:800; }
```

---

## 💳 Checkout (placeholder forma)
### src/pages/Checkout.jsx
```jsx
import React from 'react';
import './Checkout.css';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../utils/currency.js';

export default function Checkout(){
  const { total } = useCart();
  return (
    <div className="checkout grid" style={{gridTemplateColumns:'1fr 360px', gap:'16px'}}>
      <div className="card checkout__form">
        <h2>Podaci za isporuku</h2>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr'}}>
          <input placeholder="Ime" />
          <input placeholder="Prezime" />
          <input placeholder="Telefon" />
          <input placeholder="E-mail" />
          <input className="wide" placeholder="Adresa" />
          <input placeholder="Grad" />
          <input placeholder="Poštanski broj" />
        </div>
        <h3>Način isporuke</h3>
        <label><input type="radio" name="ship" defaultChecked /> Post Express (Srbija)</label>
        <h3>Način plaćanja</h3>
        <label><input type="radio" name="pay" defaultChecked /> Pouzećem</label>
        <button className="checkout__btn">Potvrdi porudžbinu</button>
      </div>
      <div className="card checkout__summary">
        <h2>Sažetak</h2>
        <div className="checkout__total">Ukupno: <span>{money(total)}</span></div>
        <p className="muted">Isporuka i popusti se obračunavaju kasnije.</p>
      </div>
    </div>
  );
}
```

### src/pages/Checkout.css
```css
.checkout__form, .checkout__summary { padding: 14px; }
.checkout__form input { padding: 10px; border-radius: 10px; border:1px solid rgba(255,255,255,.06); background: var(--color-surface); color: var(--color-text); }
.checkout__form .grid { gap: 10px; margin-bottom: 12px; }
.checkout__form .wide { grid-column: 1/-1; }
.checkout__btn { margin-top: 12px; padding: 12px 16px; border-radius: 12px; border:0; background: var(--color-primary); color:#111; font-weight: 900; }
.checkout__summary h2 { margin: 8px 0 12px; }
.checkout__total { display:flex; justify-content: space-between; font-weight: 800; font-size: 1.1rem; }
.muted { color: var(--color-muted); }
```

---

## 👤 Account & Orders (placeholder)
### src/pages/Account.jsx
```jsx
import React from 'react';

export default function Account(){
  return <div><h1>Moj nalog</h1><p>Prijava/registracija i podešavanja — integrisati kasnije.</p></div>;
}
```

### src/pages/Orders.jsx
```jsx
import React from 'react';

export default function Orders(){
  return <div><h1>Moje porudžbine</h1><p>Istorija porudžbina — integrisati kasnije.</p></div>;
}
```

---

## 🦶 Footer (kontakt + radno vreme)
### src/components/Footer.jsx
```jsx
import React from 'react';
import './Footer.css';

export default function Footer(){
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <div className="footer__brand">Daja Shop</div>
          <div className="footer__muted">online prodavnica satova</div>
        </div>
        <div>
          <div className="footer__title">Kontakt</div>
          <div>Tel: 064/1262425 · 065/2408400</div>
          <div>Niš, TPC Gorča lokal C31</div>
          <div>E-mail: cvelenis42@yahoo.com</div>
        </div>
        <div>
          <div className="footer__title">Radno vreme</div>
          <div>Pon – Pet: 09:00 – 20:00</div>
          <div>Subota: 09:00 – 15:00</div>
          <div>Nedelja: Zatvoreno</div>
        </div>
      </div>
      <div className="footer__bottom">© {new Date().getFullYear()} Daja Shop</div>
    </footer>
  );
}
```

### src/components/Footer.css
```css
.footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,.08); }
.footer__grid { display:grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.footer__brand { font-weight: 900; color: var(--color-primary); font-size: 1.1rem; }
.footer__title { font-weight: 800; margin-bottom: 6px; }
.footer__muted { color: var(--color-muted); }
.footer__bottom { text-align:center; color: var(--color-muted); padding: 12px 0 24px; }
```

---

# ✅ Kako pokrenuti
1) Kreiraj projekat:
```bash
npm create vite@latest dajashop -- --template react
cd dajashop
```
2) Zameni fajlove sa ovim iz startera (ili ubaci po strukturi iznad).
3) Instaliraj:
```bash
npm i
```
4) Pokreni dev server:
```bash
npm run dev
```

> Sve CSS datoteke su *eksterne* i raspoređene po komponentama. Čitav sajt menjaš iz **src/config/themes.js** (runtime) ili samo promenom vrednosti u **:root** (build‑time).

