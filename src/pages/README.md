# Pages - Stranice Aplikacije

Komponente stranica koje predstavljaju različite rute u aplikaciji.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Javne Stranice](#javne-stranice)
- [Korisničke Stranice](#korisničke-stranice)
- [Admin Stranice](#admin-stranice)
- [Best Practices](#best-practices)

## 🎯 Pregled

Pages direktorijum sadrži komponente za svaku rutu u aplikaciji. Svaka stranica:
- **Ima svoju rutu** u `router.jsx`
- **Kompletna stranica** sa svim sekcijama
- **Importuje komponente** iz `src/components/`
- **Koristi hooks** za logiku i state
- **Ima svoj CSS fajl** za page-specific stilove

## 🏠 Javne Stranice

### Home.jsx

**Ruta:** `/`

**Namena:** Početna stranica aplikacije.

**Sekcije:**
- **Hero** - Glavni banner sa carousel slajderom brendova
- **Featured Products** - Istaknuti proizvodi
- **Brand Strip** - Traka sa logotipima brendova
- **Trust Bar** - Trust indicators (besplatna dostava, garancija)
- **CTA Section** - Call-to-action za katalog

**Korišćene Komponente:**
- `HeroBgSlider` - Background image slider
- `FeaturedSlider` - Slider za featured products
- `BrandStrip` - Brendovi
- `TrustBar` - Trust indicators
- `Carousel` - Generički carousel

**Hooks:**
- `useProducts()` - Za featured products

**Primer:**
```jsx
import Home from './pages/Home';

// U router.jsx
<Route path="/" element={<Home />} />
```

---

### Catalog.jsx

**Ruta:** `/catalog`

**Namena:** Katalog svih proizvoda sa filterima i pretraživanjem.

**Funkcionalnosti:**
- Prikaz svih proizvoda u grid formatu
- **Filteri:**
  - Kategorije (Sport, Luksuzni, Casual, Smart)
  - Brendovi (Casio, Seiko, Citizen, itd.)
  - Cenovni opseg
  - Dostupnost (in stock)
- **Sortiranje:**
  - Po ceni (asc/desc)
  - Po imenu
  - Novo prvo
- **Search** - Pretraga po nazivu
- **Paginacija** - Po 12 proizvoda po strani

**Korišćene Komponente:**
- `Filters` / `FilterDrawer` - Filter panel
- `ProductCard` - Kartica proizvoda
- `ProductGrid` - Grid layout
- `Pagination` - Paginacija
- `Breadcrumbs` - Navigaciona putanja

**Hooks:**
- `useProducts()` - Lista proizvoda sa filterima
- `useSearchParams()` - URL query params za filtere

**Query Parametri:**
```
/catalog?category=sport&brand=CASIO&minPrice=0&maxPrice=50000&sort=price&order=asc
```

---

### Products.jsx (Product Detail)

**Ruta:** `/product/:id`

**Namena:** Detaljan prikaz pojedinačnog proizvoda.

**Sekcije:**
- **Image Gallery** - Carousel sa slikama proizvoda
- **Product Info** - Naziv, brend, cena, opis
- **Features** - Lista karakteristika
- **Add to Cart** - Dugme za dodavanje u korpu
- **Related Products** - Slični proizvodi

**Korišćene Komponente:**
- `Carousel` - Gallery slika
- `Watch3DViewer` - 3D prikaz (opcionalno)
- `ProductCard` - Za related products
- `Breadcrumbs` - Navigacija

**Hooks:**
- `useProduct(id)` - Učitava proizvod
- `useCart()` - Dodavanje u korpu
- `useParams()` - ID iz URL-a

**Primer:**
```jsx
function ProductPage() {
  const { id } = useParams();
  const { product, loading, error } = useProduct(id);
  const { addItem } = useCart();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div className="product-page">
      <Carousel images={product.images} />
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">{formatPrice(product.price)}</p>
        <button onClick={() => addItem(product, 1)}>
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}
```

---

### About.jsx

**Ruta:** `/about`

**Namena:** O nama stranica sa informacijama o kompaniji.

**Sekcije:**
- **Hero** - Glavni naslov i misija
- **Story** - Priča o kompaniji
- **Values** - Naše vrednosti
- **Stats** - Statistika (broj proizvoda, zadovoljnih kupaca)
- **Timeline** - Istorija kompanije
- **Testimonials** - Korisničke recenzije
- **FAQ** - Često postavljana pitanja
- **CTA** - Kontakt i poziv na akciju

**Korišćene Komponente:**
- `AboutHero`
- `AboutStory`
- `AboutValues`
- `AboutStats`
- `AboutTimeline`
- `AboutTestimonials`
- `AboutFAQ`
- `AboutCTA`

**Note:** Sve about komponente su u `src/components/about/` direktorijumu.

---

## 🛒 Korisničke Stranice

### Cart.jsx

**Ruta:** `/cart`

**Namena:** Shopping cart sa svim proizvodima i opcijama.

**Funkcionalnosti:**
- Prikaz svih stavki u korpi
- **Quantity controls** - +/- dugmad za količinu
- **Remove item** - Uklanjanje proizvoda (sa undo opcijom)
- **Promo code** - Primena promo kodova
- **Total calculation** - Ukupna cena, popust, finalna cena
- **Checkout button** - Prelazak na checkout

**Korišćene Komponente:**
- `UndoToast` - Za undo funkcionalnost
- `FlashModal` - Success/error poruke

**Hooks:**
- `useCart()` - Cart state i funkcije
- `usePromo()` - Promo kodovi
- `useFlash()` - Flash messages

**Primer:**
```jsx
function CartPage() {
  const { cart, total, removeItem, updateQty } = useCart();
  const { appliedPromo, validateAndApply } = usePromo();
  
  const finalTotal = appliedPromo 
    ? total - appliedPromo.amount 
    : total;
  
  return (
    <div className="cart-page">
      {cart.map(item => (
        <CartItem 
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
          onUpdateQty={(qty) => updateQty(item.id, qty)}
        />
      ))}
      
      <PromoCodeInput onApply={validateAndApply} />
      
      <div className="cart-summary">
        <p>Ukupno: {formatPrice(total)}</p>
        {appliedPromo && (
          <p>Popust: -{formatPrice(appliedPromo.amount)}</p>
        )}
        <p className="final">Finalno: {formatPrice(finalTotal)}</p>
        
        <Link to="/checkout">
          <button>Plaćanje</button>
        </Link>
      </div>
    </div>
  );
}
```

---

### Checkout.jsx

**Ruta:** `/checkout`

**Auth:** Zahteva prijavu

**Namena:** Multi-step checkout proces.

**Koraci:**
1. **Shipping Info** - Adresa, telefon, ime
2. **Payment Method** - Način plaćanja
3. **Review** - Pregled porudžbine
4. **Confirmation** - Potvrda

**Validacija:**
- Email format
- Phone format
- Required fields

**Korišćene Komponente:**
- `ConfirmModal` - Potvrda porudžbine

**Hooks:**
- `useCart()` - Cart podaci
- `useAuth()` - Korisnik
- `useFormValidator()` - Validacija forme
- `useFlash()` - Success message

**Primer:**
```jsx
function CheckoutPage() {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const { formData, errors, handleChange, validateAll } = useFormValidator({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAll()) {
      return showFlash('Molimo popunite sva polja ispravno', 'error');
    }
    
    const order = {
      userId: user.uid,
      items: cart,
      total,
      shippingInfo: formData,
      createdAt: new Date().toISOString()
    };
    
    await createOrder(order);
    clearCart();
    navigate('/orders');
    showFlash('Porudžbina uspešno kreirana!', 'success');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Forma... */}
    </form>
  );
}
```

---

### Account.jsx

**Ruta:** `/account`

**Auth:** Zahteva prijavu

**Namena:** Korisnički profil i podešavanja.

**Sekcije:**
- **Profile Info** - Ime, email, profilna slika
- **Edit Profile** - Izmena podataka
- **Change Password** - Promena lozinke
- **Email Verification** - Status verifikacije

**Korišćene Komponente:**
- `UploadProgressBar` - Za upload profilne slike

**Hooks:**
- `useAuth()` - Korisnik i funkcije

---

### Orders.jsx

**Ruta:** `/orders`

**Auth:** Zahteva prijavu

**Namena:** Istorija porudžbina korisnika.

**Funkcionalnosti:**
- Lista svih porudžbina
- Status svake porudžbine
- Detalji porudžbine
- Ukupan iznos
- Datum kreiranja

**Hooks:**
- `useAuth()` - User ID
- Custom hook za fetching orders

---

### VerifyEmail.jsx

**Ruta:** `/verify-email`

**Namena:** Stranica nakon slanja verification email-a.

**Funkcionalnosti:**
- Poruka o uspešnom slanju email-a
- "Resend" dugme
- Povratak na home

---

## 🔐 Admin Stranice

### AdminDashboard.jsx

**Ruta:** `/admin`

**Auth:** Zahteva admin pristup

**Lokacija:** `src/pages/Admin/AdminDashboard.jsx`

**Namena:** Admin panel za upravljanje proizvodima i porudžbinama.

**Funkcionalnosti:**
- **CRUD za proizvode:**
  - Dodavanje novog proizvoda
  - Izmena postojećeg
  - Brisanje proizvoda
  - Upload slika
- **Upravljanje porudžbinama:**
  - Lista svih porudžbina
  - Promena statusa
  - Pregled detalja
- **Statistika:**
  - Ukupan broj proizvoda
  - Broj porudžbina
  - Prihod

**Korišćene Komponente:**
- `AdminProductModal` - Modal za dodavanje/izmenu proizvoda
- `ManageList` - Lista proizvoda/porudžbina
- `UploadProgressBar` - Progress bar za upload

**Hooks:**
- `useAuth()` - Provera admin pristupa
- Custom hooks za products/orders

**Admin Check:**
```jsx
import { ADMIN_EMAILS } from '../services/firebase';

function AdminDashboard() {
  const { user } = useAuth();
  
  // Proveri da li je korisnik admin
  const isAdmin = ADMIN_EMAILS.includes(user?.email);
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="admin-dashboard">
      {/* Admin content... */}
    </div>
  );
}
```

---

## 📐 Best Practices

### 1. Struktura Stranice

```jsx
import React from 'react';
import './PageName.css';
// Import komponenti i hooks

export default function PageName() {
  // Hooks na vrhu
  const { data, loading, error } = useData();
  
  // Loading state
  if (loading) return <LoadingSpinner />;
  
  // Error state
  if (error) return <ErrorMessage message={error} />;
  
  // Main content
  return (
    <div className="page-name">
      <ScrollToTopOnMount />
      <Breadcrumbs />
      
      <section className="section-1">
        {/* Content */}
      </section>
      
      <section className="section-2">
        {/* Content */}
      </section>
    </div>
  );
}
```

### 2. Protected Routes

```jsx
// U router.jsx
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <Account />
    </ProtectedRoute>
  }
/>

// ProtectedRoute komponenta
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
}
```

### 3. SEO Meta Tags

```jsx
import { Helmet } from 'react-helmet-async';

function ProductPage({ product }) {
  return (
    <>
      <Helmet>
        <title>{product.name} - DajaShop</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={product.imageUrl} />
      </Helmet>
      
      <div className="product-page">
        {/* Content */}
      </div>
    </>
  );
}
```

### 4. Scroll Restoration

```jsx
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';

function MyPage() {
  return (
    <div>
      <ScrollToTopOnMount />
      {/* Content */}
    </div>
  );
}
```

### 5. Error Boundaries

```jsx
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        {/* ... */}
      </Routes>
    </ErrorBoundary>
  );
}
```

## 🔗 Povezane Dokumentacije

- [Components](../components/README.md) - Komponente
- [Hooks](../hooks/README.md) - Custom hooks
- [Services](../services/README.md) - API servisi

## 💡 Dodavanje Nove Stranice

1. Kreiraj `PageName.jsx` i `PageName.css`
2. Implementiraj page komponentu
3. Dodaj rutu u `src/router.jsx`
4. Dodaj link u navigaciju (`Header.jsx` ili `NavBar.jsx`)
5. Testiraj na različitim uređajima
6. Ažuriraj ovu dokumentaciju

---

**Poslednje ažuriranje:** Novembar 2025
