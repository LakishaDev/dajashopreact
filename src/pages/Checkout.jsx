import React, { useState, useEffect, useRef } from "react";
import "./Checkout.css";
import { useCart } from "../hooks/useCart.js";
import { useFormValidator } from "../hooks/useFormValidator.js";
import { useAuth } from "../hooks/useAuth.js";
import { useFlash } from "../hooks/useFlash.js";
import { money } from "../utils/currency.js";
import { 
  User, MapPin, Phone, Mail, Truck, 
  CheckCircle2, ShieldCheck, ArrowRight, AlertCircle, Loader2, ShoppingBag,
  Lock, X, Check, UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Lista popularnih domena za autocompletion
const POPULAR_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "yahoo.co.uk"
];

// KONSTANTE ZA MAPU
const MAP_API_KEY = "AIzaSyCwDMD-56pwnAqgEDqNCT8uMxFy_mPbAe0";
const SHOP_ADDRESS_QUERY = "Daja Shop, TPC Gorca lokal C31, Nis, Srbija";
const MAP_EMBED_URL = `https://www.google.com/maps/embed/v1/place?key=${MAP_API_KEY}&q=${encodeURIComponent(SHOP_ADDRESS_QUERY)}`;


// --- MODAL ZA RAČUN ---
function OrderConfirmationModal({ order, money, onClose }) {
  const initialFocusRef = useRef(null);
  const orderId = order.id;
  const [showMap, setShowMap] = useState(false);

  // Lock scroll dok je modal otvoren
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => initialFocusRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);
  
  const isPickup = order.shippingMethod === 'pickup';
  const shippingLabel = isPickup ? 'Preuzimanje' : 'Isporuka kurirskom službom';

  return (
    <motion.div
      className="order-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="order-card glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <div className="order-header">
            <CheckCircle2 size={32} className="text-success-ico" />
            <h2 id="order-title">Hvala na poverenju, {order.customer.name}!</h2>
            <p className="order-lead">
                Vaša porudžbina <strong>#{orderId}</strong> je uspešno primljena.
                Potvrdu smo poslali na <strong>{order.customer.email}</strong>.
            </p>
        </div>

        <div className="receipt-details">
            <h3 className="details-title">Detalji porudžbine:</h3>
            <div className="item-list">
                {order.items.map((item) => (
                    <div key={item.id} className="item-row">
                        <div className="item-name">{item.name}</div>
                        <div className="item-qty">x {item.qty}</div>
                        <div className="item-price">{money(item.price * item.qty)}</div>
                    </div>
                ))}
            </div>
            <div className="summary-section">
                <div className="summary-row">
                    <span>Međuzbir:</span>
                    <span>{money(order.subtotal)}</span>
                </div>
                <div className="summary-row">
                    <span>{shippingLabel}:</span>
                    <span className="text-success">{order.shippingCost === 0 ? 'Besplatna' : money(order.shippingCost)}</span>
                </div>
                <div className="hr"></div>
                <div className="summary-row total">
                    <span>Ukupno za plaćanje:</span>
                    <span className="total-price">{money(order.finalTotal)}</span>
                </div>
            </div>
            <div className="delivery-info">
                <h4>{isPickup ? 'Adresa preuzimanja:' : 'Adresa dostave:'}</h4>
                {isPickup ? (
                    <>
                        <p>Niš, TPC Gorča lokal C31</p>
                        <button type="button" className="btn-map-receipt" onClick={(e) => { e.stopPropagation(); setShowMap(!showMap); }} style={{ cursor: 'pointer', width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                            <MapPin size={16} /> {showMap ? "Sakrij mapu" : "Prikaži lokaciju na mapi"}
                        </button>
                        <AnimatePresence>
                          {showMap && (
                            <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 250, marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="map-container rounded-xl overflow-hidden" style={{ position: 'relative', width: '100%' }}>
                              <iframe className="map-iframe" title="Lokacija preuzimanja" width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={MAP_EMBED_URL}></iframe>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </>
                ) : (
                    <>
                        <p>{order.customer.name} {order.customer.surname}</p>
                        <p>{order.customer.address}, {order.customer.city} {order.customer.postalCode}</p>
                    </>
                )}
                <p>Telefon: {order.customer.phone}</p>
            </div>
        </div>
        <div className="order-actions">
            <a href="/" className="btn-primary checkout-btn" ref={initialFocusRef} onClick={onClose}>
              Nastavi kupovinu <ShoppingBag size={18} />
            </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Checkout() {
  const { items, total, dispatch } = useCart();
  const { user, register } = useAuth();
  const { flash } = useFlash();
  
  const addressInputRef = useRef(null);
  const emailInputRef = useRef(null);
  
  const [mapsReady, setMapsReady] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [payMethod, setPayMethod] = useState("cod");
  const [shippingMethod, setShippingMethod] = useState('courier');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // STATE ZA REGISTRACIJU
  const [showRegPopover, setShowRegPopover] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState(""); 
  const [popoverDismissed, setPopoverDismissed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const { formData, errors, handleChange, handleBlur, validateAll } = useFormValidator({
    name: "", surname: "", email: "", phone: "",
    address: "", city: "", postalCode: ""
  });
  
  const FREE_SHIPPING_LIMIT = 8000;
  const COURIER_COST = 380; 
  const isFreeShipping = total >= FREE_SHIPPING_LIMIT;
  const finalShipping = shippingMethod === 'pickup' ? 0 : (isFreeShipping ? 0 : COURIER_COST);
  const finalTotal = total + finalShipping;
  const requiredForCourier = shippingMethod === 'courier';

  // --- NOVO: FIX ZA SKROLOVANJE (LENIS REFRESH) ---
  // Ovo osigurava da se dužina stranice ponovo izračuna kada se otvore/zatvore sekcije
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400); // Čeka da se animacija završi (0.3s) pa triggeruje resize
    return () => clearTimeout(t);
  }, [shippingMethod, createAccount, showRegPopover]);

  useEffect(() => {
    if (shippingMethod === 'pickup') {
      handleChange({ target: { name: "address", value: "" } });
      handleChange({ target: { name: "city", value: "" } });
      handleChange({ target: { name: "postalCode", value: "" } });
    }
  }, [shippingMethod]);

  // --- GOOGLE PLACES ---
  useEffect(() => {
    if (shippingMethod === 'pickup') return; // Ne inicijalizuj ako je pickup

    let autocomplete = null;
    let checkInterval = null;
    const initGooglePlaces = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return false;
      if (addressInputRef.current) {
        autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          componentRestrictions: { country: "rs" }, fields: ["address_components", "formatted_address"], types: ["address"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.address_components) return;
          let street = "", number = "", city = "", zip = "";
          place.address_components.forEach((comp) => {
            const types = comp.types;
            if (types.includes("route")) street = comp.long_name;
            if (types.includes("street_number")) number = comp.long_name;
            if (types.includes("locality")) city = comp.long_name;
            if (!city && types.includes("administrative_area_level_2")) city = comp.long_name;
            if (types.includes("postal_code")) zip = comp.long_name;
          });
          const fullAddress = number ? `${street} ${number}` : street;
          if (fullAddress) handleChange({ target: { name: "address", value: fullAddress } });
          if (city) handleChange({ target: { name: "city", value: city } });
          if (zip) handleChange({ target: { name: "postalCode", value: zip } });
        });
        setMapsReady(true);
        return true;
      }
      return false;
    };
    
    if (!initGooglePlaces()) {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++; if (initGooglePlaces() || attempts > 20) clearInterval(checkInterval);
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (autocomplete) window.google.maps.event.clearInstanceListeners(autocomplete);
      const pacs = document.querySelectorAll(".pac-container");
      pacs.forEach(el => el.remove());
    };
  }, [shippingMethod]); // Ponovno pokretanje kad se vrati na kurira

  // --- EMAIL INPUT LOGIKA ---
  const handleEmailInput = (e) => {
    handleChange(e);
    const val = e.target.value;
    
    if (!val) { setShowEmailSuggestions(false); return; }
    if (val.includes("@")) {
      const [prefix, suffix] = val.split("@");
      if (!suffix && suffix !== "") { 
         const suggestions = POPULAR_DOMAINS.map(d => `${prefix}@${d}`);
         setEmailSuggestions(suggestions);
         setShowEmailSuggestions(true);
      } else {
        const matches = POPULAR_DOMAINS.filter(d => d.startsWith(suffix));
        if (matches.length > 0 && matches[0] !== suffix) {
           const suggestions = matches.map(d => `${prefix}@${d}`);
           setEmailSuggestions(suggestions);
           setShowEmailSuggestions(true);
        } else { setShowEmailSuggestions(false); }
      }
    } else {
      if (val.length > 1) {
        const suggestions = POPULAR_DOMAINS.map(d => `${val}@${d}`);
        setEmailSuggestions(suggestions);
        setShowEmailSuggestions(true);
      } else { setShowEmailSuggestions(false); }
    }

    // TRIGGER POPOUT
    if (!user && !popoverDismissed && !createAccount && val.length > 6 && val.includes("@")) {
       setShowRegPopover(true);
    }
  };

  const selectEmail = (email) => {
    handleChange({ target: { name: "email", value: email } });
    setShowEmailSuggestions(false);
    emailInputRef.current?.focus();
    if(!user && !popoverDismissed && !createAccount) setShowRegPopover(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emailInputRef.current && !emailInputRef.current.contains(e.target) && !e.target.closest('.email-dropdown')) {
        setShowEmailSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- AKCIJE REGISTRACIJE ---
  const handleConfirmReg = async () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
        flash("Nedostaju podaci", "Unesite ime i prezime iznad.", "error");
        return;
    }
    if (!formData.email && !formData.phone) {
        flash("Nedostaju podaci", "Unesite email.", "error");
        return;
    }
    if (password.length < 6) {
        flash("Greška", "Lozinka mora imati min. 6 karaktera", "error");
        return;
    }

    setIsRegistering(true);
    try {
         await register({
             identity: formData.email || formData.phone,
             password: password,
             name: `${formData.name} ${formData.surname}`
         });
         flash("Uspeh", "Nalog je kreiran.", "success");
         setShowRegPopover(false);
         setPassword("");
    } catch (err) {
         console.error("Reg failed", err);
         let msg = "Došlo je do greške.";
         if(err.code === 'auth/email-already-in-use') msg = "Email je zauzet.";
         flash("Greška", msg, "error");
    } finally {
        setIsRegistering(false);
    }
  };

  const handleDismissReg = () => {
    setShowRegPopover(false);
    setPopoverDismissed(true);
    setPassword("");
  };

  // --- PLACE ORDER ---
  const handlePlaceOrder = async () => {
    if (shippingMethod === 'pickup') {
      errors.address = null; errors.city = null; errors.postalCode = null;
    }

    if (validateAll()) {
      if (createAccount && !user && password) {
         try {
             await register({
                 identity: formData.email,
                 password: password,
                 name: `${formData.name} ${formData.surname}`
             });
         } catch (err) { /* ignore */ }
      }

      const orderId = "DAJA-" + Date.now().toString().slice(-6);
      const orderSummary = {
        id: orderId, customer: formData, items: items, subtotal: total,
        shippingCost: finalShipping, shippingMethod: shippingMethod, finalTotal: finalTotal,
        date: new Date().toLocaleDateString("sr-RS"),
      };
      setOrderData(orderSummary);
      setShowSuccessModal(true);
      dispatch({ type: "CLEAR" }); 
    } else {
      alert("Popunite obavezna polja.");
    }
  };

  const preventFormSubmit = (e) => e.preventDefault();
  const getInputClass = (n) => errors[n] ? "input-error" : "";

  return (
    <div className="container checkout-page">
      <h1 className="checkout-title">Naplata i Isporuka</h1>
      
      <form className="checkout-layout" onSubmit={preventFormSubmit} noValidate>
        <div className="checkout-left">
          
          <section className={`checkout-section card glass ${showSuccessModal ? "z-high" : ""}`}>
            <div className="section-header"><div className="step-badge">1</div><h2>Podaci za isporuku</h2></div>
            
            <div className="form-grid">
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass("name")}`}>
                  <User className="input-icon" size={18} />
                  <input type="text" name="name" placeholder="Ime" value={formData.name} onChange={handleChange} onBlur={handleBlur} required />
                </div>
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass("surname")}`}>
                  <User className="input-icon" size={18} />
                  <input type="text" name="surname" placeholder="Prezime" value={formData.surname} onChange={handleChange} onBlur={handleBlur} required />
                </div>
                {errors.surname && <span className="error-msg">{errors.surname}</span>}
              </div>

              {/* EMAIL */}
              <div className={`input-wrapper-col full-width relative-wrapper email-input-container`}>
                <div className={`input-group ${getInputClass("email")}`}>
                  <Mail className="input-icon" size={18} />
                  <input 
                    ref={emailInputRef}
                    type="email" name="email" placeholder="E-mail adresa" 
                    value={formData.email} onChange={handleEmailInput} onBlur={handleBlur} required autoComplete="off"
                  />
                  
                  {(createAccount || user) && (
                      <div className="account-ready-badge">
                          <Check size={14} /> Nalog aktivan
                      </div>
                  )}

                  {showEmailSuggestions && (
                    <ul className="email-dropdown">
                      {emailSuggestions.map((s) => (
                        <li key={s} onMouseDown={(e) => { e.preventDefault(); selectEmail(s); }}>
                          {s.split("@")[0]}<span className="domain">@{s.split("@")[1]}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              {/* TELEFON */}
              <div className="input-wrapper-col full-width">
                <div className={`input-group ${getInputClass("phone")}`}>
                  <Phone className="input-icon" size={18} />
                  <input type="tel" name="phone" placeholder="Telefon (npr. 064...)" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required />
                </div>
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <AnimatePresence>
                {requiredForCourier && (
                  <motion.div className="full-width form-grid" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ gridColumn: '1 / -1', overflow: 'hidden' }}>
                    <div className="input-wrapper-col full-width">
                      <div className={`input-group ${getInputClass("address")}`}>
                        <MapPin className={`input-icon ${!mapsReady ? "opacity-50" : ""}`} size={18} />
                        <input ref={addressInputRef} type="text" name="address" placeholder={mapsReady ? "Počnite da kucate ulicu..." : "Učitavanje mape..."} value={formData.address} onChange={handleChange} onBlur={handleBlur} required={requiredForCourier} autoComplete="off" disabled={!mapsReady} />
                        {!mapsReady && <div style={{position:'absolute',right:12}}><Loader2 size={18} className="animate-spin text-muted"/></div>}
                      </div>
                      {errors.address && <span className="error-msg">{errors.address}</span>}
                    </div>
                    <div className="input-wrapper-col">
                      <div className="input-group">
                        <input type="text" name="city" placeholder="Grad" value={formData.city} onChange={handleChange} required={requiredForCourier} className="pl-4" />
                      </div>
                    </div>
                    <div className="input-wrapper-col">
                      <div className={`input-group ${getInputClass("postalCode")}`}>
                        <input type="text" name="postalCode" placeholder="Poštanski broj" value={formData.postalCode} onChange={handleChange} onBlur={handleBlur} required={requiredForCourier} className="pl-4" />
                      </div>
                      {errors.postalCode && <span className="error-msg">{errors.postalCode}</span>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* --- REGISTRACIJA POPOUT --- */}
              <AnimatePresence>
                {showRegPopover && !user && (
                    <motion.div 
                        className="reg-popover full-width"
                        style={{ gridColumn: '1 / -1' }}
                        initial={{ opacity: 0, y: 10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 10, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="reg-popover-header">
                            <div>
                                <div className="reg-popover-title">
                                    <UserPlus size={18} className="text-primary mr-2" />
                                    Novi kupac? Kreirajte nalog odmah.
                                </div>
                                <span className="reg-popover-desc">Unesite lozinku i registrujte se za bržu kupovinu.</span>
                            </div>
                            <button type="button" className="reg-close-btn" onClick={handleDismissReg} aria-label="Zatvori">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <Lock className="input-icon" size={16} style={{ color: 'var(--primary)' }} />
                            <input 
                                type="password" 
                                placeholder="Lozinka za novi nalog (min. 6)" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                // bez autofokusa
                            />
                        </div>
                        
                        <button 
                            type="button" 
                            className="reg-confirm-btn" 
                            onClick={handleConfirmReg}
                            disabled={isRegistering}
                        >
                            {isRegistering ? <Loader2 className="animate-spin" size={18}/> : "Potvrdi i Registruj se"}
                            {!isRegistering && <ArrowRight size={16} />}
                        </button>
                    </motion.div>
                )}
              </AnimatePresence>

            </div>
          </section>

          <section className="checkout-section card glass">
            <div className="section-header"><div className="step-badge">2</div><h2>Način isporuke</h2></div>
            <div className="shipping-options">
                <label className={`radio-card ${shippingMethod === 'courier' ? 'selected' : ''}`} onClick={() => setShippingMethod('courier')}>
                  <div className="radio-info">
                    <Truck size={20} className="text-primary" />
                    <div><span className="radio-title">Isporuka kurirskom službom</span><span className="radio-desc">{isFreeShipping ? 'Iznad 8.000 RSD besplatno' : `Cena: ${money(COURIER_COST)}`}</span></div>
                  </div>
                  <div className="radio-price">{finalShipping === 0 && shippingMethod === 'courier' ? <span className="text-success">Besplatna</span> : <span>{money(COURIER_COST)}</span>}</div>
                  <input type="radio" name="shipping" value="courier" checked={shippingMethod === 'courier'} hidden /><div className="radio-check"><CheckCircle2 size={16} /></div>
                </label>
                <label className={`radio-card ${shippingMethod === 'pickup' ? 'selected' : ''}`} onClick={() => setShippingMethod('pickup')}>
                  <div className="radio-info">
                    <MapPin size={20} className="text-primary" />
                    <div><span className="radio-title">Preuzimanje u prodavnici</span><span className="radio-desc">Niš, TPC Gorča lokal C31 (Uvek besplatno)</span></div>
                  </div>
                  <div className="radio-price"><span className="text-success">Besplatna</span></div>
                  <input type="radio" name="shipping" value="pickup" checked={shippingMethod === 'pickup'} hidden /><div className="radio-check"><CheckCircle2 size={16} /></div>
                </label>
            </div>
          </section>
          
          <AnimatePresence>
            {shippingMethod === 'pickup' && (
              <motion.section className="checkout-section card glass pickup-details" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '24px' }}>
                  <h3>Lokacija prodavnice:</h3>
                  <div className="location-box" style={{marginTop: '12px'}}><p style={{marginBottom: '4px', fontWeight: '700', color: 'var(--text)'}}>Daja Shop Niš</p><p style={{color: 'var(--muted)', fontSize: '0.9rem'}}>TPC Gorča lokal C31, Obrenovićeva bb, Medijana</p></div>
                </div>
                <div className="map-container"><iframe className="map-iframe" title="Daja Shop Lokacija" width="100%" height="100%" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={MAP_EMBED_URL}></iframe></div>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="checkout-section card glass">
            <div className="section-header"><div className="step-badge">3</div><h2>Način plaćanja</h2></div>
            <div className="payment-options">
              <label className={`radio-card ${payMethod==="cod"?"selected":""}`}><div className="radio-info"><div className="icon-box">💵</div><div><span className="radio-title">Plaćanje pouzećem</span><span className="radio-desc">Platite kuriru prilikom preuzimanja</span></div></div><input type="radio" name="payment" value="cod" checked={payMethod==="cod"} onChange={()=>setPayMethod("cod")} hidden /><div className="radio-check"><CheckCircle2 size={16} /></div></label>
            </div>
          </section>
        </div>

        <div className="checkout-right">
          <div className="summary-card card glass">
            <h2>Pregled porudžbine</h2>
            <div className="summary-rows">
              <div className="summary-row"><span className="muted">Međuzbir</span><span>{money(total)}</span></div>
              <div className="summary-row"><span className="muted">Isporuka</span>{finalShipping === 0 ? <span className="text-success">Besplatna</span> : <span>{money(finalShipping)}</span>}</div>
              <div className="hr"></div>
              <div className="summary-total"><span>Ukupno</span><span className="total-price">{money(finalTotal)}</span></div>
            </div>
            <button type="button" onClick={handlePlaceOrder} className="checkout-btn btn-primary">Potvrdi porudžbinu <ArrowRight size={18} /></button>
            <div className="secure-badge"><ShieldCheck size={16} /> Sigurna kupovina</div>
          </div>
        </div>
      </form>
      
      <AnimatePresence>
        {showSuccessModal && orderData && (
          <OrderConfirmationModal order={orderData} money={money} onClose={() => setShowSuccessModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}