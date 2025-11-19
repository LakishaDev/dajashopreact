import React, { useEffect, useMemo, useState } from "react";
import "./Catalog.css";
import { useSearchParams, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

// Komponente
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import FilterDrawer from "../components/FilterDrawer.jsx";

// Hook za bazu
import useProducts from "../hooks/useProducts.js";

const PER_PAGE = 12;

export default function Catalog() {
  const [sp] = useSearchParams();

  // 1. Dohvatamo SVE proizvode iz baze
  const {
    items: allItems,
    loading,
    err,
  } = useProducts({
    order: sp.get("sort") || "name",
  });

  // 2. Filtriranje podataka u memoriji
  const filteredData = useMemo(() => {
    if (!allItems) return [];

    let out = [...allItems];

    const q = sp.get("q")?.toLowerCase() || "";
    const brands = sp.getAll("brand");
    const genders = sp.getAll("gender");
    const categories = sp.getAll("category");
    const min = sp.get("min") ? Number(sp.get("min")) : null;
    const max = sp.get("max") ? Number(sp.get("max")) : null;

    // A) Tekstualna pretraga
    if (q) {
      out = out.filter((p) =>
        (p.brand + " " + p.name).toLowerCase().includes(q)
      );
    }

    // B) Checkbox filteri
    if (brands.length) out = out.filter((p) => brands.includes(p.brand));
    if (genders.length) out = out.filter((p) => genders.includes(p.gender));
    if (categories.length)
      out = out.filter((p) => categories.includes(p.category));

    // C) Cena
    if (min !== null) out = out.filter((p) => p.price >= min);
    if (max !== null) out = out.filter((p) => p.price <= max);

    return out;
  }, [allItems, sp]);

  // 3. Paginacija
  const [page, setPage] = useState(1);
  const totalCount = filteredData.length;

  // Vrati na prvu stranu ako se promene filteri
  useEffect(() => {
    setPage(1);
  }, [sp]);

  const start = (page - 1) * PER_PAGE;
  const itemsToShow = filteredData.slice(start, start + PER_PAGE);

  // --- RENDER LOGIKA ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64 text-muted">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={32} className="text-primary" />
          </motion.div>
          <span className="ml-3 text-lg font-medium">
            Učitavanje kataloga...
          </span>
        </div>
      );
    }

    if (err) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-6 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-500">
          <AlertTriangle size={32} />
          <p className="mt-3 font-bold text-lg">Došlo je do greške</p>
          <p className="text-sm opacity-80">Proverite internet konekciju.</p>
        </div>
      );
    }

    if (totalCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 p-8 rounded-2xl border border-(--color-border) bg-surface text-center">
          <p className="text-xl font-semibold text-text">
            Nema rezultata
          </p>
          <p className="text-muted mt-2 max-w-xs mx-auto">
            Pokušajte da promenite filtere ili termin pretrage.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-onPrimary font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft size={18} /> Resetuj sve filtere
          </Link>
        </div>
      );
    }

    return (
      <>
        <ProductGrid items={itemsToShow} />
        <div className="mt-8">
          <Pagination
            page={page}
            total={totalCount}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </div>
      </>
    );
  };

  return (
    <motion.div
      className="catalog-page w-full max-w-7xl mx-auto px-4 sm:px-6 py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* MOBILNI TRIGGER */}
      <div className="catalog-mobile-trigger lg:hidden mb-4">
        <FilterDrawer />
      </div>

      <div className="catalog-layout lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 items-start">
        {/* DESKTOP SIDEBAR */}
        <aside className="sidebar-filters hidden lg:block sticky top-24">
          <Filters />
        </aside>

        <main className="catalog-main min-w-0">
          <div className="mb-6">
            <Breadcrumbs trail={[{ label: "Katalog", href: "/catalog" }]} />

            <div className="catalog__toprow flex items-center justify-between mt-4 pb-4 border-b border-(--color-border)">
              <h1 className="text-2xl font-bold text-text">
                Svi proizvodi
              </h1>
              <div className="catalog__count text-sm font-semibold text-muted bg-surface px-3 py-1 rounded-full border border-(--color-border)">
                {totalCount} kom.
              </div>
            </div>
          </div>

          {/* IZMENA OVDE: Uklonjen 'layout' prop, ostavljena samo opacity animacija */}
          <motion.div
            key={sp.toString()} /* Ključ forsira re-render i fade animaciju pri promeni filtera */
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
}
