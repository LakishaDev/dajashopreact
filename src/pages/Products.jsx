import React, { useState, useEffect, useMemo } from "react";
import "./Product.css";
import { useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { money } from "../utils/currency.js";
import { useCart } from "../hooks/useCart.js";
import { useFlash } from "../hooks/useFlash.js";
import useProduct from "../hooks/useProduct.js";
import Watch3DViewer from "../components/Watch3DViewer.jsx";
import { useLenis } from "lenis/react";
import { Box, Image as ImageIcon } from "lucide-react"; // Ikone za thumbnails

export default function Product() {
  const { slug } = useParams();
  const lenis = useLenis();

  // 1. Podaci iz baze
  const { product: p, loading, error } = useProduct(slug);
  const { dispatch } = useCart();
  const { flash } = useFlash();

  // 2. State za aktivni medij (3D ili Slika)
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset indexa i scrolla pri promeni proizvoda
  useEffect(() => {
    setActiveIndex(0);
    lenis?.scrollTo(0, { duration: 1.5 });
  }, [lenis, slug]);

  // 3. Objedinjena lista medija (3D Model + Slike)
  const mediaList = useMemo(() => {
    if (!p) return [];

    const list = [];

    // A) Ako postoji 3D model, on je prvi u nizu
    if (p.model3DUrl) {
      list.push({
        type: "3d",
        src: p.model3DUrl,
        id: "model-3d",
      });
    }

    // B) Slike iz niza ili fallback na single image string
    const images =
      p.images && p.images.length > 0
        ? p.images
        : p.image
        ? [{ url: p.image }]
        : [];

    images.forEach((img, i) => {
      list.push({
        type: "image",
        src: img.url,
        id: `img-${i}`,
      });
    });

    return list;
  }, [p]);

  // --- Loading / Error ---
  if (loading)
    return <div className="container product-loading">Učitavanje...</div>;
  if (error || !p)
    return (
      <div className="container product-error">Proizvod nije pronađen.</div>
    );

  const activeItem = mediaList[activeIndex] || mediaList[0];

  const handleAdd = () => {
    dispatch({
      type: "ADD",
      item: {
        id: p.id,
        name: p.name,
        price: p.price,
        // Uvek šaljemo prvu dostupnu SLIKU u korpu (ne 3D model)
        image: p.images?.[0]?.url || p.image,
        brand: p.brand,
        slug: p.slug,
      },
    });
    flash("Dodato u korpu", `${p.name} je spreman za isporuku.`, "cart");
  };

  return (
    <div className="product product-layout">
      {/* LEVA KOLONA - MEDIJA (3D + SLIKE) */}
      <div className="product__gallery">
        {/* Glavni prikaz */}
        <div className="product__main-view card">
          {activeItem?.type === "3d" ? (
            <div className="view-3d-wrapper" data-lenis-prevent>
              <Watch3DViewer modelUrl={activeItem.src} />
            </div>
          ) : (
            <div className="view-image-wrapper">
              <img
                src={activeItem?.src}
                alt={p.name}
                className="product__img-full"
              />
            </div>
          )}
        </div>

        {/* Thumbnail traka (samo ako ima više od 1 stavke) */}
        {mediaList.length > 1 && (
          <div className="product__thumbs">
            {mediaList.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={`thumb-btn ${isActive ? "is-active" : ""}`}
                  aria-label={
                    item.type === "3d"
                      ? "Prikaži 3D model"
                      : `Prikaži sliku ${index}`
                  }
                >
                  {item.type === "3d" ? (
                    <div className="thumb-icon">
                      <Box size={20} strokeWidth={1.5} />
                      <span>3D</span>
                    </div>
                  ) : (
                    <img src={item.src} alt="" className="thumb-img" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DESNA KOLONA - INFORMACIJE */}
      <div className="product__info">
        <Breadcrumbs
          trail={[{ label: "Katalog", href: "/catalog" }, { label: p.brand }]}
        />

        <h1 className="product__title">
          <span className="product__brand-label">{p.brand}</span>
          <span className="product__model-name">{p.name}</span>
        </h1>

        <div className="product__price">{money(p.price)}</div>

        <div className="product__specs card">
          <h3 className="specs-title">Specifikacije</h3>
          <div className="specs-grid">
            {Object.entries(p.specs || {}).map(([k, v]) => (
              <div className="product__spec-row" key={k}>
                <span className="spec-key">{k}:</span>
                <span className="spec-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="product__actions">
          <button className="product__cta" onClick={handleAdd}>
            Dodaj u korpu
          </button>
        </div>
      </div>
    </div>
  );
}
