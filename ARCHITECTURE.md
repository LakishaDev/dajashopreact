# Arhitektura Projekta DajaShop

## Pregled
DajaShop je moderna React aplikacija za online prodavnicu satova, izgrađena sa Vite, React 19, Tailwind CSS i Framer Motion. Projekat koristi Firebase za autentifikaciju i skladištenje podataka.

## Struktura Projekta

```
dajashopreact/
├── public/              # Statički resursi (slike, ikone)
├── src/                 # Izvorni kod aplikacije
│   ├── assets/         # Lokalni resursi (slike, fontovi)
│   ├── components/     # Komponente za ponovno korišćenje
│   ├── config/         # Konfiguracioni fajlovi
│   ├── context/        # React Context provideri
│   ├── data/           # Statički podaci i mock data
│   ├── hooks/          # Custom React hooks
│   ├── models/         # TypeScript tipovi i interfejsi
│   ├── pages/          # Stranice aplikacije (rute)
│   ├── services/       # API servisi i integracije
│   ├── styles/         # Globalni stilovi
│   └── utils/          # Pomoćne funkcije
├── .env                # Lokalne env varijable (NE COMMIT-uje se)
├── vite.config.js      # Vite konfiguracija
└── package.json        # Zavisnosti i skripte
```

## Direktorijumi u Detalje

### `/src/assets`
**Namena:** Lokalni medijski resursi (slike, SVG, fontovi) koji se import-uju direktno u JavaScript kod.

**Konvencije:**
- Organizuj po tipovima: `images/`, `icons/`, `fonts/`
- Koristi deskriptivna imena fajlova
- Optimizuj slike pre commit-a

### `/src/components`
**Namena:** Ponovo upotrebljive React komponente koje se koriste širom aplikacije.

**Struktura:**
- Svaka komponenta ima `.jsx` fajl i odgovarajući `.css` fajl
- Komponente su zasnovane na funkcijama (function components)
- Koristi PropTypes ili TypeScript za type checking

**Ključne Komponente:**
- `AuthModal.jsx` - Modal za prijavu/registraciju
- `FeaturedSlider.jsx` - Slider za istaknute proizvode
- `Header.jsx` - Glavni navigacioni header
- `Footer.jsx` - Footer sa kontakt informacijama
- `Carousel.jsx` - Generički carousel component
- `ProductCard.jsx` - Kartica proizvoda
- `Filters.jsx` - Filter komponenta za katalog

**Animacije:**
- Sve animacije koriste Framer Motion
- `AnimatePresence` se koristi za mount/unmount animacije
- VAŽNO: Ne koristite `mode="wait"` kada imate više animiranih elemenata istovremeno
- Koristite `initial={false}` za AnimatePresence kada ne želite inicijalne animacije

### `/src/config`
**Namena:** Centralizovane konfiguracione konstante i podešavanja.

**Sadržaj:**
- API endpoints
- Konstante aplikacije
- Feature flags
- Konfiguracioni objekti za različite okruženja

### `/src/context`
**Namena:** React Context API provideri za globalno stanje.

**Primeri:**
- `CartContext` - Upravlja korpicom za kupovinu
- `AuthContext` - Upravlja autentifikacijom korisnika
- `ThemeContext` - Upravlja temama i dark mode

**Best Practices:**
- Jedan Context po domenu/feature-u
- Koristite custom hooks za pristup kontekstu (`useCart`, `useAuth`)
- Držite Context providere u odvojenim fajlovima

### `/src/data`
**Namena:** Statički podaci, mock data, i konstante.

**Primeri:**
- Kategorije proizvoda
- Mock podaci za development
- Navigation stavke
- Statički tekstualni sadržaj

### `/src/hooks`
**Namena:** Custom React hooks za ponovno korišćenje logike.

**Ključni Hooks:**
- `useCart.js` - Hook za upravljanje korpicom
- `useAuth.js` - Hook za autentifikaciju
- `useLocalStorage.js` - Hook za localStorage
- `useDebounce.js` - Hook za debounce funkcionalnost

