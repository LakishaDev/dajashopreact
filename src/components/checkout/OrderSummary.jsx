import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function OrderSummary({
  total,
  shippingMethod,
  finalShipping,
  finalTotal,
  handlePlaceOrder,
  money,
}) {
  return (
    <div className="summary-card card glass">
      <h2>Pregled porudžbine</h2>
      <div className="summary-rows">
        <div className="summary-row">
          <span className="muted">Međuzbir</span>
          <span>{money(total)}</span>
        </div>
        <div className="summary-row">
          <span className="muted">Isporuka</span>
          {finalShipping === 0 ? (
            <span className="text-success">Besplatna</span>
          ) : (
            <span>{money(finalShipping)}</span>
          )}
        </div>
        <div className="hr"></div>
        <div className="summary-total">
          <span>Ukupno</span>
          <span className="total-price">{money(finalTotal)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handlePlaceOrder}
        className="checkout-btn btn-primary"
      >
        Potvrdi porudžbinu <ArrowRight size={18} />
      </button>
      <div className="secure-badge">
        <ShieldCheck size={16} /> Sigurna kupovina
      </div>
    </div>
  );
}
