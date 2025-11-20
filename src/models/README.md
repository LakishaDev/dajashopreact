# Models - Data Modeli

Data modeli i klase za strukturiranje podataka u aplikaciji.

## 📋 Sadržaj

- [Pregled](#pregled)
- [Product Model](#product-model)
- [CartItem Model](#cartitem-model)
- [Best Practices](#best-practices)

## 🎯 Pregled

Modeli definišu strukturu i validaciju podataka koji se koriste širom aplikacije. Oni omogućavaju:
- **Konzistentnost** - Jedinstvena struktura podataka
- **Validacija** - Provera ispravnosti podataka
- **Type Safety** - Jasno definisani tipovi
- **Dokumentacija** - Self-documenting kod

## 📦 Dostupni Modeli

### Product.js

**Namena:** Model za proizvode (satove).

**Struktura:**
```javascript
class Product {
  constructor({
    id,
    name,
    brand,
    category,
    price,
    description,
    imageUrl,
    inStock = true,
    features = [],
    createdAt = new Date().toISOString()
  }) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.category = category;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.inStock = inStock;
    this.features = features;
    this.createdAt = createdAt;
  }
  
  // Metode...
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Jedinstveni identifikator |
| `name` | string | ✅ | Naziv proizvoda |
| `brand` | string | ✅ | Brend (Casio, Seiko, Citizen, itd.) |
| `category` | string | ✅ | Kategorija (sport, luksuzni, casual, smart) |
| `price` | number | ✅ | Cena u dinarima |
| `description` | string | ✅ | Opis proizvoda |
| `imageUrl` | string | ✅ | URL slike proizvoda |
| `inStock` | boolean | ❌ | Dostupnost (default: true) |
| `features` | array | ❌ | Lista karakteristika (default: []) |
| `createdAt` | string | ❌ | ISO datum (default: now) |

**Korišćenje:**

```jsx
import Product from '../models/Product';

// Kreiranje novog proizvoda
const product = new Product({
  id: 'prod-123',
  name: 'Casio G-Shock GA-2100',
  brand: 'Casio',
  category: 'sport',
  price: 15000,
  description: 'Izdržljiv sportski sat',
  imageUrl: '/products/gshock.jpg',
  inStock: true,
  features: [
    'Vodoottpornost 200m',
    'Shock resistant',
    'LED osvetljenje'
  ]
});

// Pristup properties
console.log(product.name);     // "Casio G-Shock GA-2100"
console.log(product.price);    // 15000
console.log(product.inStock);  // true

// Metode (ako postoje)
const formattedPrice = product.getFormattedPrice(); // "15.000 RSD"
const isAffordable = product.isUnderPrice(20000);   // true
```

**Metode:**

```javascript
class Product {
  // ... constructor
  
  /**
   * Vraća formatiranu cenu
   * @returns {string} Formatirana cena
   */
  getFormattedPrice() {
    return `${this.price.toLocaleString('sr-RS')} RSD`;
  }
  
  /**
   * Proverava da li je cena ispod određenog limita
   * @param {number} limit - Limit cene
   * @returns {boolean}
   */
  isUnderPrice(limit) {
    return this.price < limit;
  }
  
  /**
   * Proverava da li je proizvod u određenoj kategoriji
   * @param {string} category - Kategorija
   * @returns {boolean}
   */
  isInCategory(category) {
    return this.category === category;
  }
  
  /**
   * Konvertuje u plain object (za JSON)
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      brand: this.brand,
      category: this.category,
      price: this.price,
      description: this.description,
      imageUrl: this.imageUrl,
      inStock: this.inStock,
      features: this.features,
      createdAt: this.createdAt
    };
  }
}
```

**Validacija:**

```javascript
class Product {
  constructor(data) {
    // Validacija
    if (!data.id) throw new Error('Product ID je obavezan');
    if (!data.name) throw new Error('Product name je obavezan');
    if (typeof data.price !== 'number') {
      throw new Error('Price mora biti broj');
    }
    if (data.price < 0) {
      throw new Error('Price ne može biti negativan');
    }
    
    // Inicijalizacija
    this.id = data.id;
    this.name = data.name;
    // ...
  }
}
```

---

### CartItem.js

**Namena:** Model za stavke u shopping cart-u.

**Struktura:**
```javascript
class CartItem {
  constructor({
    id,
    name,
    brand,
    price,
    qty,
    imageUrl
  }) {
    this.id = id;
    this.name = name;
    this.brand = brand;
    this.price = price;
    this.qty = qty;
    this.imageUrl = imageUrl;
  }
  
  // Metode...
}
```

**Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | ID proizvoda |
| `name` | string | ✅ | Naziv proizvoda |
| `brand` | string | ✅ | Brend |
| `price` | number | ✅ | Cena po jedinici |
| `qty` | number | ✅ | Količina |
| `imageUrl` | string | ✅ | URL slike |

**Korišćenje:**

```jsx
import CartItem from '../models/CartItem';

// Kreiranje cart item-a
const cartItem = new CartItem({
  id: 'prod-123',
  name: 'Casio G-Shock',
  brand: 'Casio',
  price: 15000,
  qty: 2,
  imageUrl: '/products/gshock.jpg'
});

// Pristup properties
console.log(cartItem.name);  // "Casio G-Shock"
console.log(cartItem.qty);   // 2

// Metode
const subtotal = cartItem.getSubtotal();  // 30000
cartItem.increaseQty(1);                  // qty = 3
cartItem.decreaseQty(1);                  // qty = 2
```

**Metode:**

```javascript
class CartItem {
  // ... constructor
  
  /**
   * Vraća ukupnu cenu za ovu stavku (price * qty)
   * @returns {number}
   */
  getSubtotal() {
    return this.price * this.qty;
  }
  
  /**
   * Uvećava količinu
   * @param {number} amount - Količina za dodavanje (default: 1)
   */
  increaseQty(amount = 1) {
    this.qty += amount;
  }
  
  /**
   * Smanjuje količinu
   * @param {number} amount - Količina za oduzimanje (default: 1)
   * @returns {boolean} - Da li je količina pala na 0
   */
  decreaseQty(amount = 1) {
    this.qty = Math.max(0, this.qty - amount);
    return this.qty === 0;
  }
  
  /**
   * Postavlja novu količinu
   * @param {number} newQty - Nova količina
   */
  setQty(newQty) {
    if (newQty < 0) throw new Error('Količina ne može biti negativna');
    this.qty = newQty;
  }
  
  /**
   * Konvertuje Product u CartItem
   * @param {Product} product - Product objekat
   * @param {number} qty - Početna količina
   * @returns {CartItem}
   */
  static fromProduct(product, qty = 1) {
    return new CartItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      qty: qty,
      imageUrl: product.imageUrl
    });
  }
  
  /**
   * Konvertuje u plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      brand: this.brand,
      price: this.price,
      qty: this.qty,
      imageUrl: this.imageUrl
    };
  }
}
```

**Konverzija iz Product-a:**

```jsx
import Product from '../models/Product';
import CartItem from '../models/CartItem';

const product = new Product({
  id: 'prod-123',
  name: 'Casio G-Shock',
  brand: 'Casio',
  price: 15000,
  // ... ostale properties
});

// Konvertuj u CartItem
const cartItem = CartItem.fromProduct(product, 2);
console.log(cartItem.qty);  // 2
```

---

## 📐 Best Practices

### 1. Validacija u Constructor-u

```javascript
class Product {
  constructor(data) {
    // ✅ Validacija obaveznih polja
    if (!data.id) {
      throw new Error('Product ID je obavezan');
    }
    
    // ✅ Type checking
    if (typeof data.price !== 'number') {
      throw new Error('Price mora biti broj');
    }
    
    // ✅ Business logic validation
    if (data.price < 0) {
      throw new Error('Price ne može biti negativan');
    }
    
    this.id = data.id;
    this.price = data.price;
  }
}
```

### 2. Immutability za Kritična Polja

```javascript
class Product {
  constructor(data) {
    // ✅ Immutable ID
    Object.defineProperty(this, 'id', {
      value: data.id,
      writable: false,
      configurable: false
    });
    
    // Regular properties
    this.price = data.price;
  }
}

// Pokušaj promene ID-a neće raditi
const product = new Product({ id: '123', price: 15000 });
product.id = '456';  // Ne radi, ID ostaje '123'
```

### 3. Static Factory Metode

```javascript
class CartItem {
  constructor(data) {
    this.id = data.id;
    // ...
  }
  
  // ✅ Factory metoda za kreiranje iz Product-a
  static fromProduct(product, qty = 1) {
    return new CartItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      qty: qty,
      imageUrl: product.imageUrl
    });
  }
  
  // ✅ Factory metoda za kreiranje iz JSON-a
  static fromJSON(json) {
    return new CartItem(json);
  }
}
```

### 4. toJSON Metoda

```javascript
class Product {
  constructor(data) {
    this.id = data.id;
    // ...
  }
  
  // ✅ Za localStorage, API calls, itd.
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      // ... sve properties
    };
  }
}

// Korišćenje
const json = JSON.stringify(product);  // Automatski poziva toJSON()
```

### 5. Getter Metode za Computed Properties

```javascript
class Product {
  constructor(data) {
    this.price = data.price;
    this.inStock = data.inStock;
  }
  
  // ✅ Computed property
  get isAvailable() {
    return this.inStock && this.price > 0;
  }
  
  get formattedPrice() {
    return `${this.price.toLocaleString('sr-RS')} RSD`;
  }
}

// Korišćenje
const product = new Product({ price: 15000, inStock: true });
console.log(product.isAvailable);     // true
console.log(product.formattedPrice);  // "15.000 RSD"
```

## 🔗 Povezane Dokumentacije

- [Data](../data/README.md) - Mock podaci
- [Services](../services/README.md) - API integracija
- [Hooks](../hooks/README.md) - useCart, useProducts

## 💡 Kreiranje Novog Modela

**Template:**

```javascript
/**
 * @class MyModel
 * @description Opis šta ovaj model predstavlja
 */
class MyModel {
  /**
   * Kreira novu instancu MyModel
   * @param {Object} data - Inicijalni podaci
   * @param {string} data.id - ID
   * @param {string} data.name - Naziv
   */
  constructor(data) {
    // Validacija
    if (!data.id) {
      throw new Error('ID je obavezan');
    }
    
    // Inicijalizacija
    this.id = data.id;
    this.name = data.name;
  }
  
  /**
   * Metoda...
   * @returns {*}
   */
  myMethod() {
    // Logika...
  }
  
  /**
   * Konvertuje u plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

export default MyModel;
```

**Koraci:**

1. Kreiraj fajl `MyModel.js`
2. Definiši constructor sa validacijom
3. Dodaj potrebne metode
4. Implementiraj `toJSON()` metodu
5. Dodaj JSDoc komentare
6. Export klasu
7. Ažuriraj ovu dokumentaciju

---

**Poslednje ažuriranje:** Novembar 2025
