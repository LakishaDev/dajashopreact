# Services - API Servisi i Integracije

Servisi za komunikaciju sa Firebase backend-om i eksterne API-je.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Firebase Service](#firebase-service)
- [Product Services](#product-services)
- [Admin Services](#admin-services)
- [Best Practices](#best-practices)

## 🎯 Pregled

Services direktorijum sadrži sve funkcije za:
- **Firebase integraciju** - Auth, Firestore, Storage
- **API calls** - CRUD operacije
- **Data transformacije** - Format podataka
- **Error handling** - Centralizovano rukovanje greškama

## 🔥 Firebase Service

### firebase.js

**Namena:** Inicijalizacija i konfiguracija Firebase servisa.

**Exports:**

#### App & Config
```javascript
export const app;          // Firebase app instanca
export const auth;         // Firebase Auth
export const db;           // Firestore database
export const storage;      // Firebase Storage
export const analytics;    // Firebase Analytics (opcionalno)
```

#### Auth Providers
```javascript
export const googleProvider;     // GoogleAuthProvider
export const facebookProvider;   // FacebookAuthProvider
```

#### Constants
```javascript
export const ADMIN_EMAILS;       // Array admin email adresa
```

#### Helper Functions
```javascript
export function setupRecaptcha(elementId);  // Setup reCAPTCHA za phone auth
```

**Environment Varijable:**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_RECAPTCHA_SITE_KEY=
VITE_ADMIN_EMAILS=
```

**Korišćenje:**

```jsx
import { auth, db, storage } from '../services/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

// Email/Password Login
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Firestore Query
async function getProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

**Phone Auth Setup:**
```jsx
import { setupRecaptcha } from '../services/firebase';
import { signInWithPhoneNumber } from 'firebase/auth';

async function sendSMS(phoneNumber) {
  // Setup reCAPTCHA
  const appVerifier = setupRecaptcha('recaptcha-container');
  
  // Pošalji SMS kod
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    phoneNumber,
    appVerifier
  );
  
  return confirmationResult;
}
```

---

## 📦 Product Services

### CatalogService.js

**Namena:** Servis za rad sa proizvodima (CRUD operacije).

**Funkcije:**

#### getAllProducts()
Učitava sve proizvode iz Firestore.

```javascript
import { getAllProducts } from '../services/CatalogService';

async function loadProducts() {
  try {
    const products = await getAllProducts();
    console.log(products);
    // [{ id, name, price, ... }, ...]
  } catch (error) {
    console.error('Error loading products:', error);
  }
}
```

---

#### getProductById(productId)
Učitava pojedinačni proizvod po ID-u.

```javascript
import { getProductById } from '../services/CatalogService';

async function loadProduct(id) {
  try {
    const product = await getProductById(id);
    console.log(product);
    // { id, name, price, description, ... }
  } catch (error) {
    console.error('Product not found:', error);
  }
}
```

---

#### getProductsByCategory(category)
Filtrira proizvode po kategoriji.

**Parametri:**
- `category` (string) - Kategorija ('sport', 'luksuzni', 'casual', 'smart')

```javascript
import { getProductsByCategory } from '../services/CatalogService';

const sportWatches = await getProductsByCategory('sport');
```

---

#### getProductsByBrand(brand)
Filtrira proizvode po brendu.

**Parametri:**
- `brand` (string) - Brend ('Casio', 'Seiko', itd.)

```javascript
import { getProductsByBrand } from '../services/CatalogService';

const casioWatches = await getProductsByBrand('Casio');
```

---

#### searchProducts(query)
Pretražuje proizvode po nazivu.

**Parametri:**
- `query` (string) - Search query

```javascript
import { searchProducts } from '../services/CatalogService';

const results = await searchProducts('g-shock');
```

---

#### filterProducts(filters)
Filtrira proizvode po multiple kriterijumima.

**Parametri:**
- `filters` (Object) - Filter objekat
  - `category` (string)
  - `brands` (array)
  - `minPrice` (number)
  - `maxPrice` (number)
  - `inStock` (boolean)
  - `sortBy` (string) - 'price', 'name', 'createdAt'
  - `order` (string) - 'asc', 'desc'

```javascript
import { filterProducts } from '../services/CatalogService';

const filtered = await filterProducts({
  category: 'sport',
  brands: ['Casio', 'Seiko'],
  minPrice: 10000,
  maxPrice: 50000,
  inStock: true,
  sortBy: 'price',
  order: 'asc'
});
```

---

### products.js

**Namena:** Helper funkcije za rad sa products.

**Funkcije:**

#### createProduct(productData)
Kreira novi proizvod u Firestore.

**Parametri:**
- `productData` (Object) - Product objekat

```javascript
import { createProduct } from '../services/products';

const newProduct = {
  name: 'Casio G-Shock GA-2100',
  brand: 'Casio',
  category: 'sport',
  price: 15000,
  description: 'Izdržljiv sportski sat',
  imageUrl: '/products/gshock.jpg',
  inStock: true,
  features: ['Vodoottpornost 200m', 'Shock resistant']
};

await createProduct(newProduct);
```

---

#### updateProduct(productId, updates)
Ažurira postojeći proizvod.

**Parametri:**
- `productId` (string) - ID proizvoda
- `updates` (Object) - Parcijalni update objekat

```javascript
import { updateProduct } from '../services/products';

await updateProduct('prod-123', {
  price: 14000,
  inStock: false
});
```

---

#### deleteProduct(productId)
Briše proizvod.

**Parametri:**
- `productId` (string) - ID proizvoda

```javascript
import { deleteProduct } from '../services/products';

await deleteProduct('prod-123');
```

---

#### uploadProductImage(file, productId)
Upload-uje sliku proizvoda u Firebase Storage.

**Parametri:**
- `file` (File) - Image fajl
- `productId` (string) - ID proizvoda

**Vraća:**
- `string` - Download URL slike

```javascript
import { uploadProductImage } from '../services/products';

const handleUpload = async (file, productId) => {
  try {
    const imageUrl = await uploadProductImage(file, productId);
    console.log('Image uploaded:', imageUrl);
    
    // Ažuriraj proizvod sa novom slikom
    await updateProduct(productId, { imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
  }
};
```

**Sa Progress Tracking:**
```javascript
import { uploadProductImage } from '../services/products';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const uploadWithProgress = (file, productId, onProgress) => {
  const storageRef = ref(storage, `products/${productId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  uploadTask.on('state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => {
      console.error('Upload error:', error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      console.log('File available at:', downloadURL);
    }
  );
};
```

---

## 🔐 Admin Services

### admin.js

**Namena:** Admin funkcije za upravljanje porudžbinama i statistikom.

**Funkcije:**

#### getAllOrders()
Učitava sve porudžbine.

```javascript
import { getAllOrders } from '../services/admin';

const orders = await getAllOrders();
```

---

#### updateOrderStatus(orderId, newStatus)
Menja status porudžbine.

**Parametri:**
- `orderId` (string) - ID porudžbine
- `newStatus` (string) - Novi status ('pending', 'processing', 'shipped', 'delivered', 'cancelled')

```javascript
import { updateOrderStatus } from '../services/admin';

await updateOrderStatus('order-123', 'shipped');
```

---

#### getStatistics()
Vraća statistiku prodaje.

**Vraća:**
- `Object` - { totalOrders, totalRevenue, totalProducts, ... }

```javascript
import { getStatistics } from '../services/admin';

const stats = await getStatistics();
console.log(`Ukupan prihod: ${stats.totalRevenue} RSD`);
```

---

#### getUserOrders(userId)
Vraća sve porudžbine određenog korisnika.

```javascript
import { getUserOrders } from '../services/admin';

const userOrders = await getUserOrders('user-123');
```

---

## 📐 Best Practices

### 1. Error Handling

```javascript
// ✅ Dobro - Sa try/catch
export async function getProducts() {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Greška pri učitavanju proizvoda');
  }
}

// ❌ Loše - Bez error handling-a
export async function getProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### 2. Loading States

```javascript
export async function getProducts(onProgress) {
  try {
    // Notifikuj početak učitavanja
    onProgress?.({ loading: true });
    
    const snapshot = await getDocs(collection(db, 'products'));
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Notifikuj kraj učitavanja
    onProgress?.({ loading: false, data: products });
    
    return products;
  } catch (error) {
    onProgress?.({ loading: false, error });
    throw error;
  }
}
```

### 3. Data Transformation

```javascript
// ✅ Dobro - Transformacija u consistent format
export async function getProducts() {
  const snapshot = await getDocs(collection(db, 'products'));
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      price: Number(data.price),
      inStock: Boolean(data.inStock),
      createdAt: data.createdAt?.toDate() || new Date()
    };
  });
}
```

### 4. Caching

```javascript
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuta

export async function getProducts(forceRefresh = false) {
  const now = Date.now();
  
  // Ako postoji cache i nije istekao
  if (!forceRefresh && productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }
  
  // Fetch from Firebase
  const products = await fetchProductsFromFirebase();
  
  // Update cache
  productsCache = products;
  cacheTimestamp = now;
  
  return products;
}
```

### 5. Batching

```javascript
// ✅ Dobro - Batch write
import { writeBatch } from 'firebase/firestore';

export async function createMultipleProducts(products) {
  const batch = writeBatch(db);
  
  products.forEach(product => {
    const docRef = doc(collection(db, 'products'));
    batch.set(docRef, product);
  });
  
  await batch.commit();
}
```

### 6. Real-time Updates

```javascript
import { onSnapshot } from 'firebase/firestore';

export function subscribeToProducts(callback) {
  const unsubscribe = onSnapshot(
    collection(db, 'products'),
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(products);
    },
    (error) => {
      console.error('Subscription error:', error);
    }
  );
  
  return unsubscribe; // Pozovi za cleanup
}

// Korišćenje
const unsubscribe = subscribeToProducts((products) => {
  console.log('Products updated:', products);
});

// Cleanup
unsubscribe();
```

## 🔗 Povezane Dokumentacije

- [Hooks](../hooks/README.md) - Custom hooks
- [Context](../context/README.md) - Context providers
- [Models](../models/README.md) - Data modeli

## 💡 Dodavanje Novog Servisa

1. Kreiraj `myService.js`
2. Import Firebase utilities
3. Implementiraj funkcije
4. Export funkcije
5. Dodaj error handling
6. Dodaj JSDoc komentare
7. Ažuriraj ovu dokumentaciju

**Template:**
```javascript
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Opis funkcije
 * @param {type} param - Opis parametra
 * @returns {Promise<type>} Opis return vrednosti
 * @throws {Error} Opis greške
 */
export async function myServiceFunction(param) {
  try {
    // Logika...
    return result;
  } catch (error) {
    console.error('Error in myServiceFunction:', error);
    throw new Error('User-friendly error message');
  }
}
```

---

**Poslednje ažuriranje:** Novembar 2025
