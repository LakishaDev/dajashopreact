import React, { useState, useEffect } from "react";
import "./Product.css";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { money } from "../utils/currency.js";
import { useCart } from "../hooks/useCart.js";
import { useFlash } from "../hooks/useFlash.js";
import useProduct from "../hooks/useProduct.js"; // 👈 Novi hook za bazu
import Watch3DViewer from "../components/Watch3DViewer.jsx";
import { useLenis } from "lenis/react";

export default function Product() {
  const { slug } = useParams();
  const lenis = useLenis();

  // 1. Uzimamo podatke iz baze
  const { product: p, loading, error } = useProduct(slug);

  const { dispatch } = useCart();
  const { flash } = useFlash();

  // 2. State za trenutno izabranu sliku
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Resetuj index slike kad se promeni proizvod
  useEffect(() => {
    // Resetuj index slike na 0
    setActiveImgIndex(0);
    // Skroluj na vrh stranice kad se promeni proizvod
    lenis?.scrollTo(0, { duration: 1.5 });
  }, [lenis, slug]);

  // --- Loading / Error stanja (u tvom stilu) ---
  if (loading) return <div style={{ padding: 20 }}>Učitavanje...</div>;
  if (error || !p)
    return <div style={{ padding: 20 }}>Proizvod nije pronađen.</div>;

  // 3. Normalizacija slika (da radi i sa starim 'image' stringom i sa novim 'images' nizom iz baze)
  // Ako baza ima niz 'images', koristimo ga. Ako ne, pravimo niz od jedne slike 'image'.
  const images =
    p.images && p.images.length > 0 ? p.images : [{ url: p.image }];

  // Trenutna slika za prikaz
  const currentImageSrc = images[activeImgIndex]?.url || p.image;

  // Provera da li postoji 3D model
  const has3DModel = !!p.model3DUrl;

  const handleAdd = () => {
    dispatch({
      type: "ADD",
      item: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: images[0]?.url || p.image, // Uvek šaljemo prvu/glavnu sliku u korpu
        brand: p.brand,
        slug: p.slug,
      },
    });
    flash("Dodato u korpu", `${p.name} je spreman za isporuku.`, "cart");
  };

  return (
    <div
      className="product grid"
      style={{ gridTemplateColumns: "1fr 1fr", alignItems: "start" }}
    >
      {/* LEVA STRANA - SLIKE */}
      <div
        className="card product__media"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* Glavna slika */}
        {has3DModel ? (
          <Watch3DViewer modelUrl={p.model3DUrl} />
        ) : (
          <div
            style={{
              aspectRatio: "1/1",
              overflow: "hidden",
              borderRadius: "12px",
            }}
          >
            <img
              src={currentImageSrc}
              alt={p.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        )}

        {/* Thumbnail traka (samo ako ima više od 1 slike) */}
        {images.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
            }}
          >
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImgIndex(index)}
                style={{
                  border:
                    activeImgIndex === index
                      ? "2px solid var(--color-primary)"
                      : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: 0,
                  width: "60px",
                  height: "60px",
                  flexShrink: 0,
                  cursor: "pointer",
                  overflow: "hidden",
                  background: "var(--color-surface)",
                }}
              >
                <img
                  src={img.url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESNA STRANA - INFO (Isto kao tvoj original) */}
      <div>
        <Breadcrumbs
          trail={[{ label: "Katalog", href: "/catalog" }, { label: p.brand }]}
        />
        <h1 className="product__title">
          {p.brand} — {p.name}
        </h1>
        <div className="product__price">{money(p.price)}</div>

        <div className="product__specs card">
          {Object.entries(p.specs || {}).map(([k, v]) => (
            <div className="product__spec" key={k}>
              <strong>{k}:</strong> {v}
            </div>
          ))}
        </div>

        <button className="product__cta" onClick={handleAdd}>
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}
