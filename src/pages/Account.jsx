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
  ChevronDown,
  Check,
  Clock,
  Loader2,
  PenTool,
  Heart,
  Star,
  Sun,
  Coffee,
  Gamepad2,
  GraduationCap,
  Building2,
  Dumbbell,
  AlertCircle,
  X,
  Smartphone,
  MessageSquare,
  Save,
  ShieldCheck // 👈 Uvezen štit
} from "lucide-react";
import "./Account.css";

import { db, auth } from "../services/firebase"; 
import { updateProfile, linkWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

import { FORM_RULES } from "../data/validationRules";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";

// --- CONFIG ---
const ADDRESS_ICONS = {
  home: { label: "Kuća", icon: Home },
  briefcase: { label: "Posao", icon: Briefcase },
  mapPin: { label: "Lokacija", icon: MapPin },
  heart: { label: "Omiljeno", icon: Heart },
  star: { label: "Važno", icon: Star },
  sun: { label: "Vikendica", icon: Sun },
  coffee: { label: "Kafić", icon: Coffee },
  gamepad: { label: "Zabava", icon: Gamepad2 },
  school: { label: "Škola", icon: GraduationCap },
  building: { label: "Zgrada", icon: Building2 },
  gym: { label: "Trening", icon: Dumbbell },
};

const getFlagUrl = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

// Lista evropskih zemalja
const COUNTRY_CODES = [
  { code: "RS", dial: "+381", label: "Srbija" },
  { code: "ME", dial: "+382", label: "Crna Gora" },
  { code: "BA", dial: "+387", label: "BiH" },
  { code: "HR", dial: "+385", label: "Hrvatska" },
  { code: "MK", dial: "+389", label: "S. Makedonija" },
  { code: "SI", dial: "+386", label: "Slovenija" },
  { code: "DE", dial: "+49", label: "Nemačka" },
  { code: "AT", dial: "+43", label: "Austrija" },
  { code: "CH", dial: "+41", label: "Švajcarska" },
  { code: "AL", dial: "+355", label: "Albanija" },
  { code: "AD", dial: "+376", label: "Andora" },
  { code: "BE", dial: "+32", label: "Belgija" },
  { code: "BY", dial: "+375", label: "Belorusija" },
  { code: "BG", dial: "+359", label: "Bugarska" },
  { code: "CY", dial: "+357", label: "Kipar" },
  { code: "CZ", dial: "+420", label: "Češka" },
  { code: "DK", dial: "+45", label: "Danska" },
  { code: "EE", dial: "+372", label: "Estonija" },
  { code: "FI", dial: "+358", label: "Finska" },
  { code: "FR", dial: "+33", label: "Francuska" },
  { code: "GR", dial: "+30", label: "Grčka" },
  { code: "NL", dial: "+31", label: "Holandija" },
  { code: "IE", dial: "+353", label: "Irska" },
  { code: "IS", dial: "+354", label: "Island" },
  { code: "IT", dial: "+39", label: "Italija" },
  { code: "LI", dial: "+423", label: "Lihtenštajn" },
  { code: "LV", dial: "+371", label: "Letonija" },
  { code: "LT", dial: "+370", label: "Litvanija" },
  { code: "LU", dial: "+352", label: "Luksemburg" },
  { code: "HU", dial: "+36", label: "Mađarska" },
  { code: "MT", dial: "+356", label: "Malta" },
  { code: "MD", dial: "+373", label: "Moldavija" },
  { code: "MC", dial: "+377", label: "Monako" },
  { code: "NO", dial: "+47", label: "Norveška" },
  { code: "PL", dial: "+48", label: "Poljska" },
  { code: "PT", dial: "+351", label: "Portugal" },
  { code: "RO", dial: "+40", label: "Rumunija" },
  { code: "RU", dial: "+7", label: "Rusija" },
  { code: "SM", dial: "+378", label: "San Marino" },
  { code: "SK", dial: "+421", label: "Slovačka" },
  { code: "ES", dial: "+34", label: "Španija" },
  { code: "SE", dial: "+46", label: "Švedska" },
  { code: "TR", dial: "+90", label: "Turska" },
  { code: "GB", dial: "+44", label: "Velika Britanija" },
  { code: "UA", dial: "+380", label: "Ukrajina" },
  { code: "VA", dial: "+379", label: "Vatikan" }
];

const renderIcon = (iconKey, size = 20) => {
  const IconComponent = ADDRESS_ICONS[iconKey]?.icon || MapPin;
  return <IconComponent size={size} />;
};

const getInitials = (user) => {
  const name = user.displayName;
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return user.email?.[0]?.toUpperCase() || "U";
};

const ErrorMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
    animate={{ opacity: 1, y: 0, height: "auto", marginTop: 6 }}
    exit={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
    transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
    className="custom-error-popout"
  >
    <AlertCircle size={14} className="error-icon-pop" />
    <span>{message}</span>
  </motion.div>
);

// --- NAVIGATION ---
function AccountNav({ activeTab, setActiveTab, logout }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navItems = [
    { id: "profile", label: "Profil", icon: User },
    { id: "orders", label: "Porudžbine", icon: Package },
    { id: "addresses", label: "Adrese", icon: MapPin },
  ];
  const activeItem = navItems.find(item => item.id === activeTab) || navItems[0];
  const ActiveIcon = activeItem.icon;
  const handleMobileSelect = (id) => { setActiveTab(id); setIsMobileOpen(false); };

  return (
    <>
      <nav className="account-nav desktop-nav card glass">
        <div className="nav-header"><span className="nav-title">Moj Nalog</span></div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="nav-item">
                <button className={`nav-btn ${isActive ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                  {isActive && <motion.div layoutId="activeIndicator" className="active-indicator" />}
                </button>
              </li>
            );
          })}
          <li className="nav-item-logout">
            <button className="nav-btn logout-btn" onClick={logout}>
              <LogOut size={20} /><span>Odjavi se</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="mobile-nav-wrapper">
        <button className={`mobile-dropdown-trigger card glass ${isMobileOpen ? 'open' : ''}`} onClick={() => setIsMobileOpen(!isMobileOpen)}>
          <div className="trigger-content">
            <ActiveIcon size={20} style={{ color: "var(--color-primary)" }} /><span className="trigger-label">{activeItem.label}</span>
          </div>
          <ChevronDown size={20} className={`chevron ${isMobileOpen ? 'rotate' : ''}`} />
        </button>
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div className="mobile-dropdown-menu card glass" initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ duration: 0.2 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} className={`mobile-menu-item ${isActive ? 'active' : ''}`} onClick={() => handleMobileSelect(item.id)}>
                    <Icon size={18} /><span>{item.label}</span>
                    {isActive && <Check size={16} className="ml-auto" style={{ color: "var(--color-primary)" }}/>}
                  </button>
                )
              })}
              <div className="mobile-menu-divider"></div>
              <button className="mobile-menu-item logout" onClick={logout}><LogOut size={18} /><span>Odjavi se</span></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// --- PROFILE SECTION ---
function ProfileSection({ user }) {
  const { flash } = useFlash();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.displayName || "");
  
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneStep, setPhoneStep] = useState("input");
  const [newPhone, setNewPhone] = useState(user.phoneNumber || "");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [localPhone, setLocalPhone] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const [verificationId, setVerificationId] = useState(null);
  const [smsCode, setSmsCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewName(user.displayName || "");
    if (user.phoneNumber) {
      const foundCountry = COUNTRY_CODES.find(c => user.phoneNumber.startsWith(c.dial));
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        setLocalPhone(user.phoneNumber.replace(foundCountry.dial, ""));
      } else {
        setLocalPhone(user.phoneNumber);
      }
    } else {
      setLocalPhone("");
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSaveName = async () => {
    if (!newName.trim()) { flash("Greška", "Ime ne može biti prazno.", "error"); return; }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      await updateDoc(doc(db, "users", user.uid), { displayName: newName });
      flash("Uspeh", "Ime je ažurirano.", "success");
      setIsEditingName(false);
    } catch (error) { console.error(error); flash("Greška", "Greška pri ažuriranju.", "error"); } 
    finally { setLoading(false); }
  };

  const handleSendCode = async () => {
    const fullNumber = selectedCountry.dial + localPhone.replace(/^0+/, "");
    if (localPhone.length < 5) { flash("Greška", "Unesite ispravan broj telefona.", "error"); return; }
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-phone-container', { 'size': 'invisible', 'callback': () => {} });
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await linkWithPhoneNumber(auth.currentUser, fullNumber, appVerifier);
      setVerificationId(confirmationResult);
      setPhoneStep("verify");
      flash("SMS Poslat", `Kod poslat na ${fullNumber}`, "info");
    } catch (error) {
      console.error(error);
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
      flash("Greška", error.code === 'auth/invalid-phone-number' ? "Nevažeći broj." : "Greška pri slanju SMS-a.", "error");
    } finally { setLoading(false); }
  };

  const handleVerifyCode = async () => {
    if (smsCode.length < 6) { flash("Greška", "Kod mora imati 6 cifara.", "error"); return; }
    setLoading(true);
    try {
      await verificationId.confirm(smsCode);
      const fullNumber = selectedCountry.dial + localPhone.replace(/^0+/, "");
      await updateDoc(doc(db, "users", user.uid), { phoneNumber: fullNumber });
      flash("Uspeh", "Broj telefona povezan!", "success");
      setIsEditingPhone(false); setPhoneStep("input"); setSmsCode(""); setVerificationId(null);
    } catch (error) { console.error(error); flash("Greška", "Pogrešan kod.", "error"); } 
    finally { setLoading(false); }
  };

  const cancelPhoneEdit = () => {
    setIsEditingPhone(false); setPhoneStep("input"); setSmsCode(""); setIsCountryDropdownOpen(false);
    if (user.phoneNumber) {
      const foundCountry = COUNTRY_CODES.find(c => user.phoneNumber.startsWith(c.dial));
      if (foundCountry) { setSelectedCountry(foundCountry); setLocalPhone(user.phoneNumber.replace(foundCountry.dial, "")); }
    } else { setLocalPhone(""); }
    if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="section-content">
      <div id="recaptcha-phone-container"></div>

      <div className="profile-header card glass">
        <div className="profile-avatar">
          {user.photoURL ? <img src={user.photoURL} alt={user.displayName || "Avatar"} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", display: "block" }} /> : getInitials(user)}
        </div>
        <div className="profile-info">
          {isEditingName ? (
             <div style={{ maxWidth: '300px' }}>
               <h2 style={{ opacity: 0.5, fontSize: '1rem', marginBottom: '8px', color: 'var(--color-text)' }}>Izmeni ime:</h2>
             </div>
          ) : (
             <h2>{user.displayName || "Korisnik"}</h2>
          )}
          <p className="muted">{user.email}</p>
          <span className="badge">Član Daja Kluba</span>
        </div>
      </div>
      
      <div className="info-grid">
        
        {/* --- KARTICA: IME --- */}
        <div className="card glass info-card relative overflow-hidden group">
          <div className="flex justify-between items-start">
             <div className="info-label">Ime i prezime</div>
             {!isEditingName && (
               <button className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition p-1 rounded-md hover:bg-[var(--color-surface)]" onClick={() => setIsEditingName(true)}>
                 <Edit2 size={14}/>
               </button>
             )}
          </div>
          <AnimatePresence mode="wait">
            {isEditingName ? (
              <motion.div key="editing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-1">
                 <input 
                   type="text" 
                   value={newName} 
                   onChange={(e) => setNewName(e.target.value)} 
                   className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none placeholder:text-gray-400" 
                   autoFocus 
                   placeholder="Vaše ime" 
                 />
                 <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={() => { setIsEditingName(false); setNewName(user.displayName || ""); }} className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:opacity-80 transition">Otkaži</button>
                    <button onClick={handleSaveName} disabled={loading} className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-[var(--color-bg)] hover:opacity-90 transition flex items-center gap-1">{loading ? <Loader2 size={12} className="animate-spin"/> : <><Save size={12}/> Sačuvaj</>}</button>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="info-value mt-1 truncate">
                {user.displayName || "Nije uneto"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- KARTICA: EMAIL --- */}
        <div className="card glass info-card">
          <div className="info-label">Email adresa</div>
          <div className="info-value mt-1 truncate" title={user.email}>{user.email}</div>
        </div>
        
        {/* --- KARTICA: TELEFON (Sa SHIELD logikom) --- */}
        <div className="card glass info-card relative overflow-visible" data-lenis-prevent>
          <div className="flex justify-between items-start">
             <div className="info-label">Telefon</div>
             
             {/* 👇 LOGIKA: Ako postoji broj, prikaži zeleni bedž. Ako ne, prikaži plus. */}
             {user.phoneNumber ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider cursor-default select-none">
                  <ShieldCheck size={12} />
                  <span>Verifikovan</span>
                </div>
             ) : (
               !isEditingPhone && (
                 <button className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition p-1 rounded-md hover:bg-[var(--color-surface)]" onClick={() => setIsEditingPhone(true)}>
                   <Plus size={14}/>
                 </button>
               )
             )}
          </div>

          <AnimatePresence mode="wait">
            {isEditingPhone ? (
              <motion.div key="editing-phone" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-1">
                {phoneStep === "input" ? (
                   <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        {/* DROPDOWN TRIGGER */}
                        <div className="relative" ref={dropdownRef}>
                           <button 
                             type="button"
                             onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                             className="h-full bg-white border border-gray-200 rounded-lg px-2 flex items-center gap-2 text-gray-900 text-sm hover:bg-gray-50 transition-colors outline-none min-w-[100px] justify-between"
                           >
                             <span className="flex items-center gap-2">
                               <img src={getFlagUrl(selectedCountry.code)} alt={selectedCountry.code} className="w-6 h-auto object-cover rounded-sm shadow-sm"/>
                               <span className="text-xs font-bold text-gray-600">{selectedCountry.dial}</span>
                             </span>
                             <ChevronDown size={14} className={`text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`}/>
                           </button>
                           
                           <AnimatePresence>
                             {isCountryDropdownOpen && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                 className="absolute top-full left-0 mt-1 w-[280px] max-h-[300px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[60] country-dropdown-scroll"
                               >
                                 {COUNTRY_CODES.map((country) => (
                                   <button
                                     key={country.code}
                                     type="button"
                                     onClick={() => { setSelectedCountry(country); setIsCountryDropdownOpen(false); }}
                                     className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                   >
                                     <img src={getFlagUrl(country.code)} alt={country.code} className="w-6 h-auto object-cover rounded-sm shadow-sm"/>
                                     <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{country.label}</span>
                                        <span className="text-xs text-gray-500 font-medium">{country.dial}</span>
                                     </div>
                                     {selectedCountry.code === country.code && <Check size={18} className="ml-auto text-green-600"/>}
                                   </button>
                                 ))}
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>

                        <div className="relative flex-1 min-w-0">
                          <input 
                            type="tel" 
                            value={localPhone} 
                            onChange={(e) => setLocalPhone(e.target.value)}
                            className="w-full h-full bg-white border border-gray-200 rounded-lg pl-3 pr-3 py-2 text-gray-900 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none placeholder:text-gray-400"
                            placeholder="64 123 4567"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button onClick={cancelPhoneEdit} className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:opacity-80 transition">Otkaži</button>
                        <button onClick={handleSendCode} disabled={loading} className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-primary)] text-[var(--color-bg)] hover:opacity-90 transition flex items-center gap-1">
                          {loading ? <Loader2 size={12} className="animate-spin"/> : "Pošalji kod"}
                        </button>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Kod poslat na {selectedCountry.dial} {localPhone}</p>
                      <div className="relative">
                        <MessageSquare size={14} className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                          type="text" 
                          value={smsCode} 
                          onChange={(e) => setSmsCode(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-gray-900 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none placeholder:text-gray-400"
                          placeholder="123456"
                          autoFocus
                          maxLength={6}
                        />
                      </div>
                      <div className="flex gap-2 mt-1 justify-end">
                        <button onClick={cancelPhoneEdit} className="text-xs font-bold px-3 py-1.5 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:opacity-80 transition">Otkaži</button>
                        <button onClick={handleVerifyCode} disabled={loading} className="text-xs font-bold px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-500 transition flex items-center gap-1">
                          {loading ? <Loader2 size={12} className="animate-spin"/> : "Potvrdi"}
                        </button>
                      </div>
                   </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="view-phone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="info-value mt-1 truncate">
                {user.phoneNumber || "Nije uneto"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}

// --- ADDRESS SECTION (Ostaje isto) ---
function AddressSection({ user }) {
  const { flash } = useFlash();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitCount, setSubmitCount] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const addressInputRef = useRef(null);
  const initialFormState = { label: "Kuća", icon: "home", name: user.displayName || "", address: "", city: "", zip: "", phone: user.phoneNumber || "" };
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAddresses(data); setLoading(false);
    }, () => setLoading(false));
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
          setErrors(prev => ({ ...prev, address: null, city: null, zip: null }));
        });
        return true;
      }
      return false;
    };
    if (!initGooglePlaces()) { const i = setInterval(() => { if (initGooglePlaces()) clearInterval(i); }, 500); return () => clearInterval(i); }
    return () => { if (autocomplete) window.google.maps.event.clearInstanceListeners(autocomplete); const pac = document.querySelector(".pac-container"); if (pac) pac.remove(); };
  }, [isAdding]);

  const validateField = (name, value) => {
    if (name === "name" && !FORM_RULES.name.regex.test(value)) return FORM_RULES.name.message;
    if (name === "address" && !FORM_RULES.address.regex.test(value)) return FORM_RULES.address.message;
    if (name === "city" && (!value || value.trim().length < 2)) return "Unesite validan naziv grada.";
    if (name === "zip" && !FORM_RULES.postalCode.regex.test(value)) return FORM_RULES.postalCode.message;
    if (name === "phone" && !FORM_RULES.phone.regex.test(value)) return FORM_RULES.phone.message;
    return null;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleEdit = (addr) => {
    setForm({ label: addr.label, icon: addr.icon || "mapPin", name: addr.name, address: addr.address, city: addr.city, zip: addr.zip, phone: addr.phone });
    setEditingId(addr.id); setIsAdding(true); setErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false); setEditingId(null); setForm(initialFormState); setErrors({}); setSubmitCount(0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = { name: validateField("name", form.name), address: validateField("address", form.address), city: validateField("city", form.city), zip: validateField("zip", form.zip), phone: validateField("phone", form.phone) };
    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err !== null)) { setSubmitCount(c => c + 1); return; }

    try {
      const colRef = collection(db, "users", user.uid, "addresses");
      if (editingId) {
        await updateDoc(doc(db, "users", user.uid, "addresses", editingId), { ...form, updatedAt: serverTimestamp() });
        flash("Uspeh", "Adresa izmenjena.", "success");
      } else {
        await addDoc(colRef, { ...form, createdAt: serverTimestamp() });
        flash("Uspeh", "Adresa sačuvana.", "success");
      }
      handleCancel();
    } catch (error) { console.error(error); flash("Greška", "Greška pri čuvanju.", "error"); }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try { await deleteDoc(doc(db, "users", user.uid, "addresses", deleteId)); flash("Obrisano", "Adresa uklonjena.", "info"); } 
    catch (error) { flash("Greška", "Greška pri brisanju.", "error"); } 
    finally { setDeleteId(null); }
  };

  const handleTypeSelect = (type) => {
    if (type === "Kuća") setForm({ ...form, label: "Kuća", icon: "home" });
    else if (type === "Posao") setForm({ ...form, label: "Posao", icon: "briefcase" });
    else setForm({ ...form, label: "", icon: "mapPin" }); 
  };

  const isStandardLabel = ["Kuća", "Posao"].includes(form.label);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="section-content">
      <div className="section-header-row">
        <h3>Moje adrese</h3>
        {!isAdding && (<button className="btn-primary small" onClick={() => { setEditingId(null); setForm(initialFormState); setIsAdding(true); }}><Plus size={16} /> Dodaj novu</button>)}
      </div>
      <AnimatePresence mode="popLayout">
        {isAdding && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="address-form card glass" onSubmit={handleSave} noValidate>
                <h4>{editingId ? "Izmeni adresu" : "Nova adresa"}</h4>
                <div className="form-grid">
                    <label className="full"><span>Tip adrese</span>
                        <div className="radio-group">
                           {["Kuća", "Posao"].map(type => (
                             <button type="button" key={type} className={`chip ${form.label === type ? 'active' : ''}`} onClick={() => handleTypeSelect(type)}>
                               {type === "Kuća" && <Home size={14}/>}{type === "Posao" && <Briefcase size={14}/>}{type}
                             </button>
                           ))}
                           <button type="button" className={`chip ${!isStandardLabel ? 'active' : ''}`} onClick={() => handleTypeSelect("Custom")}><PenTool size={14}/> Custom</button>
                        </div>
                        {!isStandardLabel && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                             <input type="text" placeholder="Unesite naziv..." value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} className="border-primary mb-3" autoFocus required />
                             <span>Izaberi ikonicu:</span>
                             <div className="flex gap-2 flex-wrap mt-2">
                               {Object.entries(ADDRESS_ICONS).map(([key, val]) => (
                                 <button key={key} type="button" onClick={() => setForm({ ...form, icon: key })} title={val.label} className={`p-2 rounded-lg border transition-all ${form.icon === key ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                                   <val.icon size={18} />
                                 </button>
                               ))}
                             </div>
                          </motion.div>
                        )}
                    </label>
                    <label><span>Ime i prezime</span><input name="name" value={form.name} onChange={handleInputChange} onBlur={handleBlur} placeholder="Ime i prezime" className={errors.name ? "input-error" : ""} />
                      <AnimatePresence mode="wait">{errors.name && <ErrorMessage key={`name-${submitCount}`} message={errors.name} />}</AnimatePresence>
                    </label>
                    <label className="full"><span>Ulica i broj</span><div className="input-with-icon"><MapPin size={16} className={`input-icon-left ${errors.address ? 'text-red-500' : ''}`} /><input ref={addressInputRef} name="address" value={form.address} onChange={handleInputChange} onBlur={handleBlur} placeholder="Počnite da kucate adresu..." className={errors.address ? "input-error" : ""} style={{ paddingLeft: '36px' }} /></div>
                      <AnimatePresence mode="wait">{errors.address && <ErrorMessage key={`addr-${submitCount}`} message={errors.address} />}</AnimatePresence>
                    </label>
                    <label><span>Grad</span><input name="city" value={form.city} onChange={handleInputChange} onBlur={handleBlur} placeholder="Niš" className={errors.city ? "input-error" : ""} />
                      <AnimatePresence mode="wait">{errors.city && <ErrorMessage key={`city-${submitCount}`} message={errors.city} />}</AnimatePresence>
                    </label>
                    <label><span>Poštanski broj</span><input name="zip" value={form.zip} onChange={handleInputChange} onBlur={handleBlur} placeholder="18000" className={errors.zip ? "input-error" : ""} />
                      <AnimatePresence mode="wait">{errors.zip && <ErrorMessage key={`zip-${submitCount}`} message={errors.zip} />}</AnimatePresence>
                    </label>
                    <label className="full"><span>Telefon</span><input name="phone" value={form.phone} onChange={handleInputChange} onBlur={handleBlur} placeholder="064..." className={errors.phone ? "input-error" : ""} />
                      <AnimatePresence mode="wait">{errors.phone && <ErrorMessage key={`phone-${submitCount}`} message={errors.phone} />}</AnimatePresence>
                    </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={handleCancel}>Otkaži</button>
                  <button type="submit" className="btn-primary">{editingId ? "Izmeni" : "Sačuvaj"}</button>
                </div>
            </motion.form>
        )}
      </AnimatePresence>
      <div className="addresses-grid">
        {loading ? (<div className="loading-state"><Loader2 className="animate-spin" size={32} /><p>Učitavanje...</p></div>) : addresses.length === 0 && !isAdding ? (<div className="empty-state"><MapPin size={48} className="text-muted" style={{opacity: 0.3}} /><p>Nemate sačuvanih adresa.</p></div>) : (
            addresses.map(addr => (
                <motion.div layout key={addr.id} className="address-card card glass">
                    <div className="addr-header">
                        <span className="addr-label">
                            {addr.icon ? renderIcon(addr.icon, 14) : (addr.label === "Kuća" ? <Home size={14}/> : addr.label === "Posao" ? <Briefcase size={14}/> : <MapPin size={14}/>)}
                            {addr.label}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-icon-danger" onClick={() => handleEdit(addr)} title="Izmeni" style={{ color: "var(--color-text)" }}><Edit2 size={16}/></button>
                          <button className="btn-icon-danger" onClick={() => setDeleteId(addr.id)} title="Obriši"><Trash2 size={16}/></button>
                        </div>
                    </div>
                    <div className="addr-body"><strong>{addr.name}</strong><p>{addr.address}</p><p>{addr.zip} {addr.city}</p><p className="addr-phone">{addr.phone}</p></div>
                </motion.div>
            ))
        )}
      </div>
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleConfirmDelete} title="Obriši adresu?" description="Ova adresa će biti trajno uklonjena. Da li ste sigurni?" confirmText="Obriši" isDanger={true} />
    </motion.div>
  );
}

function OrdersSection() {
    const orders = [{ id: "ORD-9281", date: "15. Nov 2023", total: "12.490 RSD", status: "Isporučeno", items: 2 }];
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