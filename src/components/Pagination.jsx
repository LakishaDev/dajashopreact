import React from "react";
import "./Pagination.css";

export default function Pagination({ page, total, perPage, onChange }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          className={`pagination__btn ${page === i + 1 ? "is-active" : ""}`}
          onClick={() => onChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
