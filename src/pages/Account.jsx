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
  Clock,
  Loader2,
  PenTool // Ikonica za Custom
} from "lucide-react";
import "./Account.css";

// --- FIREBASE IMPORTI ---
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

// --- KOMPONENTA: TAB NAVIGACIJA ---
function AccountNav({ activeTab, setActiveTab, logout }) {
  const navItems = [
    { id: "profile", label: "Profil", icon: User },
    { id: "orders", label: "Porudžbine", icon: Package },
    { id: "addresses", label: "Adrese", icon: MapPin },
  ];

  return (
    <nav className="account-nav card glass">
      <div className="nav-header">
        <span className="nav-title">Moj Nalog</span>
      </div>
      <ul className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                className={`nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="active-indicator"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="nav-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} /> Odjavi se
        </button>
      </div>
    </nav>
  );
}

// --- SEKCIJA: PROFIL ---
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

// --- SEKCIJA: ADRESE (SA GOOGLE AUTOCOMPLETE & CUSTOM LABELOM) ---
function AddressSection({ user }) {
  const { flash } = useFlash();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Ref za Google Autocomplete input
  const addressInputRef = useRef(null);

  // Forma
  const [form, setForm] = useState({
    label: "Kuća",
    name: user.displayName || "",
    address: "",
    city: "",
    zip: "",
    phone: user.phoneNumber || ""
  });

  // 1. REALTIME SLUŠANJE PROMENA (Firestore)
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "users", user.uid, "addresses"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAddresses(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore greška:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. GOOGLE AUTOCOMPLETE LOGIKA
  useEffect(() => {
    if (!isAdding) return; // Pokrećemo samo kad se otvori forma

    let autocomplete = null;
    
    const initGooglePlaces = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return false;
      
      if (addressInputRef.current) {
        autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          componentRestrictions: { country: "rs" },
          fields: ["address_components", "formatted_address"],
          types: ["address"],
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
          
          // Ažuriramo formu sa podacima iz Google-a
          setForm(prev => ({
            ...prev,
            address: fullAddress || prev.address,
            city: city || prev.city,
            zip: zip || prev.zip
          }));
        });
        return true;
      }
      return false;
    };

    // Pokušavamo inicijalizaciju dok se Google skripta ne učita
    if (!initGooglePlaces()) {
      const interval = setInterval(() => {
        if (initGooglePlaces()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
    
    // Cleanup listenera
    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
      // Uklanjanje Google dropdown kontejnera iz DOM-a (cleanup)
      const pac = document.querySelector(".pac-container");
      if (pac) pac.remove();
    };
  }, [isAdding]);

  // 3. ČUVANJE ADRESE
  const handleSave = async (e) => {
    e.preventDefault();
    if(!form.address || !form.city || !form.phone) {
        flash("Greška", "Popunite sva obavezna polja.", "info");
        return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "addresses"), {
        ...form,
        label: form.label || "Adresa", // Fallback ako je custom prazan
        createdAt: serverTimestamp(),
      });

      setIsAdding(false);
      setForm({ label: "Kuća", name: user.displayName || "", address: "", city: "", zip: "", phone: "" });
      flash("Uspeh", "Nova adresa je sačuvana.", "success");
    } catch (error) {
      console.error("Greška pri čuvanju:", error);
      flash("Greška", "Nije uspelo čuvanje adrese.", "error");
    }
  };

  // 4. BRISANJE ADRESE
  const handleDelete = async (id) => {
    if(window.confirm("Da li ste sigurni da želite da obrišete ovu adresu?")) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "addresses", id));
          flash("Obrisano", "Adresa je uklonjena.", "info");
        } catch (error) {
          console.error("Greška pri brisanju:", error);
          flash("Greška", "Nije uspelo brisanje.", "error");
        }
    }
  };

  // Helper: da li je trenutni label jedan od standardnih
  const isStandardLabel = ["Kuća", "Posao"].includes(form.label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Moje adrese</h3>
        {!isAdding && (
            <button className="btn-primary small" onClick={() => setIsAdding(true)}>
                <Plus size={16} /> Dodaj novu
            </button>
        )}
      </div>

      {/* FORMA ZA DODAVANJE */}
      <AnimatePresence mode="popLayout">
        {isAdding && (
            <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="address-form card glass"
                onSubmit={handleSave}
            >
                <h4>Nova adresa</h4>
                <div className="form-grid">
                    {/* Label selection */}
                    <label className="full">
                        <span>Naziv adrese</span>
                        <div className="radio-group">
                           {["Kuća", "Posao"].map(type => (
                               <button 
                                type="button" 
                                key={type}
                                className={`chip ${form.label === type ? 'active' : ''}`}
                                onClick={() => setForm({...form, label: type})}
                               >
                                {type === "Kuća" && <Home size={14}/>}
                                {type === "Posao" && <Briefcase size={14}/>}
                                {type}
                               </button>
                           ))}
                           
                           {/* CUSTOM DUGME */}
                           <button 
                            type="button" 
                            className={`chip ${!isStandardLabel ? 'active' : ''}`}
                            onClick={() => setForm({...form, label: ""})} // Praznimo da bi korisnik kucao
                           >
                            <PenTool size={14}/> Custom
                           </button>
                        </div>
                        
                        {/* Custom Input (prikazuje se ako nije Kuća/Posao) */}
                        {!isStandardLabel && (
                          <motion.input 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text"
                            placeholder="Unesite naziv (npr. Vikendica, Stan kod bake...)"
                            value={form.label}
                            onChange={(e) => setForm({...form, label: e.target.value})}
                            className="mt-2 border-primary"
                            autoFocus
                            required
                          />
                        )}
                    </label>

                    <label>
                        <span>Ime i prezime</span>
                        <input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} placeholder="Ime i prezime" required />
                    </label>

                    {/* ADRESA SA AUTOCOMPLETE-OM */}
                    <label className="full">
                        <span>Ulica i broj (Google pretraga)</span>
                        <div className="input-with-icon">
                           <MapPin size={16} className="input-icon-left" />
                           <input 
                             ref={addressInputRef}
                             value={form.address} 
                             onChange={e=>setForm({...form, address: e.target.value})} 
                             placeholder="Počnite da kucate adresu..." 
                             required 
                             autoComplete="off"
                             style={{paddingLeft: '36px'}}
                           />
                        </div>
                    </label>

                    <label>
                        <span>Grad</span>
                        <input value={form.city} onChange={e=>setForm({...form, city: e.target.value})} placeholder="Niš" required />
                    </label>
                    <label>
                        <span>Poštanski broj</span>
                        <input value={form.zip} onChange={e=>setForm({...form, zip: e.target.value})} placeholder="18000" required />
                    </label>
                    <label className="full">
                        <span>Telefon</span>
                        <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="064..." required />
                    </label>
                </div>
                <div className="form-actions">
                    <button type="button" className="btn-ghost" onClick={() => setIsAdding(false)}>Otkaži</button>
                    <button type="submit" className="btn-primary">Sačuvaj adresu</button>
                </div>
            </motion.form>
        )}
      </AnimatePresence>

      {/* LISTA ADRESA */}
      <div className="addresses-grid">
        {loading ? (
             <div className="loading-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Učitavanje adresa...</p>
             </div>
        ) : addresses.length === 0 && !isAdding ? (
            <div className="empty-state">
                <MapPin size={48} className="text-muted" style={{opacity: 0.3}} />
                <p>Nemate sačuvanih adresa.</p>
            </div>
        ) : (
            addresses.map(addr => (
                <motion.div layout key={addr.id} className="address-card card glass">
                    <div className="addr-header">
                        <span className="addr-label">
                            {addr.label === "Kuća" && <Home size={14}/>}
                            {addr.label === "Posao" && <Briefcase size={14}/>}
                            {/* Ako je custom label */}
                            {addr.label !== "Kuća" && addr.label !== "Posao" && <MapPin size={14}/>}
                            {addr.label}
                        </span>
                        <button className="btn-icon-danger" onClick={() => handleDelete(addr.id)} title="Obriši"><Trash2 size={16}/></button>
                    </div>
                    <div className="addr-body">
                        <strong>{addr.name}</strong>
                        <p>{addr.address}</p>
                        <p>{addr.zip} {addr.city}</p>
                        <p className="addr-phone">{addr.phone}</p>
                    </div>
                </motion.div>
            ))
        )}
      </div>
    </motion.div>
  );
}

// --- SEKCIJA: PORUDŽBINE (MOCK - placeholder za sada) ---
function OrdersSection() {
    const orders = [
        { id: "ORD-9281", date: "15. Nov 2023", total: "12.490 RSD", status: "Isporučeno", items: 2 },
        { id: "ORD-1102", date: "02. Okt 2023", total: "5.990 RSD", status: "Isporučeno", items: 1 },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-content">
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-item card glass">
                        <div className="order-icon">
                            <Package size={24} />
                        </div>
                        <div className="order-details">
                            <div className="order-top">
                                <h4>{order.id}</h4>
                                <span className={`status-badge ${order.status === 'Isporučeno' ? 'success' : 'pending'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="order-meta">
                                <span><Clock size={14}/> {order.date}</span>
                                <span>•</span>
                                <span>{order.items} artikl(a)</span>
                            </div>
                        </div>
                        <div className="order-right">
                            <div className="order-total">{order.total}</div>
                            <ChevronRight size={20} className="text-muted" />
                        </div>
                    </div>
                ))}
                 <div className="empty-state-small">
                    <p className="muted">Prikazano poslednjih {orders.length} porudžbina.</p>
                </div>
            </div>
        </motion.div>
    )
}

// === GLAVNA KOMPONENTA ===
export default function Account() {
  const { user, logout, showAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <div className="container account-page centered">
        <motion.div
          className="glass account-empty-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="empty-icon-wrap">
            <User size={48} />
          </div>
          <h1>Moj nalog</h1>
          <p className="lead">Prijavite se da biste pratili porudžbine i upravljali adresama.</p>
          <div className="auth-actions">
            <button className="btn-primary" onClick={() => showAuth("login")}>
              Prijavi se
            </button>
            <button className="btn-secondary" onClick={() => showAuth("register")}>
              Registruj se
            </button>
          </div>
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