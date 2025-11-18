import React, { useState, useEffect, useRef } from "react";
import "./Checkout.css";
import { useCart } from "../hooks/useCart.js";
import { useFormValidator } from "../hooks/useFormValidator.js";
import { money } from "../utils/currency.js";
import { 
  User, MapPin, Phone, Mail, Truck, CreditCard, 
  CheckCircle2, ShieldCheck, ArrowRight, AlertCircle 
} from "lucide-react";

export default function Checkout() {
  const { total } = useCart();
  const addressInputRef = useRef(null);

  // --- LOGIKA FORME I VALIDACIJE ---
  const { formData, errors, handleChange, handleBlur, validateAll } = useFormValidator({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  // --- GOOGLE AUTOCOMPLETE ---
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: "rs" },
      fields: ["address_components", "formatted_address"],
      types: ["address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      let street = "";
      let number = "";
      let city = "";
      let zip = "";

      place.address_components.forEach((comp) => {
        const types = comp.types;
        if (types.includes("route")) street = comp.long_name;
        if (types.includes("street_number")) number = comp.long_name;
        if (types.includes("locality")) city = comp.long_name;
        if (types.includes("postal_code")) zip = comp.long_name;
      });

      const fullAddress = number ? `${street} ${number}` : street;
      
      handleChange({ target: { name: "address", value: fullAddress } });
      if (city) handleChange({ target: { name: "city", value: city } });
      if (zip) handleChange({ target: { name: "postalCode", value: zip } });
    });
  }, []);


  // --- LOGIKA SLANJA (Okinuta samo KLIKOM) ---
  const handlePlaceOrder = () => {
    if (validateAll()) {
      // OVDE IDE FINALNA LOGIKA
      alert("Porudžbina uspešna! Hvala na poverenju.");
      console.log("Order Data:", formData);
    } else {
      // Opciono: skroluj do vrha ili prikazi toast
      alert("Molimo popunite obavezna polja označena crvenom bojom.");
    }
  };

  // Dodatna zaštita: Ako neko ipak uspe da okine enter
  const preventFormSubmit = (e) => {
    e.preventDefault();
  };

  // Logika za dostavu
  const FREE_SHIPPING_LIMIT = 8000;
  const SHIPPING_COST = 380;
  const isFreeShipping = total >= FREE_SHIPPING_LIMIT;
  const finalShipping = isFreeShipping ? 0 : SHIPPING_COST;
  const finalTotal = total + finalShipping;

  const [payMethod, setPayMethod] = useState("cod");

  const getInputClass = (fieldName) => 
    errors[fieldName] ? "input-error" : "";

  return (
    <div className="container checkout-page">
      <h1 className="checkout-title">Naplata i Isporuka</h1>
      
      <form 
        className="checkout-layout" 
        onSubmit={preventFormSubmit} // Blokira Enter
        noValidate
      >
        {/* LEVA KOLONA - FORMA */}
        <div className="checkout-left">
          
          <section className="checkout-section card glass">
            <div className="section-header">
              <div className="step-badge">1</div>
              <h2>Podaci za isporuku</h2>
            </div>
            
            <div className="form-grid">
              {/* IME */}
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass("name")}`}>
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ime" 
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                </div>
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              {/* PREZIME */}
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass("surname")}`}>
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="surname"
                    placeholder="Prezime" 
                    value={formData.surname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                </div>
                {errors.surname && <span className="error-msg">{errors.surname}</span>}
              </div>

              {/* EMAIL */}
              <div className="input-wrapper-col full-width">
                <div className={`input-group ${getInputClass("email")}`}>
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    placeholder="E-mail adresa" 
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                  {errors.email && <AlertCircle className="error-icon" size={18} />}
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              {/* TELEFON */}
              <div className="input-wrapper-col full-width">
                <div className={`input-group ${getInputClass("phone")}`}>
                  <Phone className="input-icon" size={18} />
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="Telefon (npr. 064...)" 
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                  />
                </div>
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              {/* ADRESA (GOOGLE) */}
              <div className="input-wrapper-col full-width">
                <div className={`input-group ${getInputClass("address")}`}>
                  <MapPin className="input-icon" size={18} />
                  <input 
                    ref={addressInputRef}
                    type="text" 
                    name="address"
                    placeholder="Počnite da kucate ulicu..." 
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                    autoComplete="off"
                  />
                </div>
                {errors.address && <span className="error-msg">{errors.address}</span>}
              </div>

              {/* GRAD */}
              <div className="input-wrapper-col">
                <div className="input-group">
                  <input 
                    type="text" 
                    name="city"
                    placeholder="Grad / Mesto" 
                    value={formData.city}
                    onChange={handleChange}
                    required 
                    className="pl-4" 
                  />
                </div>
              </div>

              {/* POŠTANSKI BROJ */}
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass("postalCode")}`}>
                  <input 
                    type="text" 
                    name="postalCode"
                    placeholder="Poštanski broj" 
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required 
                    className="pl-4" 
                  />
                </div>
                {errors.postalCode && <span className="error-msg">{errors.postalCode}</span>}
              </div>
            </div>
          </section>

          <section className="checkout-section card glass">
            <div className="section-header">
              <div className="step-badge">2</div>
              <h2>Način isporuke</h2>
            </div>
            <label className="radio-card selected">
              <div className="radio-info">
                <Truck size={20} className="text-primary" />
                <div>
                  <span className="radio-title">Post Express (Srbija)</span>
                  <span className="radio-desc">Isporuka na adresu za 1-2 radna dana</span>
                </div>
              </div>
              <div className="radio-price">
                {isFreeShipping ? (
                  <span className="text-success">Besplatna</span>
                ) : (
                  <span>{money(SHIPPING_COST)}</span>
                )}
              </div>
              <input type="radio" name="shipping" defaultChecked hidden />
              <div className="radio-check"><CheckCircle2 size={16} /></div>
            </label>
          </section>

          <section className="checkout-section card glass">
            <div className="section-header">
              <div className="step-badge">3</div>
              <h2>Način plaćanja</h2>
            </div>
            <div className="payment-options">
              <label className={`radio-card ${payMethod === "cod" ? "selected" : ""}`}>
                <div className="radio-info">
                  <div className="icon-box">💵</div>
                  <div>
                    <span className="radio-title">Plaćanje pouzećem</span>
                    <span className="radio-desc">Platite kuriru prilikom preuzimanja</span>
                  </div>
                </div>
                <input type="radio" name="payment" value="cod" checked={payMethod === "cod"} onChange={() => setPayMethod("cod")} hidden />
                <div className="radio-check"><CheckCircle2 size={16} /></div>
              </label>
              <label className={`radio-card ${payMethod === "card" ? "selected" : ""}`}>
                <div className="radio-info">
                  <CreditCard size={20} className="text-muted" />
                  <div>
                    <span className="radio-title">Kartica (Uskoro)</span>
                    <span className="radio-desc">Trenutno nedostupno</span>
                  </div>
                </div>
                <input type="radio" name="payment" value="card" disabled hidden />
              </label>
            </div>
          </section>
        </div>

        {/* DESNA KOLONA - SUMMARY */}
        <div className="checkout-right">
          <div className="summary-card card glass">
            <h2>Pregled porudžbine</h2>
            <div className="summary-rows">
              <div className="summary-row">
                <span className="muted">Međuzbir</span>
                <span>{money(total)}</span>
              </div>
              <div className="summary-row">
                <span className="muted">Isporuka</span>
                {isFreeShipping ? (
                  <span className="text-success">Besplatna</span>
                ) : (
                  <span>{money(SHIPPING_COST)}</span>
                )}
              </div>
              <div className="hr"></div>
              <div className="summary-total">
                <span>Ukupno</span>
                <span className="total-price">{money(finalTotal)}</span>
              </div>
            </div>
            
            {/* IZMENA: type="button" sprečava da Enter bilo gde na stranici okine ovo dugme.
               Mora eksplicitno da se klikne.
            */}
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
        </div>
      </form>
    </div>
  );
}