**Best Practices:**
- Prefix svih hook-ova sa `use`
- Dokumentuj parametre i povratne vrednosti
- Testiraj hookove nezavisno

### `/src/models`
**Namena:** TypeScript definicije tipova, interfejsi, i data modeli.

**Primeri:**
- `Product.ts` - Model proizvoda
- `User.ts` - Model korisnika
- `Order.ts` - Model porudžbine

### `/src/pages`
**Namena:** Komponente stranica povezane sa rutama.

**Ključne Stranice:**
- `Home.jsx` - Početna stranica
- `Catalog.jsx` - Katalog proizvoda
- `Product.jsx` - Detalji proizvoda
- `Cart.jsx` - Korpa
- `Checkout.jsx` - Plaćanje
- `Account.jsx` - Korisnički nalog
- `Orders.jsx` - Istorija porudžbina

**Struktura:**
```jsx
// Svaka stranica prati ovaj obrazac
import React from "react";
import "./PageName.css";

export default function PageName() {
  return (
    <div className="page-name">
      {/* Sadržaj stranice */}
    </div>
  );
}
```

### `/src/services`
**Namena:** Servisi za eksterne API-je i integracije.

**Ključni Servisi:**
- `firebase.js` - Firebase konfiguracija i inicijalizacija
  - Auth (Google, Facebook, Email/Password, Phone)
  - Firestore database
  - Storage
  - Analytics
  - App Check
- `CatalogService.js` - Servis za proizvode i katalog

**Best Practices:**
- Svi API pozivi idu kroz servise
- Koristi async/await za asinhrone operacije
- Implementuj error handling
- Dodaj loading states

### `/src/styles`
**Namena:** Globalni stilovi, CSS promenljive, i Tailwind konfiguracija.

**Sadržaj:**
- Globalne CSS promenljive
- Reset i normalize stilovi
- Utility klase
- Tipografija
- Boje i teme

### `/src/utils`
**Namena:** Pomoćne funkcije i utility metode.

**Primeri:**
- `currency.js` - Formatiranje cena
- `validation.js` - Validacione funkcije
- `date.js` - Manipulacija datumima
- `string.js` - String pomocne funkcije

**Best Practices:**
- Pure funkcije kada je moguće
- Dokumentuj funkcije JSDoc komentarima
- Testuj edge cases

## Tehnološki Stack

### Core
- **React 19.2.0** - UI framework
- **Vite 7.2.2** - Build tool i dev server
- **React Router DOM 7.9.5** - Rutiranje

### Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- Custom CSS za specifične komponente

### Animacije
- **Framer Motion 12.23.24** - Deklarativne animacije
  - `motion` komponente za animacije
  - `AnimatePresence` za mount/unmount animacije
  - Layout animacije sa `layout` prop

### Backend & Auth
- **Firebase 12.5.0**
  - Authentication (Google, Facebook, Email, Phone)
  - Firestore (NoSQL database)
  - Storage (fajlovi i slike)
  - Analytics
  - App Check (security)

### Icons & UI
- **Lucide React 0.553.0** - Ikone

## Animacije - Best Practices

### Framer Motion Patterns

