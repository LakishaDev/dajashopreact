export default class CartItem {
  constructor(product, qty = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.image = product.image;
    this.brand = product.brand;
    this.slug = product.slug;
    this.qty = qty;
  }
}
