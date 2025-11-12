import React from "react";
import "./Breadcrumbs.css";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ trail }) {
  return (
    <div className="breadcrumbs">
      <Link to="/">Početak</Link>
      {trail?.map((t, i) => (
        <span key={i}>
          / <Link to={t.href || "#"}>{t.label}</Link>
        </span>
      ))}
    </div>
  );
}