#### 1. Jednostavne Motion Komponente
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### 2. AnimatePresence za条件alno Renderovanje
```jsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

#### 3. List Animacije
```jsx
<AnimatePresence initial={false}>
  {items.map((item) => (
    <motion.div
      key={item.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

#### 4. VAŽNO: Multiple Children sa AnimatePresence
❌ **POGREŠNO** - Korišćenje `mode="wait"` sa više dece:
```jsx
<AnimatePresence mode="wait">
  <motion.div key="a">Child 1</motion.div>
  <motion.div key="b">Child 2</motion.div>
</AnimatePresence>
```

✅ **ISPRAVNO** - Bez `mode="wait"` ili sa jednim child-om:
```jsx
<AnimatePresence initial={false}>
  <motion.div key="a">Child 1</motion.div>
  <motion.div key="b">Child 2</motion.div>
</AnimatePresence>
```

### Performance Optimizacije
- Koristi `layout` prop za automatske layout animacije
- Animiraj `transform` i `opacity` za najbolje performanse
- Koristi `will-change` CSS property oprezno
- Koristi `useReducedMotion` hook za accessibility

## Autentifikacija

### Podržani Metodi
1. **Email/Password** - Standardna registracija
2. **Google OAuth** - Prijava preko Google naloga
3. **Facebook OAuth** - Prijava preko Facebook naloga
4. **Phone (SMS)** - Verifikacija telefonskim brojem

### Flow
1. Korisnik klikne "Prijavi se" / "Registruj se"
2. Otvori se `AuthModal` komponenta
3. Korisnik bira metod autentifikacije
4. Nakon uspešne autentifikacije, modal se zatvara
5. Korisničke informacije se čuvaju u `AuthContext`

## Environment Varijable

Kreiraj `.env` fajl u root direktorijumu:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# reCAPTCHA
VITE_FIREBASE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Admin Emails (comma separated)
VITE_ADMIN_EMAILS=admin@example.com,another@example.com
```

**NAPOMENA:** `.env` fajl ne treba commit-ovati u Git!

## Development

### Pokretanje Dev Servera
```bash
npm install
npm run dev
```

### Linting
```bash
npm run lint
```

### Build za Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Git Workflow

### Branch Naming
- `feature/ime-feature-a` - Nove funkcionalnosti
- `fix/ime-bug-a` - Ispravke bugova
- `hotfix/ime` - Hitne ispravke
- `refactor/ime` - Refaktorisanje koda

### Commit Messages
Koristi deskriptivne commit poruke:
```
feat: Dodaj filter za cene u katalogu
fix: Ispravi AnimatePresence warning u FeaturedSlider
refactor: Optimizuj cart context za bolje performanse
docs: Ažuriraj arhitekturnu dokumentaciju
```

## Testing

### Trenutno Stanje
Projekat trenutno nema automatizovane testove.

### Preporuke za Buduće Testiranje
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright ili Cypress
- **Coverage:** Minimum 70% code coverage

## Performance

### Best Practices
- Koristi lazy loading za stranice (`React.lazy()`)
- Optimizuj slike (WebP format, responsive images)
- Code splitting za velike bundle-ove
- Memorize komponente sa `React.memo()` kada je potrebno
- Koristi `useMemo` i `useCallback` za skupe operacije

### Bundle Size
Trenutna veličina bundle-a: ~785 kB (247 kB gzipped)

**Optimizacije:**
- Razmotri dynamic import za Firebase servise
- Code split po rutama
- Tree shake nekorišćeni Tailwind CSS

## Accessibility

### Standardi
- Semantički HTML
- ARIA labels gde je potrebno
- Keyboard navigation support
- Focus management
- Alt text za slike

### Testing
- Koristi browser extensions (axe DevTools)
- Test sa screen reader-ima
- Testiranje sa tastaturom

## Deployment

### Production Build
```bash
npm run build
```

Build kreira `dist/` direktorijum sa optimizovanim fajlovima.

### Hosting Opcije
- Vercel (preporučeno za Vite projekte)
- Netlify
- Firebase Hosting
- AWS S3 + CloudFront

### Environment Variables
Postavi env varijable na hosting platformi kroz dashboard ili CLI.

## Troubleshooting

### Česte Greške

**AnimatePresence Warning**
```
Warning: Multiple children were passed to AnimatePresence with mode="wait"
```
**Rešenje:** Ukloni `mode="wait"` ili koristi samo jedan child.

**Firebase Auth Error**
```
Firebase: Error (auth/invalid-api-key)
```
**Rešenje:** Proveri `.env` fajl i osiguraj da su sve Firebase varijable postavljene.

**Build Chunk Size Warning**
```
Some chunks are larger than 500 kB after minification
```
**Rešenje:** Implementuj code splitting sa dynamic imports.

## Kontakt i Podrška

Za pitanja i podršku:
- Email: cvelenis42@yahoo.com
- Tel: 064/1262425, 065/2408400
- Lokacija: Niš, TPC Gorča lokal C31

## Licenca

Projekat je vlasništvo DajaShop. Sva prava zadržana.

---

**Poslednje ažuriranje:** Novembar 2025
**Verzija:** 1.0.0
