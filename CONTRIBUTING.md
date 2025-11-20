# Vodič za Doprinos DajaShop Projektu

Hvala što razmatrate doprinos DajaShop projektu! Ovaj dokument sadrži smernice i best practices za doprinošenje projektu.

## 📋 Sadržaj

- [Kodeks Ponašanja](#kodeks-ponašanja)
- [Kako Mogu Da Doprinesem](#kako-mogu-da-doprinesem)
- [Razvojna Podešavanja](#razvojna-podešavanja)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Proces](#pull-request-proces)
- [Testiranje](#testiranje)
- [Dokumentacija](#dokumentacija)

## 🤝 Kodeks Ponašanja

Učestvujući u ovom projektu, očekuje se da održavate profesionalnost i poštovanje prema svim učesnicima.

### Naša Očekivanja

- Koristite prijatan i inkluzivan jezik
- Budite poštovani prema različitim gledištima i iskustvima
- Prihvatite konstruktivnu kritiku sa razumevanjem
- Fokusirajte se na ono što je najbolje za zajednicu

## 💡 Kako Mogu Da Doprinesem

### Prijavljivanje Bugova

Pre prijavljivanja buga:
1. Proverite da bug nije već prijavljen u Issues sekciji
2. Proverite da li problem postoji u najnovijoj verziji

Kada prijavljujete bug, uključite:
- **Deskriptivan naslov**
- **Koraci za reprodukciju** - Detaljni koraci za reprodukovanje problema
- **Očekivano ponašanje** - Šta ste očekivali da se desi
- **Stvarno ponašanje** - Šta se stvarno dogodilo
- **Screenshots** (ako je primenljivo)
- **Okruženje** - Browser, OS verzija, Node verzija

**Primer:**

```markdown
**Bug:** Header se ne prikazuje ispravno na mobilnim uređajima

**Koraci za reprodukciju:**
1. Otvorite sajt na mobilnom uređaju (iPhone 12, Safari)
2. Kliknite na hamburger menu
3. Primetite da se meni ne otvara

**Očekivano:** Menu se otvara sa animacijom
**Stvarno:** Ništa se ne dešava

**Screenshot:** [priložen]
**Okruženje:** iOS 15, Safari 15.0
```

### Predlaganje Novih Funkcionalnosti

Pre predlaganja nove funkcionalnosti:
1. Proverite da već nije predložena
2. Razmislite da li se uklapa u scope projekta

Kada predlažete funkcionalnost, uključite:
- **Jasno i deskriptivno objašnjenje**
- **Use case** - Zašto je ova funkcionalnost korisna
- **Mogući pristup implementaciji**
- **Alternativna rešenja** koja ste razmatrali

### Pull Requests

1. Fork-ujte repozitorijum
2. Kreirajte feature branch
3. Napravite promene
4. Testirajte promene
5. Commit-ujte sa jasnim porukama
6. Push-ujte u vaš fork
7. Otvorite Pull Request

## 🛠️ Razvojna Podešavanja

Pratite korake u [SETUP.md](./SETUP.md) za podešavanje razvojnog okruženja.

### Dodatni Alati za Razvoj

**React Developer Tools**
```bash
# Chrome
https://chrome.google.com/webstore/detail/react-developer-tools/

# Firefox
https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

**Firebase Emulator Suite** (opcionalno, za lokalno testiranje)
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

## 🔄 Git Workflow

### Branch Naming Convention

Koristite sledeći format za imenovanje branch-eva:

```
<tip>/<kratak-opis>

Tipovi:
- feature/  - Nova funkcionalnost
- fix/      - Bug fix
- hotfix/   - Hitna ispravka u produkciji
- refactor/ - Refaktorisanje koda
- docs/     - Izmene dokumentacije
- style/    - Formatiranje, styling (ne menja funkcionalnost)
- test/     - Dodavanje ili ispravljanje testova
- chore/    - Održavanje, build changes
```

**Primeri:**

```bash
feature/add-wishlist
fix/cart-calculation-bug
refactor/optimize-product-loading
docs/update-setup-guide
```

### Commit Message Convention

Koristimo [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<tip>(<scope>): <opis>

[opcionalno telo]

[opcionalni footer]
```

**Tipovi commit-a:**

- `feat` - Nova funkcionalnost
- `fix` - Bug fix
- `docs` - Izmena dokumentacije
- `style` - Formatiranje koda, beline, itd.
- `refactor` - Refaktorisanje bez promene funkcionalnosti
- `perf` - Performance poboljšanje
- `test` - Dodavanje testova
- `chore` - Build proces, alati, zavisnosti

**Primeri:**

```bash
feat(cart): dodaj mogućnost primene promo koda
fix(auth): ispravi Google OAuth redirect problem
docs(readme): ažuriraj setup instrukcije
refactor(product-card): optimizuj renderovanje slika
perf(catalog): implementiraj lazy loading za proizvode
```

**Good Commit Messages:**

```
✅ feat(checkout): dodaj validaciju za email adresu
✅ fix(header): ispravi responsive ponašanje na tablet uređajima
✅ refactor(cart): prebaci logiku u custom hook useCart
```

**Bad Commit Messages:**

```
❌ update stuff
❌ fix bug
❌ changes
❌ WIP
```

### Branching Strategy

```
main (production)
  ↓
develop (development)
  ↓
feature/nova-funkcionalnost
fix/popravka-buga
```

**Workflow:**

1. Kreirajte branch iz `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/naziv-funkcionalnosti
```

2. Razvijajte i commit-ujte promene:
```bash
git add .
git commit -m "feat(scope): opis izmene"
```

3. Držite branch ažurnim sa `develop`:
```bash
git checkout develop
git pull origin develop
git checkout feature/naziv-funkcionalnosti
git merge develop
```

4. Push-ujte na remote:
```bash
git push origin feature/naziv-funkcionalnosti
```

5. Otvorite Pull Request u `develop` branch

## 💻 Coding Standards

### JavaScript/React Standards

#### 1. Stilovi Kodiranja

- **Indent:** 2 spaces (ne tabovi)
- **Quotes:** Single quotes za strings
- **Semicolons:** Koristite semicolons na kraju statement-a
- **Line Length:** Maximum 100 karaktera

#### 2. React Component Standards

**Funkcionalne Komponente:**

```jsx
// ✅ Dobro
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Komponenta za prikaz kartice proizvoda
 * @param {Object} product - Objekat proizvoda
 * @param {Function} onAddToCart - Callback za dodavanje u korpu
 */
export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      {/* Sadržaj komponente */}
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
};
```

**Hooks:**

```jsx
// ✅ Organizacija hooks-a na vrhu komponente
function MyComponent() {
  // 1. State hooks
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. Context hooks
  const { user } = useAuth();
  const { items } = useCart();
  
  // 3. Ref hooks
  const inputRef = useRef(null);
  
  // 4. Effect hooks
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  // 5. Custom hooks
  const products = useProducts();
  
  // 6. Event handlers
  const handleClick = () => {
    // logic
  };
  
  // 7. Render
  return <div>...</div>;
}
```

#### 3. Imenovanje Konvencija

**Komponente:**

```jsx
// PascalCase za komponente
ProductCard.jsx
UserProfile.jsx
ShoppingCart.jsx
```

**Funkcije i Varijable:**

```javascript
// camelCase za funkcije i varijable
const userName = 'John';
function calculateTotal() {}
const handleSubmit = () => {};
```

**Konstante:**

```javascript
// UPPER_SNAKE_CASE za konstante
const API_BASE_URL = 'https://api.example.com';
const MAX_CART_ITEMS = 50;
```

**Hooks:**

```javascript
// Prefix 'use' za custom hooks
useAuth.js
useCart.js
useFormValidation.js
```

#### 4. File Organization

```jsx
// 1. Imports - grupisani po tipu
// React imports
import React, { useState, useEffect } from 'react';

// External dependencies
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

// Internal components
import Header from './components/Header';
import Footer from './components/Footer';

// Contexts
import { useAuth } from './context/AuthContext';

// Services
import { fetchProducts } from './services/products';

// Utilities
import { formatCurrency } from './utils/currency';

// Styles
import './MyComponent.css';

// 2. Constants (ako postoje)
const ITEMS_PER_PAGE = 12;

// 3. Component definition
export default function MyComponent() {
  // Component code
}
```

### CSS/Tailwind Standards

#### 1. Tailwind Classes

```jsx
// ✅ Dobro - Organizovane klase
<div className="flex flex-col items-center justify-center gap-4 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// ❌ Loše - Nasumične klase
<div className="p-6 bg-white flex rounded-lg gap-4 shadow-md items-center hover:shadow-lg flex-col transition-shadow justify-center">
```

**Redosled Tailwind klasa:**

1. Layout (display, position, flex, grid)
2. Spacing (margin, padding)
3. Sizing (width, height)
4. Typography (font, text)
5. Backgrounds & Borders
6. Effects (shadow, opacity)
7. Transitions & Animations
8. Interactivity (hover, focus, active)

#### 2. Custom CSS

Koristi custom CSS samo kada Tailwind nije dovoljan:

```css
/* ✅ Dobro - Specifične potrebe */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

/* ❌ Loše - Može se postići sa Tailwind */
.margin-top-4 {
  margin-top: 1rem;
}
```

### Komentari i Dokumentacija

```jsx
/**
 * Kreira formatirani prikaz cene
 * 
 * @param {number} amount - Iznos u dinarima
 * @param {boolean} includeSymbol - Da li uključiti RSD simbol
 * @returns {string} Formatirana cena
 * 
 * @example
 * formatCurrency(15000) // "15.000 RSD"
 * formatCurrency(15000, false) // "15.000"
 */
export function formatCurrency(amount, includeSymbol = true) {
  // Implementation
}
```

```jsx
// Single-line komentari za objašnjenje specifične logike
const discountedPrice = originalPrice * 0.9; // 10% popust
```

### Performance Best Practices

1. **Memoizacija:**

```jsx
// Memoizuj skupe kalkulacije
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Memoizuj callback funkcije
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoizuj komponente
const MemoizedComponent = React.memo(MyComponent);
```

2. **Lazy Loading:**

```jsx
// Lazy load stranice
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));

<Suspense fallback={<Loading />}>
  <AdminDashboard />
</Suspense>
```

3. **Image Optimization:**

```jsx
// Koristi srcSet za responsive images
<img 
  src="image-800w.jpg" 
  srcSet="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Product"
  loading="lazy"
/>
```

## 🧪 Testiranje

### Pre Submit-ovanja Pull Request-a

1. **Linting:**
```bash
npm run lint
```

2. **Build:**
```bash
npm run build
```

3. **Manuelno Testiranje:**
   - Testirajte funkcionalnost u dev mode-u
   - Testirajte na različitim browser-ima (Chrome, Firefox, Safari)
   - Testirajte na različitim veličinama ekrana (desktop, tablet, mobile)

### Testiranje Različitih Scenario

- Autentifikacija (prijava, odjava, registracija)
- Cart funkcionalnost (dodavanje, uklanjanje, ažuriranje količina)
- Checkout proces
- Admin panel (ako je primenljivo)
- Error handling

## 📚 Dokumentacija

### Kada Ažurirati Dokumentaciju

Ažurirajte dokumentaciju kada:
- Dodajete novu funkcionalnost
- Menjate postojeće API-je ili interfejse
- Dodajete nove environment varijable
- Menjate build ili deployment proces

### Dokumentacioni Fajlovi

- **README.md** - Pregled projekta i quick start
- **ARCHITECTURE.md** - Arhitektura projekta
- **SETUP.md** - Detaljna setup instrukcija
- **CONTRIBUTING.md** - Ovaj fajl
- **src/*/README.md** - Dokumentacija za specifične direktorijume

### Komentari u Kodu

```jsx
// ✅ Dobri komentari - Objašnjavaju ZAŠTO
// Koristimo setTimeout da izbegnemo race condition sa Firebase Auth
setTimeout(() => {
  checkAuthState();
}, 100);

// ❌ Loši komentari - Objašnjavaju ŠTA (očigledno iz koda)
// Setuj count na 0
setCount(0);
```

## 🔍 Pull Request Proces

### Pre Otvaranja PR-a

**Checklist:**

- [ ] Kod je testiran lokalno
- [ ] Lint proverava bez grešaka
- [ ] Build prođe bez grešaka
- [ ] Commit poruke prate konvenciju
- [ ] Branch je ažuran sa `develop`
- [ ] Dokumentacija je ažurirana
- [ ] Nema console.log ili debug koda
- [ ] Screenshots su dodati (za UI promene)

### Pisanje PR Description

**Template:**

```markdown
## Opis

Kratko opišite šta ovaj PR radi.

## Tip Promene

- [ ] Bug fix (non-breaking change koji ispravlja problem)
- [ ] Nova funkcionalnost (non-breaking change koji dodaje funkcionalnost)
- [ ] Breaking change (fix ili feature koji bi mogao poremetiti postojeću funkcionalnost)
- [ ] Dokumentacija

## Kako Je Ovo Testirano?

Opišite testove koje ste izvršili:
1. 
2. 
3. 

## Screenshots (ako je primenljivo)

Dodajte screenshots koji pokazuju promene.

## Checklist

- [ ] Moj kod prati style guidelines ovog projekta
- [ ] Izvršio sam self-review svog koda
- [ ] Komentarisao sam kod, posebno u teškim delovima
- [ ] Napravio sam odgovarajuće izmene u dokumentaciji
- [ ] Moje promene ne generišu nova upozorenja
- [ ] Testirao sam na različitim browser-ima i veličinama ekrana
```

### Code Review Proces

1. Drugi developeri će pregledati vaš kod
2. Možda će biti tražene izmene
3. Napravite tražene izmene i push-ujte
4. Kada je PR odobren, biće merge-ovan u `develop`

**Budi otvorena uma tokom review-a - svi smo tu da učimo!**

## ❓ Pitanja?

Ako imate bilo kakva pitanja, slobodno:

- Otvorite Issue sa labelom "question"
- Kontaktirajte maintainer-e
- Pošaljite email na cvelenis42@yahoo.com

## 📞 Kontakt

- 📧 Email: cvelenis42@yahoo.com
- 📱 Tel: 064/1262425, 065/2408400
- 📍 Lokacija: Niš, TPC Gorča lokal C31

---

**Hvala vam što doprinosite DajaShop projektu! 🎉**

Svaki doprinos, ma koliko mali, je cenjen i pomaže da projekat bude bolji.
