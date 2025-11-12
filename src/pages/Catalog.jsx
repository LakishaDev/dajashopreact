import React, { useMemo, useState } from "react";
import "./Catalog.css";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import catalog from "../services/CatalogService.js";
import { useSearchParams } from "react-router-dom";

const PER_PAGE = 12;

export default function Catalog() {
  const [sp] = useSearchParams();
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

  const data = useMemo(() => catalog.list(params), [params]);

  const [page, setPage] = useState(1);
  const start = (page - 1) * PER_PAGE;
  const items = data.slice(start, start + PER_PAGE);

  return (
    <div className="catalog grid" style={{ gridTemplateColumns: "260px 1fr" }}>
      <Filters />
      <div>
        <Breadcrumbs trail={[{ label: "Katalog", href: "/catalog" }]} />
        <div className="catalog__count">Ukupno: {data.length}</div>
        <ProductGrid items={items} />
        <Pagination
          page={page}
          total={data.length}
          perPage={PER_PAGE}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
