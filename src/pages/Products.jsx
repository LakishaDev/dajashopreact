import React, { useState, useEffect, useMemo } from 'react';
import './Product.css';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { money } from '../utils/currency.js';
import { useCart } from '../hooks/useCart.js';
import { useFlash } from '../hooks/useFlash.js';
import { useWishlist } from '../context/WishlistProvider.jsx';
import useProduct from '../hooks/useProduct.js';
import useProducts from '../hooks/useProducts.js';
import Watch3DViewer from '../components/Watch3DViewer.jsx';
import { useLenis } from 'lenis/react';
import {
  Box,
  Image as ImageIcon,
  Heart,
  Maximize2,
  Layers,
  Truck,
  ShieldCheck,
  Package,
} from 'lucide-react';
import ImageGalleryModal from '../components/modals/ImageGalleryModal.jsx';
import ProductFeatures from '../components/product/ProductFeatures.jsx';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const lenis = useLenis();

  const { product: p, loading, error } = useProduct(slug);
  const { items: allProducts } = useProducts();

  const { dispatch } = useCart();
  const { flash } = useFlash();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = p ? isInWishlist(p.id) : false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // State za tabove (default: Opis)
  const [activeTab, setActiveTab] = useState('desc');

  useEffect(() => {
    setActiveIndex(0);
    setActiveTab('desc');
    lenis?.scrollTo(0, { duration: 1.5 });
  }, [lenis, slug]);

  // --- LOGIKA ZA VARIJANTE ---
  const relatedVariants = useMemo(() => {
    if (!p || !allProducts.length) return [];
    const parts = p.name.split('-');
    if (parts.length < 2) return [];
    const baseName = parts.slice(0, -1).join('-');
    return allProducts.filter((item) => {
      return (
        item.id !== p.id &&
        item.name.startsWith(baseName) &&
        (item.name.length === baseName.length ||
          item.name[baseName.length] === '-')
      );
    });
  }, [p, allProducts]);

  // Priprema liste medija
  const mediaList = useMemo(() => {
    if (!p) return [];
    const list = [];
    if (p.model3DUrl) {
      list.push({ type: '3d', src: p.model3DUrl, id: 'model-3d' });
    }
    const images =
      p.images && p.images.length > 0
        ? p.images
        : p.image
        ? [{ url: p.image }]
        : [];
    images.forEach((img, i) => {
      list.push({ type: 'image', src: img.url, id: `img-${i}` });
    });
    return list;
  }, [p]);

  const galleryImages = useMemo(
    () =>
      mediaList.filter((m) => m.type === 'image').map((m) => ({ url: m.src })),
    [mediaList]
  );

  if (loading)
    return <div className="container product-loading">Učitavanje...</div>;
  if (error || !p)
    return (
      <div className="container product-error">Proizvod nije pronađen.</div>
    );

  const activeItem = mediaList[activeIndex] || mediaList[0];
  const currentGalleryIndex = galleryImages.findIndex(
    (img) => img.url === activeItem.src
  );

  const handleAdd = () => {
    dispatch({
      type: 'ADD',
      item: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images?.[0]?.url || p.image,
        brand: p.brand,
        slug: p.slug,
      },
    });
    flash('Dodato u korpu', `${p.name} je spreman za isporuku.`, 'cart');
  };

  const handleWishlist = () => {
    if (!p) return;
    toggleWishlist({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0]?.url || p.image,
      brand: p.brand,
      slug: p.slug,
    });
  };

  return (
    <div className="product product-layout">
      {isGalleryOpen && (
        <ImageGalleryModal
          images={galleryImages}
          initialIndex={Math.max(0, currentGalleryIndex)}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      {/* --- LEVA KOLONA: SLIKE + TABOVI --- */}
      <div className="product__gallery">
        {/* 1. Glavna slika */}
        <div className="product__main-view card relative group">
          {activeItem?.type === '3d' ? (
            <div className="view-3d-wrapper" data-lenis-prevent>
              <Watch3DViewer modelUrl={activeItem.src} />
            </div>
          ) : (
            <div
              className="view-image-wrapper cursor-zoom-in relative overflow-hidden"
              onClick={() => setIsGalleryOpen(true)}
            >
              <img
                src={activeItem?.src}
                alt={p.name}
                className="product__img-full transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                <Maximize2 size={20} />
              </div>
            </div>
          )}
        </div>

        {/* 2. Thumbnails */}
        {mediaList.length > 1 && (
          <div className="product__thumbs">
            {mediaList.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(index)}
                  className={`thumb-btn ${isActive ? 'is-active' : ''}`}
                >
                  {item.type === '3d' ? (
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

        {/* --- 3. [NOVO] TABOVI ISPOD SLIKE --- */}
        <div className="product-tabs-container">
          {/* Header */}
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`}
              onClick={() => setActiveTab('desc')}
            >
              Opis
            </button>
            <button
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Specifikacije
            </button>
            <button
              className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivery')}
            >
              Isporuka
            </button>
          </div>

          {/* Sadržaj */}
          <div className="tab-content">
            {/* OPIS - Povezan sa bazom (p.description) */}
            {activeTab === 'desc' && (
              <div className="tab-text">
                {p.description ? (
                  <p>{p.description}</p>
                ) : (
                  <p className="text-neutral-400 italic">
                    Nema opisa za ovaj proizvod.
                  </p>
                )}
              </div>
            )}

            {/* SPECIFIKACIJE - Povezane sa bazom (p.specs) */}
            {activeTab === 'specs' && (
              <div className="specs-grid">
                {p.specs && Object.keys(p.specs).length > 0 ? (
                  Object.entries(p.specs).map(([k, v]) => (
                    <div className="product__spec-row" key={k}>
                      <span className="spec-key">{k}:</span>
                      <span className="spec-val">{v}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-400 italic">Nema specifikacija.</p>
                )}
              </div>
            )}

            {/* ISPORUKA - Statički sadržaj */}
            {activeTab === 'delivery' && (
              <div className="delivery-info">
                <div className="delivery-item">
                  <div className="delivery-icon">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4>Besplatna dostava</h4>
                    <p>
                      Za sve porudžbine iznad 5.000 RSD. Isporuka u roku od
                      24-48h kurirskom službom.
                    </p>
                  </div>
                </div>
                <div className="delivery-item">
                  <div className="delivery-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4>2 Godine Garancije</h4>
                    <p>
                      Svi satovi dolaze sa zvaničnom garancijom na mehanizam i
                      bateriju.
                    </p>
                  </div>
                </div>
                <div className="delivery-item">
                  <div className="delivery-icon">
                    <Package size={20} />
                  </div>
                  <div>
                    <h4>Originalno Pakovanje</h4>
                    <p>
                      Sat stiže u originalnoj kutiji sa uputstvom i fiskalnim
                      računom.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* --- KRAJ TABOVA --- */}
      </div>

      {/* --- DESNA KOLONA: INFO + AKCIJE + FEATURES --- */}
      <div className="product__info">
        <Breadcrumbs
          trail={[{ label: 'Katalog', href: '/catalog' }, { label: p.brand }]}
        />

        <h1 className="product__title">
          <span className="product__brand-label">{p.brand}</span>
          <span className="product__model-name">{p.name}</span>
        </h1>

        <div className="product__price">{money(p.price)}</div>

        {/* Varijante */}
        {relatedVariants.length > 0 && (
          <div className="product__variants">
            <div className="variants-title">
              <Layers size={16} />
              <span>Dostupne varijante</span>
            </div>
            <div className="variants-grid">
              <div className="variant-card active" title="Trenutni model">
                <img
                  src={p.images?.[0]?.url || p.image}
                  alt={p.name}
                  className="variant-img"
                />
              </div>
              {relatedVariants.map((variant) => (
                <div
                  key={variant.id}
                  className="variant-card"
                  onClick={() => navigate(`/product/${variant.slug}`)}
                  title={variant.name}
                >
                  <img
                    src={variant.images?.[0]?.url || variant.image}
                    alt={variant.name}
                    className="variant-img"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dugmići za akciju */}
        <div
          className="product__actions flex gap-3"
          style={{ marginTop: '24px', marginBottom: '32px' }}
        >
          <button className="product__cta flex-1" onClick={handleAdd}>
            Dodaj u korpu
          </button>

          <button
            className="p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors flex items-center justify-center"
            onClick={handleWishlist}
            title={isLiked ? 'Ukloni iz želja' : 'Dodaj u želje'}
          >
            <Heart
              size={24}
              className={
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-[var(--color-text)]'
              }
            />
          </button>
        </div>

        {/* Tvoje prilagođene kartice sa funkcionalnostima (Technology) */}
        <ProductFeatures product={p} />
      </div>
    </div>
  );
}
