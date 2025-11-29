import React from 'react';
import { Award, ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import './ProductTrust.css';

export default function ProductTrust() {
  return (
    <div className="product-trust">
      {/* 1. Originalnost */}
      <div className="trust-item">
        <div className="trust-icon-box">
          <Award size={20} strokeWidth={1.5} />
        </div>
        <div className="trust-content">
          <span className="trust-title">100% Original</span>
          <span className="trust-subtitle">Sa deklaracijom</span>
        </div>
      </div>

      {/* 2. Garancija */}
      <div className="trust-item">
        <div className="trust-icon-box">
          <ShieldCheck size={20} strokeWidth={1.5} />
        </div>
        <div className="trust-content">
          <span className="trust-title">Garancija 24 meseca </span>
          <span className="trust-subtitle">
            Garancija na mehanizam i bateriju
          </span>
        </div>
      </div>

      {/* 3. Povrat */}
      <div className="trust-item">
        <div className="trust-icon-box">
          <RefreshCw size={20} strokeWidth={1.5} />
        </div>
        <div className="trust-content">
          <span className="trust-title">Povrat 14 dana</span>
          <span className="trust-subtitle">Bez suvišnih pitanja</span>
        </div>
      </div>

      {/* 4. Sigurnost */}
      <div className="trust-item">
        <div className="trust-icon-box">
          <Lock size={20} strokeWidth={1.5} />
        </div>
        <div className="trust-content">
          <span className="trust-title">Sigurna kupovina</span>
          <span className="trust-subtitle">SSL zaštita podataka</span>
        </div>
      </div>
    </div>
  );
}
