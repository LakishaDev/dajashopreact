import React from 'react';
import './ProductSpecs.css';

export default function ProductSpecs({ product }) {
  // Ako nema specifikacija, ne prikazuj ništa
  if (!product.specs || Object.keys(product.specs).length === 0) {
    return null;
  }

  return (
    <div className="product-specs-standalone card">
      <h3 className="specs-heading">Specifikacije</h3>
      <div className="specs-table-wrapper">
        <table className="specs-table">
          <tbody>
            {Object.entries(product.specs).map(([k, v]) => (
              <tr key={k} className="specs-table-row">
                <td className="spec-cell-key">{k}</td>
                <td className="spec-cell-val">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
