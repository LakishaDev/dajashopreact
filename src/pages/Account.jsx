import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useFlash } from "../hooks/useFlash.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Edit2,
  ChevronRight,
  ChevronDown, // <--- DODATO
  Clock,
  Loader2,
  PenTool
} from "lucide-react";
import "./Account.css";

import { db } from "../services/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

// --- KOMPONENTA: TAB NAVIGACIJA (SIDEBAR + MOBILE DROPDOWN) ---
function AccountNav({ activeTab, setActiveTab, logout }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "profile", label: "Profil", icon: User },
    { id: "orders", label: "Porudžbine", icon: Package },
    { id: "addresses", label: "Adrese", icon: MapPin },
  ];

  const activeItem = navItems.find(item => item.id === activeTab) || navItems[0];
  const ActiveIcon = activeItem.icon;

  // Funkcija za promenu taba na mobilnom
  const handleMobileSelect = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Sakriven na mobilnom) --- */}
      <nav className="account-nav desktop-nav card glass">
        <div className="nav-header">
          <span className="nav-title">Moj Nalog</span>
        </div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div layoutId="activeIndicator" className="active-indicator" />
                  )}
                </button>
              </li>
            );
          })}
          <li className="nav-item-logout">
            <button className="nav-btn logout-btn" onClick={logout}>
              <LogOut size={20} />
              <span>Odjavi se</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* --- MOBILE DROPDOWN (Vidljiv samo na mobilnom) --- */}
      <div className="mobile-nav-wrapper">
        <button 
          className={`mobile-dropdown-trigger card glass ${isMobileOpen ? 'open' : ''}`}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <div className="trigger-content">
            <ActiveIcon size={20} className="text-primary" />
            <span className="trigger-label">{activeItem.label}</span>
          </div>
          <ChevronDown size={20} className={`chevron ${isMobileOpen ? 'rotate' : ''}`} />
        </button>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div 
              className="mobile-dropdown-menu card glass"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button 
                    key={item.id}
                    className={`mobile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleMobileSelect(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {isActive && <Check size={16} className="ml-auto text-primary"/>}
                  </button>
                )
              })}
              
              <div className="mobile-menu-divider"></div>
              
              <button className="mobile-menu-item logout" onClick={logout}>
                <LogOut size={18} />
                <span>Odjavi se</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ... (Ostatak koda za ProfileSection, AddressSection, OrdersSection i Account export ostaje ISTI) ...
// (Samo kopiraj onaj donji deo fajla iz prethodnog odgovora ako ga nemaš, 
//  ali ovaj gornji deo sa AccountNav je jedino što se menja)

/* Da bi kod bio kompletan, evo i ostatka funkcija da samo kopiraš-nalepiš ceo fajl */

function ProfileSection({ user }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="section-content"
    >
      <div className="profile-header card glass">
        <div className="profile-avatar">
          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="profile-info">
          <h2>{user.displayName || "Korisnik"}</h2>
          <p className="muted">{user.email}</p>
          <span className="badge">Član Daja Kluba</span>
        </div>
      </div>

      <div className="info-grid">
        <div className="card glass info-card">
          <div className="info-label">Ime i prezime</div>
          <div className="info-value">{user.displayName || "Nije uneto"}</div>
        </div>
        <div className="card glass info-card">
          <div className="info-label">Email adresa</div>
          <div className="info-value">{user.email}</div>
        </div>
        <div className="card glass info-card">
          <div className="info-label">Telefon</div>
          <div className="info-value">{user.phoneNumber || "Nije uneto"}</div>
          <button className="edit-mini" title="Izmeni"><Edit2 size={14}/></button>
        </div>
      </div>
    </motion.div>
  );
}

function AddressSection({ user }) {
  const { flash } = useFlash();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const addressInputRef = useRef(null);

  const [form, setForm] = useState({ label: "Kuća", name: user.displayName || "", address: "", city: "", zip: "", phone: user.phoneNumber || "" });

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAddresses(data); setLoading(false);
    }, (error) => { console.error(error); setLoading(false); });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!isAdding) return;
    let autocomplete = null;
    const initGooglePlaces = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return false;
      if (addressInputRef.current) {
        autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, { componentRestrictions: { country: "rs" }, fields: ["address_components", "formatted_address"], types: ["address"] });
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
          setForm(prev => ({ ...prev, address: fullAddress || prev.address, city: city || prev.city, zip: zip || prev.zip }));
        });
        return true;
      }
      return false;
    };
    if (!initGooglePlaces()) { const i = setInterval(() => { if (initGooglePlaces()) clearInterval(i); }, 500); return () => clearInterval(i); }
    return () => { if (autocomplete) window.google.maps.event.clearInstanceListeners(autocomplete); const pac = document.querySelector(".pac-container"); if (pac) pac.remove(); };
  }, [isAdding]);

  const handleSave = async (e) => {
    e.preventDefault();
    if(!form.address || !form.city || !form.phone) { flash("Greška", "Popunite obavezna polja.", "info"); return; }
    try {
      await addDoc(collection(db, "users", user.uid, "addresses"), { ...form, label: form.label || "Adresa", createdAt: serverTimestamp() });
      setIsAdding(false); setForm({ label: "Kuća", name: user.displayName || "", address: "", city: "", zip: "", phone: "" }); flash("Uspeh", "Adresa sačuvana.", "success");
    } catch (error) { console.error(error); flash("Greška", "Greška pri čuvanju.", "error"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Obrisati adresu?")) {
        try { await deleteDoc(doc(db, "users", user.uid, "addresses", id)); flash("Obrisano", "Adresa uklonjena.", "info"); } 
        catch (error) { console.error(error); flash("Greška", "Greška pri brisanju.", "error"); }
    }
  };

  const isStandardLabel = ["Kuća", "Posao"].includes(form.label);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="section-content">
      <div className="section-header-row">
        <h3>Moje adrese</h3>
        {!isAdding && (<button className="btn-primary small" onClick={() => setIsAdding(true)}><Plus size={16} /> Dodaj novu</button>)}
      </div>
      <AnimatePresence mode="popLayout">
        {isAdding && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="address-form card glass" onSubmit={handleSave}>
                <h4>Nova adresa</h4>
                <div className="form-grid">
                    <label className="full"><span>Naziv adrese</span>
                        <div className="radio-group">
                           {["Kuća", "Posao"].map(type => (<button type="button" key={type} className={`chip ${form.label === type ? 'active' : ''}`} onClick={() => setForm({...form, label: type})}>{type === "Kuća" && <Home size={14}/>}{type === "Posao" && <Briefcase size={14}/>}{type}</button>))}
                           <button type="button" className={`chip ${!isStandardLabel ? 'active' : ''}`} onClick={() => setForm({...form, label: ""})}><PenTool size={14}/> Custom</button>
                        </div>
                        {!isStandardLabel && (<motion.input initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} type="text" placeholder="Unesite naziv..." value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} className="mt-2 border-primary" autoFocus required />)}
                    </label>
                    <label><span>Ime i prezime</span><input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Ime i prezime" required /></label>
                    <label className="full"><span>Ulica i broj</span><div className="input-with-icon"><MapPin size={16} className="input-icon-left" /><input ref={addressInputRef} value={form.address} onChange={e=>setForm({...form, address: e.target.value})} placeholder="Počnite da kucate adresu..." required autoComplete="off" style={{paddingLeft: '36px'}}/></div></label>
                    <label><span>Grad</span><input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} placeholder="Niš" required /></label>
                    <label><span>Poštanski broj</span><input value={form.zip} onChange={e=>setForm({...form, zip: e.target.value})} placeholder="18000" required /></label>
                    <label className="full"><span>Telefon</span><input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="064..." required /></label>
                </div>
                <div className="form-actions"><button type="button" className="btn-ghost" onClick={() => setIsAdding(false)}>Otkaži</button><button type="submit" className="btn-primary">Sačuvaj</button></div>
            </motion.form>
        )}
      </AnimatePresence>
      <div className="addresses-grid">
        {loading ? (<div className="loading-state"><Loader2 className="animate-spin" size={32} /><p>Učitavanje...</p></div>) : addresses.length === 0 && !isAdding ? (<div className="empty-state"><MapPin size={48} className="text-muted" style={{opacity: 0.3}} /><p>Nemate sačuvanih adresa.</p></div>) : (
            addresses.map(addr => (
                <motion.div layout key={addr.id} className="address-card card glass">
                    <div className="addr-header">
                        <span className="addr-label">{addr.label === "Kuća" && <Home size={14}/>}{addr.label === "Posao" && <Briefcase size={14}/>}{addr.label !== "Kuća" && addr.label !== "Posao" && <MapPin size={14}/>}{addr.label}</span>
                        <button className="btn-icon-danger" onClick={() => handleDelete(addr.id)} title="Obriši"><Trash2 size={16}/></button>
                    </div>
                    <div className="addr-body"><strong>{addr.name}</strong><p>{addr.address}</p><p>{addr.zip} {addr.city}</p><p className="addr-phone">{addr.phone}</p></div>
                </motion.div>
            ))
        )}
      </div>
    </motion.div>
  );
}

function OrdersSection() {
    const orders = [{ id: "ORD-9281", date: "15. Nov 2023", total: "12.490 RSD", status: "Isporučeno", items: 2 }, { id: "ORD-1102", date: "02. Okt 2023", total: "5.990 RSD", status: "Isporučeno", items: 1 }];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-content">
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-item card glass">
                        <div className="order-icon"><Package size={24} /></div>
                        <div className="order-details"><div className="order-top"><h4>{order.id}</h4><span className={`status-badge ${order.status === 'Isporučeno' ? 'success' : 'pending'}`}>{order.status}</span></div><div className="order-meta"><span><Clock size={14}/> {order.date}</span><span>•</span><span>{order.items} artikl(a)</span></div></div>
                        <div className="order-right"><div className="order-total">{order.total}</div><ChevronRight size={20} className="text-muted" /></div>
                    </div>
                ))}
                 <div className="empty-state-small"><p className="muted">Prikazano poslednjih {orders.length} porudžbina.</p></div>
            </div>
        </motion.div>
    )
}

export default function Account() {
  const { user, logout, showAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <div className="container account-page centered">
        <motion.div className="glass account-empty-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="empty-icon-wrap"><User size={48} /></div><h1>Moj nalog</h1><p className="lead">Prijavite se da biste pratili porudžbine i upravljali adresama.</p>
          <div className="auth-actions"><button className="btn-primary" onClick={() => showAuth("login")}>Prijavi se</button><button className="btn-secondary" onClick={() => showAuth("register")}>Registruj se</button></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container account-dashboard">
        <AccountNav activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />
        <main className="account-main">
            <AnimatePresence mode="wait">
                {activeTab === "profile" && <ProfileSection key="prof" user={user} />}
                {activeTab === "addresses" && <AddressSection key="addr" user={user} />}
                {activeTab === "orders" && <OrdersSection key="ord" />}
            </AnimatePresence>
        </main>
    </div>
  );
}