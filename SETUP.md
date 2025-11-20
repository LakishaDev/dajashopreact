# Vodič za Podešavanje DajaShop Projekta

Detaljan vodič za postavljanje razvojnog okruženja i pokretanje DajaShop React aplikacije.

## 📋 Preduslovi

Pre nego što počnete, uverite se da imate instaliran sledeći softver:

### Obavezno

- **Node.js** (verzija 18.x ili novija)
  - Preuzmite sa [nodejs.org](https://nodejs.org/)
  - Proverite instalaciju: `node --version`

- **npm** (dolazi sa Node.js) ili **yarn**
  - Proverite instalaciju: `npm --version`

- **Git**
  - Preuzmite sa [git-scm.com](https://git-scm.com/)
  - Proverite instalaciju: `git --version`

### Preporučeno

- **Visual Studio Code** - Preporučeni kod editor
  - Preuzmite sa [code.visualstudio.com](https://code.visualstudio.com/)
  - Projekat uključuje preporučene VS Code ekstenzije

## 🚀 Korak-po-Korak Podešavanje

### 1. Kloniranje Repozitorijuma

```bash
# Klonirajte repozitorijum
git clone https://github.com/your-username/dajashopreact.git

# Uđite u direktorijum projekta
cd dajashopreact
```

### 2. Instalacija Zavisnosti

```bash
# Korišćenjem npm
npm install

# ILI korišćenjem yarn
yarn install
```

Ova komanda će instalirati sve potrebne pakete navedene u `package.json`.

### 3. Podešavanje Firebase Projekta

DajaShop koristi Firebase za autentifikaciju, bazu podataka i skladištenje fajlova.

#### 3.1. Kreiranje Firebase Projekta

1. Idite na [Firebase Console](https://console.firebase.google.com/)
2. Kliknite "Add project" (Dodaj projekat)
3. Unesite ime projekta (npr. "dajashop-production")
4. Izaberite da li želite Google Analytics (opcionalno)
5. Kliknite "Create project"

#### 3.2. Registracija Web Aplikacije

1. U Firebase Console, kliknite na ikonu web-a (</>) da dodate web aplikaciju
2. Unesite naziv aplikacije (npr. "DajaShop Web")
3. Označite "Also set up Firebase Hosting" ako planirate hosting na Firebase-u
4. Kliknite "Register app"

#### 3.3. Kopiranje Firebase Konfiguracije

Nakon registracije, Firebase će vam pokazati konfiguracioni objekat:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

#### 3.4. Omogućavanje Autentifikacije

1. U Firebase Console, idite na **Authentication** > **Sign-in method**
2. Omogućite sledeće metode:
   - **Email/Password** - Kliknite "Enable"
   - **Google** - Kliknite "Enable", dodajte support email
   - **Facebook** - Kliknite "Enable", dodajte App ID i App Secret (dobijte od Facebook Developers)
   - **Phone** - Kliknite "Enable", dodajte test brojeve telefona za development

#### 3.5. Podešavanje Firestore Database

1. U Firebase Console, idite na **Firestore Database**
2. Kliknite "Create database"
3. Izaberite "Start in test mode" (za development) ili "Start in production mode"
4. Izaberite lokaciju servera (npr. `europe-west1` za Evropu)

**Inicijalna Struktura Firestore:**

```
firestore/
├── products/          # Proizvodi (satovi)
│   └── {productId}
│       ├── name
│       ├── price
│       ├── description
│       ├── imageUrl
│       └── category
├── orders/            # Porudžbine
│   └── {orderId}
│       ├── userId
│       ├── items[]
│       ├── total
│       └── status
└── users/             # Korisnički profili
    └── {userId}
        ├── email
        ├── displayName
        └── createdAt
```

#### 3.6. Podešavanje Firebase Storage

1. U Firebase Console, idite na **Storage**
2. Kliknite "Get started"
3. Izaberite security rules (test mode za development)
4. Izaberite lokaciju (ista kao za Firestore)

### 4. Kreiranje Environment Varijabli

1. Kopirajte `.env.example` u novi fajl `.env`:

```bash
cp .env.example .env
```

2. Otvorite `.env` fajl i popunite sa vrednostima iz Firebase konfiguracije:

```env
VITE_FIREBASE_API_KEY=vaša_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=vaš-projekat.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=vaš-projekat-id
VITE_FIREBASE_STORAGE_BUCKET=vaš-projekat.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=vaš_sender_id
VITE_FIREBASE_APP_ID=vaš_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

VITE_FIREBASE_RECAPTCHA_SITE_KEY=vaš_recaptcha_key

VITE_ADMIN_EMAILS=admin@example.com,drugi-admin@example.com
```

**NAPOMENA:** `.env` fajl ne sme biti commit-ovan u Git! On je već dodat u `.gitignore`.

### 5. VS Code Ekstenzije (Preporučeno)

Ako koristite VS Code, instalirajte preporučene ekstenzije:

1. Otvorite projekat u VS Code
2. Pritisnite `Ctrl+Shift+P` (ili `Cmd+Shift+P` na Mac)
3. Otkucajte "Extensions: Show Recommended Extensions"
4. Kliknite "Install All" za sve preporučene ekstenzije

Ključne ekstenzije:
- **ESLint** - Linting JavaScript koda
- **Prettier** - Formatiranje koda
- **Tailwind CSS IntelliSense** - Autocomplete za Tailwind klase
- **ES7+ React/Redux/React-Native snippets** - React snippets

### 6. Pokretanje Razvojnog Servera

```bash
# Pokrenite dev server
npm run dev

# ILI sa yarn
yarn dev
```

Server će se pokrenuti na `http://localhost:5173` (ili drugom dostupnom portu).

**Output:**

```
  VITE v7.2.2  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

### 7. Verifikacija Instalacije

Otvorite browser i idite na `http://localhost:5173`. Trebalo bi da vidite početnu stranicu DajaShop aplikacije.

**Proverite sledeće:**

1. ✅ Stranica se učitava bez grešaka
2. ✅ Tailwind CSS stilovi su primenjeni
3. ✅ Možete kliknuti na "Prijavi se" i videti autentifikacioni modal
4. ✅ Nema console errors u browser developer tools

## 🔧 Dodatno Podešavanje

### Admin Pristup

Da biste dobili pristup admin panelu:

1. Registrujte se sa email adresom koju ćete koristiti kao admin
2. Dodajte tu email adresu u `.env` fajl pod `VITE_ADMIN_EMAILS`
3. Restartujte dev server
4. Prijavite se i pristupite `/admin` ruti

### Seed Podaci (Opcionalno)

Za brzo testiranje, možete dodati test proizvode u Firestore:

1. Idite na Firebase Console > Firestore Database
2. Kreirajte kolekciju `products`
3. Dodajte dokumente sa sledećim poljima:

```json
{
  "name": "Casio G-Shock",
  "price": 15000,
  "description": "Izdržljiv sportski sat",
  "imageUrl": "https://example.com/image.jpg",
  "category": "sport",
  "brand": "Casio",
  "inStock": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

ILI koristite mock podatke iz `src/data/mock/products.js` tokom razvoja.

## 📝 Sledeći Koraci

Nakon uspešnog podešavanja:

1. 📖 Pročitajte [ARCHITECTURE.md](./ARCHITECTURE.md) za razumevanje strukture projekta
2. 📖 Pročitajte [CONTRIBUTING.md](./CONTRIBUTING.md) za smernice o doprinosu
3. 🚀 Počnite sa razvojem!

## 🐛 Troubleshooting

### Problem: "Module not found" greška

**Rešenje:**
```bash
# Obrišite node_modules i reinstalirajte
rm -rf node_modules package-lock.json
npm install
```

### Problem: Firebase autentifikacija ne radi

**Rešenje:**
1. Proverite da li su sve Firebase env varijable ispravno postavljene u `.env`
2. Proverite da li ste omogućili metode autentifikacije u Firebase Console
3. Restartujte dev server nakon izmene `.env` fajla

### Problem: Tailwind CSS stilovi se ne primenjuju

**Rešenje:**
1. Proverite da li je `tailwind.config.js` ispravno konfigurisan
2. Proverite da li je `@tailwindcss/vite` plugin uključen u `vite.config.js`
3. Očistite cache i restartujte server:
```bash
rm -rf node_modules/.vite
npm run dev
```

### Problem: Port 5173 je zauzet

**Rešenje:**
```bash
# Pokrenite na drugom portu
npm run dev -- --port 3000
```

### Problem: CORS greške sa Firebase

**Rešenje:**
1. Proverite Firebase security rules
2. Dodajte domen u Firebase Console > Project Settings > Authorized domains

## 📞 Podrška

Za dodatnu pomoć:

- 📧 Email: cvelenis42@yahoo.com
- 📱 Tel: 064/1262425, 065/2408400
- 📍 Lokacija: Niš, TPC Gorča lokal C31

## 🔗 Korisni Linkovi

- [React Dokumentacija](https://react.dev/)
- [Vite Dokumentacija](https://vitejs.dev/)
- [Firebase Dokumentacija](https://firebase.google.com/docs)
- [Tailwind CSS Dokumentacija](https://tailwindcss.com/docs)
- [Framer Motion Dokumentacija](https://www.framer.com/motion/)

---

**Poslednje ažuriranje:** Novembar 2025
