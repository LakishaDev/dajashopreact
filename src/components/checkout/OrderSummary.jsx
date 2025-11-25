import React from 'react';
import { ArrowRight, ShieldCheck, Ticket } from 'lucide-react'; // Dodao Ticket ikonicu

export default function OrderSummary({
  total,
  shippingMethod,
  finalShipping,
  finalTotal, // Ovo će sada biti total SA uračunatim popustom
  handlePlaceOrder,
  money,
  isLoading,
  appliedPromo, // NOVO: Primamo objekat promo koda
  discountAmount, // NOVO: Iznos popusta
}) {
  return (
    <div className="summary-card card glass">
      <h2>Pregled porudžbine</h2>
      <div className="summary-rows">
        <div className="summary-row">
          <span className="muted">Međuzbir</span>
          <span>{money(total)}</span>
        </div>

        {/* --- NOVO: Prikaz popusta ako postoji --- */}
        {appliedPromo && (
          <div className="summary-row" style={{ color: '#ef4444' }}>
            <span
              className="muted"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#ef4444',
              }}
            >
              <Ticket size={14} /> Popust ({appliedPromo.code})
            </span>
            <span>-{money(discountAmount)}</span>
          </div>
        )}

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
        disabled={isLoading} // Onemogući klik dok se šalje
      >
        {isLoading ? 'Obrada...' : 'Potvrdi porudžbinu'}
        {!isLoading && <ArrowRight size={18} />}
      </button>

      <div className="secure-badge">
        <ShieldCheck size={16} /> Sigurna kupovina
      </div>
    </div>
  );
}
