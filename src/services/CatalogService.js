import Product from "../models/Product.js";
import data from "../data/mock/products.js";

// Preimenovan Repository da bude jasno da obrađuje MOCK podatke
class MockProductRepository {
  constructor(rows) {
    // Repository se i dalje oslanja na Mock Data za izdvajanje filter opcija
    this.rows = rows.map((r) => new Product(r));
  }
  all() {
    return this.rows;
  }

  // Lokalna filtracija mock podataka za kompatibilnost
  filter({ q, brand, gender, category, min, max }) {
    let out = [...this.rows];
    if (q) {
      const s = q.toLowerCase();
      out = out.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(s));
    }
    if (brand && brand.length) out = out.filter((p) => brand.includes(p.brand));
    if (gender && gender.length)
      out = out.filter((p) => gender.includes(p.gender));
    if (category && category.length)
      out = out.filter((p) => category.includes(p.category));
    if (min != null) out = out.filter((p) => p.price >= min);
    if (max != null) out = out.filter((p) => p.price <= max);
    return out;
  }

  bySlug(slug) {
    return this.rows.find((p) => p.slug === slug);
  }
}

class CatalogService {
  constructor() {
    this.repo = new MockProductRepository(data);
  }

  /**
   * @deprecated Koristite useProducts hook u Catalog.jsx za real-time podatke.
   * @param {object} params
   */
  list(params) {
    console.warn(
      "CatalogService.list() je zastareo; molimo koristite useProducts za real-time podatke."
    );
    // Vraća filtrirane mock podatke za back-up kompatibilnost
    return this.repo.filter(params || {});
  }

  /**
   * @deprecated Koristite useProduct(slug) hook u Products.jsx za asinhrono dohvaćanje.
   * @param {string} slug
   */
  get(slug) {
    console.warn(
      "CatalogService.get() je zastareo; molimo koristite useProduct(slug) za asinhrono dohvaćanje."
    );
    // Vraća proizvod iz mock podataka za back-up kompatibilnost
    return this.repo.bySlug(slug);
  }

  /**
   * Dohvata listu jedinstvenih brendova iz celog (mock) seta za opcije filtera.
   */
  brands() {
    return [...new Set(this.repo.all().map((p) => p.brand))];
  }

  /**
   * Dohvata listu jedinstvenih polova iz celog (mock) seta za opcije filtera.
   */
  genders() {
    return [
      ...new Set(
        this.repo
          .all()
          .map((p) => p.gender)
          .filter(Boolean)
      ),
    ];
  }

  /**
   * Dohvata listu jedinstvenih kategorija iz celog (mock) seta za opcije filtera.
   */
  categories() {
    return [
      ...new Set(
        this.repo
          .all()
          .map((p) => p.category)
          .filter(Boolean)
      ),
    ];
  }
}

const catalog = new CatalogService();
export default catalog;
