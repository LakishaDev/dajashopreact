import React, { useEffect, useMemo, useState } from "react";
import "./Catalog.css";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import FilterDrawer from "../components/FilterDrawer.jsx"; // koristi se SAMO na mobilnom
import catalog from "../services/CatalogService.js";
import { useSearchParams } from "react-router-dom";

const PER_PAGE = 12;

export default function Catalog() {
  const [sp] = useSearchParams();

  // Parametri iz URL-a
  const params = useMemo(
    () => ({
      q: sp.get("q") || "",
      brand: sp.getAll("brand"),
      gender: sp.getAll("gender"),
      category: sp.getAll("category"),
      min: sp.get("min") ? Number(sp.get("min")) : null,
      max: sp.get("max") ? Number(sp.get("max")) : null,
    }),
    [sp]
  );

  // Filtrirani podaci
  const data = useMemo(() => catalog.list(params), [params]);

  // Paginacija
  const [page, setPage] = useState(1);
  const start = (page - 1) * PER_PAGE;
  const items = data.slice(start, start + PER_PAGE);

  // Na promenu filtera → vrati na stranu 1
  useEffect(() => {
    setPage(1);
  }, [
    params.q,
    params.min,
    params.max,
    params.brand.join(","),
    params.gender.join(","),
    params.category.join(","),
  ]);

  return (
    <div className="catalog-page">
      {/* MOBILNI: dugme za otvaranje FilterDrawer-a (fullscreen) */}
      <div className="catalog-mobile-trigger">
        <FilterDrawer />
      </div>

      <div className="catalog-layout">
        {/* DESKTOP: levi sidebar sa Filters */}
        <aside className="sidebar-filters">
          <Filters />
        </aside>

        <main className="catalog-main">
          <Breadcrumbs trail={[{ label: "Katalog", href: "/catalog" }]} />

          <div className="catalog__toprow">
            <div className="catalog__count">Ukupno: {data.length}</div>
            {/* (opciono) sort dropdown */}
          </div>

          <ProductGrid items={items} />

          <Pagination
            page={page}
            total={data.length}
            perPage={PER_PAGE}
            onChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
