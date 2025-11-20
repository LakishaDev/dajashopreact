# Components - React Komponente

Ovaj direktorijum sadrži sve ponovo upotrebljive React komponente koje čine korisničku interfejs DajaShop aplikacije.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Glavne Komponente](#glavne-komponente)
- [Layout Komponente](#layout-komponente)
- [UI Komponente](#ui-komponente)
- [Modali](#modali)
- [About Stranica Komponente](#about-stranica-komponente)
- [Konvencije](#konvencije)

## 🎯 Pregled

Sve komponente su:
- **Funkcionalne** - Koriste React Hooks
- **Responzivne** - Prilagođene za sve veličine ekrana
- **Animirane** - Koriste Framer Motion za smooth animacije
- **Stilizovane** - Kombinacija Tailwind CSS-a i custom CSS-a
- **Pristupačne** - ARIA labels i keyboard navigation

## 🔑 Glavne Komponente

### AuthModal.jsx
**Namena:** Kompletan autentifikacioni modal sa podrškom za više metoda prijave.

**Karakteristike:**
- Login/Register tab sistem
- Email/Password autentifikacija
- Google OAuth
- Facebook OAuth
- Phone SMS verifikacija
- Email verifikacija sistem
- Validacija input polja
- Loading states i error handling

**Korišćenje:**
```jsx
import AuthModal from './components/AuthModal';

// Modal se automatski kontroliše preko AuthContext
<AuthModal />
```

**Props:** Nema direktnih props-a. Koristi `useAuth()` hook za state management.

**Related:**
- `src/hooks/useAuth.js`
- `src/context/AuthContext.jsx`
- `src/services/firebase.js`

---

### Header.jsx
**Namena:** Glavni navigacioni header aplikacije.

**Komponente:**
- Logo/Brand link
- Search bar
- Shopping cart sa badge-om
- Login/User button
- Hamburger menu za mobile
- Admin link (za admin korisnike)

**Korišćenje:**
```jsx
import Header from './components/Header';

<Header />
```

**State Management:**
- Koristi `useAuth()` za user state
- Koristi `useCart()` za cart count
- Lokalni state za hamburger menu

---

### Footer.jsx
**Namena:** Footer sa kontakt informacijama i navigacionim linkovima.

**Sekcije:**
- Brend informacije
- Kontakt detalji (email, telefon, adresa)
- Navigacioni linkovi
- Radno vreme
- Copyright

**Korišćenje:**
```jsx
import Footer from './components/Footer';

<Footer />
```

---

### ProductCard.jsx
**Namena:** Kartica za prikaz proizvoda u katalogu i na home page-u.

**Karakteristike:**
- Slika proizvoda sa lazy loading
- Naziv i cena
- "Dodaj u korpu" dugme
- Hover animacije
- Quick view opcija
- Responsive dizajn

**Korišćenje:**
```jsx
import ProductCard from './components/ProductCard';

<ProductCard 
  product={productObject}
  onAddToCart={handleAddToCart}
/>
```

**Props:**
- `product` (Object) - Objekat proizvoda
  - `id` (string) - Jedinstveni ID
  - `name` (string) - Naziv proizvoda
  - `price` (number) - Cena
  - `imageUrl` (string) - URL slike
  - `inStock` (boolean) - Dostupnost
- `onAddToCart` (Function) - Callback za dodavanje u korpu

---

### FeaturedSlider.jsx
**Namena:** Carousel slider za istaknute proizvode na home page-u.

**Karakteristike:**
- Auto-play funcionalnost
- Manual navigacija (arrows)
- Dot indicators
- Touch/Swipe support (mobile)
- Smooth transitions sa Framer Motion
- Responsive grid layout

**Korišćenje:**
```jsx
import FeaturedSlider from './components/FeaturedSlider';

<FeaturedSlider products={featuredProducts} />
```

**Props:**
- `products` (Array) - Niz proizvoda za prikaz

**Animacije:**
- Fade in/out između slajdova
- Parallax efekat na hover
- Smooth transitions

---

### Filters.jsx
**Namena:** Panel sa filterima za katalog proizvoda.

**Filteri:**
- Kategorije (Sport, Luksuzni, Casual, Smart)
- Cenovni opseg (slider)
- Brendovi (checkboxes)
- Dostupnost (In stock)
- Sortiranje (Cena, Naziv, Novo)

**Korišćenje:**
```jsx
import Filters from './components/Filters';

<Filters 
  filters={currentFilters}
  onFilterChange={handleFilterChange}
/>
```

**Props:**
- `filters` (Object) - Trenutni filter state
- `onFilterChange` (Function) - Callback za promenu filtera

---

## 🎨 UI Komponente

### SearchBar.jsx
**Namena:** Search input sa auto-complete funkcijom.

**Karakteristike:**
- Real-time pretraga
- Debounce za optimizaciju
- Autocomplete sugestije
- Keyboard navigation (arrow keys, enter)
- Clear button

**Korišćenje:**
```jsx
import SearchBar from './components/SearchBar';

<SearchBar 
  onSearch={handleSearch}
  placeholder="Pretraži proizvode..."
/>
```

---

### Pagination.jsx
**Namena:** Paginacija za liste proizvoda.

**Karakteristike:**
- Previous/Next buttons
- Page numbers
- Current page highlight
- Responsive design
- Ellipsis za mnogo stranica

**Korišćenje:**
```jsx
import Pagination from './components/Pagination';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

---

### ThemeSwitcher.jsx
**Namena:** Toggle dugme za prebacivanje između light/dark mode-a.

**Karakteristike:**
- Animated toggle
- Ikone (sun/moon)
- Persist u localStorage
- Smooth transition

**Korišćenje:**
```jsx
import ThemeSwitcher from './components/ThemeSwitcher';

<ThemeSwitcher />
```

---

### Breadcrumbs.jsx
**Namena:** Breadcrumb navigacija za trenutnu lokaciju.

**Korišćenje:**
```jsx
import Breadcrumbs from './components/Breadcrumbs';

<Breadcrumbs />
// Output: Home > Catalog > Product Name
```

---

### Carousel.jsx
**Namena:** Generički carousel component za multiple slike.

**Karakteristike:**
- Multiple images support
- Thumbnail navigation
- Full-screen mode
- Zoom funkcija
- Touch gestures

**Korišćenje:**
```jsx
import Carousel from './components/Carousel';

<Carousel images={productImages} />
```

---

## 📱 Layout Komponente

### NavBar.jsx
**Namena:** Glavna navigacija sa linkovima ka svim stranicama.

**Linkovi:**
- Home
- Catalog
- About
- Contact
- Admin (za admin korisnike)

---

### HamburgerMenu.jsx
**Namena:** Mobile navigacioni meni.

**Karakteristike:**
- Slide-in animacija
- Overlay
- Touch-friendly
- Close on route change

---

### BrandStrip.jsx
**Namena:** Horizontalna traka sa brendovima satova.

**Karakteristike:**
- Auto-scroll marquee
- Brand logos
- Hover pause

---

### TrustBar.jsx
**Namena:** Trust indicators (besplatna dostava, garancija, itd).

**Korišćenje:**
```jsx
import TrustBar from './components/TrustBar';

<TrustBar />
```

---

## 🔔 Modali

Svi modali su u poddirektorijumu `modals/`:

### FlashModal.jsx
**Namena:** Uspešni flash messages (npr. "Proizvod dodat u korpu").

**Karakteristike:**
- Auto-dismiss nakon 3 sekunde
- Success/Error/Info varijante
- Smooth fade in/out
- Multiple messages queue

**Korišćenje:**
```jsx
import FlashModal from './components/modals/FlashModal';
import { useFlash } from '../hooks/useFlash';

const { showFlash } = useFlash();

showFlash('Proizvod uspešno dodat!', 'success');
```

---

### ConfirmModal.jsx
**Namena:** Potvrda akcija (brisanje, odjava, itd).

**Karakteristike:**
- Potvrda/Otkaži dugmad
- Custom poruke
- Blocking overlay

**Korišćenje:**
```jsx
import ConfirmModal from './components/modals/ConfirmModal';

<ConfirmModal
  isOpen={isOpen}
  title="Potvrda brisanja"
  message="Da li ste sigurni?"
  onConfirm={handleDelete}
  onCancel={() => setIsOpen(false)}
/>
```

---

### ProductModal.jsx
**Namena:** Quick view modal za proizvod.

**Karakteristike:**
- Detalji proizvoda
- Image carousel
- Add to cart
- Close on overlay click

---

### UndoToast.jsx
**Namena:** Toast sa "Undo" opcijom za obrisane stavke.

**Karakteristike:**
- 5 sekundi timer
- Undo button
- Slide-in animacija

**Korišćenje:**
```jsx
import { useUndo } from '../hooks/useUndo';

const { addUndo } = useUndo();

addUndo({
  message: 'Proizvod uklonjen',
  action: () => restoreProduct(product)
});
```

---

## 🎬 About Stranica Komponente

Specijalizovane komponente za About page u `about/` poddirektorijumu:

### AboutHero.jsx
Hero sekcija sa glavnim naslovom i CTA.

### AboutStory.jsx
Priča o kompaniji sa timeline-om.

### AboutValues.jsx
Naše vrednosti sa ikonama.

### AboutStats.jsx
Statistika (broj proizvoda, zadovoljnih kupaca, itd).

### AboutTestimonials.jsx
Testimonials slider sa ocenama korisnika.

### AboutTimeline.jsx
Timeline istorije kompanije.

### AboutFAQ.jsx
Frequently Asked Questions accordion.

### AboutCTA.jsx
Call-to-action sekcija za kontakt.

### AboutInfoGlass.jsx
Glass-morphism info kartice.

### AboutMarquee.jsx
Animated marquee sa sloganima.

**Korišćenje:**
```jsx
import AboutHero from './components/about/AboutHero';
import AboutStory from './components/about/AboutStory';
// ... ostale komponente

function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutValues />
      {/* ... */}
    </>
  );
}
```

---

## 🎨 Scroll Komponente

### ScrollToTopOnMount.jsx
**Namena:** Automatski scroll na vrh stranice pri montiranju.

**Korišćenje:**
```jsx
import ScrollToTopOnMount from './components/ScrollToTopOnMount';

function MyPage() {
  return (
    <>
      <ScrollToTopOnMount />
      {/* Sadržaj stranice */}
    </>
  );
}
```

---

### SmoothScroll.jsx
**Namena:** Wrapper za Lenis smooth scrolling.

**Korišćenje:**
```jsx
import SmoothScroll from './components/SmoothScroll';

<SmoothScroll>
  <App />
</SmoothScroll>
```

---

## 🎮 3D Komponente

### Watch3DViewer.jsx
**Namena:** 3D prikaz satova korišćenjem Three.js.

**Karakteristike:**
- Rotacija sa mouse-om
- Zoom in/out
- Auto-rotate opcija
- Lighting controls

**Korišćenje:**
```jsx
import Watch3DViewer from './components/Watch3DViewer';

<Watch3DViewer modelUrl={productModelUrl} />
```

**Dependencies:**
- `three`
- `@react-three/fiber`
- `@react-three/drei`

---

## 📤 Upload Komponente

### UploadProgressBar.jsx
**Namena:** Progress bar za upload slika u admin panelu.

**Karakteristike:**
- Real-time progress
- File name display
- Cancel upload opcija

---

## 📐 Konvencije

### Imenovanje Fajlova
- **PascalCase** - `ProductCard.jsx`, `AuthModal.jsx`
- Svaka komponenta ima svoj `.jsx` i `.css` fajl

### Struktura Komponente
```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ComponentName.css';

// 2. PropTypes (optional)
import PropTypes from 'prop-types';

// 3. Component
export default function ComponentName({ prop1, prop2 }) {
  // Hooks
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // Logic
  };
  
  // Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}

// 4. PropTypes definition
ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.func,
};
```

### CSS Naming
- **BEM convention** - `.component__element--modifier`
- Primer: `.product-card__image--featured`

### Animacije
Sve animacije koriste Framer Motion:

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

## 🔗 Povezane Dokumentacije

- [Hooks](../hooks/README.md) - Custom React hooks
- [Context](../context/README.md) - Context providers
- [Services](../services/README.md) - API servisi
- [Pages](../pages/README.md) - Stranice aplikacije

## 💡 Best Practices

1. **Reusable** - Komponente treba da budu što više reusable
2. **Single Responsibility** - Jedna komponenta = jedna funkcionalnost
3. **Props Validation** - Uvek validiraj props sa PropTypes
4. **Accessibility** - Koristi semantic HTML i ARIA attributes
5. **Performance** - Koristi React.memo() za skupe komponente
6. **Error Boundaries** - Implementiraj error handling
7. **Loading States** - Prikazuj loading za async operacije

## 📝 Dodavanje Nove Komponente

1. Kreiraj `ComponentName.jsx` i `ComponentName.css`
2. Implementiraj komponentu sa clear props interface
3. Dodaj PropTypes validation
4. Dodaj JSDoc komentare
5. Testiraj na razl ičitim veličinama ekrana
6. Ažuriraj ovu dokumentaciju

---

**Poslednje ažuriranje:** Novembar 2025
