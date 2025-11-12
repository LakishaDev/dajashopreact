import Product from "../models/Product.js";
import data from "../data/mock/products.js";

class ProductRepository {
  constructor(rows) {
    this.rows = rows.map((r) => new Product(r));
  }
  all() {
    return this.rows;
  }
  bySlug(slug) {
    return this.rows.find((p) => p.slug === slug);
  }
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
}

class CatalogService {
  constructor() {
    this.repo = new ProductRepository(data);
  }
  list(params) {
    return this.repo.filter(params || {});
  }
  get(slug) {
    return this.repo.bySlug(slug);
  }
  brands() {
    return [...new Set(this.repo.all().map((p) => p.brand))];
  }
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
