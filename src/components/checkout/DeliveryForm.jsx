import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  ArrowRightToLine,
  MapPin,
  Loader2,
  ChevronDown,
  Check,
  UserPlus,
  X,
  Lock,
  ArrowRight,
  Phone,
  Home,
  Briefcase,
  Plus,
  Building2,
  Heart,
  MessageSquare, // Dodata ikonica za napomenu
} from 'lucide-react';
import ErrorMessage from './ErrorMessage';

// --- FIREBASE IMPORTI ---
import { db } from '../../services/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

// Konstante
const getFlagUrl = (code) =>
  `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
const COUNTRY_CODES = [
  { code: 'RS', dial: '+381', label: 'Srbija' },
  { code: 'ME', dial: '+382', label: 'Crna Gora' },
  { code: 'BA', dial: '+387', label: 'BiH' },
  { code: 'HR', dial: '+385', label: 'Hrvatska' },
  { code: 'MK', dial: '+389', label: 'S. Makedonija' },
  { code: 'SI', dial: '+386', label: 'Slovenija' },
  { code: 'DE', dial: '+49', label: 'Nemačka' },
  { code: 'AT', dial: '+43', label: 'Austrija' },
  { code: 'CH', dial: '+41', label: 'Švajcarska' },
];
const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'yahoo.co.uk',
];

// ************************************************************
// GOOGLE MAPS LOADER
// ************************************************************
function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }
    if (document.getElementById('google-maps-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';

    script.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        resolve();
      } else {
        reject(new Error('Google Maps API error.'));
      }
    };
    script.onerror = () => reject(new Error('Google Maps load failed.'));
    document.head.appendChild(script);
  });
}

export default function DeliveryForm({
  formData,
  setFormData,
  errors,
  handleChange,
  handleBlur,
  submitCount,
  user,
  getInputClass,
  shippingMethod,
  requiredForCourier,
  showSuccessModal,
  password,
  setPassword,
  showRegPopover,
  setShowRegPopover,
  handleDismissReg,
  handleConfirmReg,
  isRegistering,
  popoverDismissed,
  createAccount,
  // Props za napomenu
  orderNote,
  setOrderNote,
}) {
  const emailInputRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const autocompleteInstance = useRef(null);
  const addressInputRef = useRef(null);
  const addressSelectorRef = useRef(null);

  const hasAutoSelected = useRef(false);

  const [mapsReady, setMapsReady] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [mapsScriptLoaded, setMapsScriptLoaded] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  const { phonePrefix, localPhone } = useMemo(() => {
    const fullNumber = formData.phone || '';
    const sortedCodes = [...COUNTRY_CODES].sort(
      (a, b) => b.dial.length - a.dial.length
    );
    const found = sortedCodes.find((c) => fullNumber.startsWith(c.dial));

    if (found) {
      return {
        phonePrefix: found.dial,
        localPhone: fullNumber.replace(found.dial, '').trim(),
      };
    }
    return { phonePrefix: '+381', localPhone: fullNumber };
  }, [formData.phone]);

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.dial === phonePrefix) ||
    COUNTRY_CODES.find((c) => c.code === 'RS');

  const selectAddress = (addr) => {
    if (!addr) {
      setSelectedAddressId('new');
      if (setFormData) {
        setFormData((prev) => ({
          ...prev,
          address: '',
          city: '',
          postalCode: '',
        }));
      }
    } else {
      setSelectedAddressId(addr.id);
      const fullName = addr.name || '';
      const parts = fullName.trim().split(/\s+/);
      const fName = parts[0] || '';
      const lName = parts.slice(1).join(' ') || '';

      if (setFormData) {
        setFormData((prev) => ({
          ...prev,
          name: fName,
          surname: lName,
          phone: addr.phone || '',
          address: addr.address || '',
          city: addr.city || '',
          postalCode: addr.zip || '',
          email: prev.email || user?.email || '',
        }));
      }
    }
    setIsAddressSelectorOpen(false);
  };

  useEffect(() => {
    hasAutoSelected.current = false;
    const fetchAddresses = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'users', user.uid, 'addresses'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const addresses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedAddresses(addresses);
      } catch (err) {
        console.error('Error fetching addresses', err);
      }
    };
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (savedAddresses.length > 0 && !hasAutoSelected.current) {
      selectAddress(savedAddresses[0]);
      hasAutoSelected.current = true;
    }
  }, [savedAddresses]);

  const getAddressIcon = (addr, size = 18) => {
    if (!addr)
      return <Plus size={size} className="text-[var(--color-primary)]" />;
    if (addr.icon) {
      switch (addr.icon) {
        case 'home':
          return <Home size={size} className="text-[var(--color-primary)]" />;
        case 'briefcase':
          return (
            <Briefcase size={size} className="text-[var(--color-primary)]" />
          );
        case 'building':
          return (
            <Building2 size={size} className="text-[var(--color-primary)]" />
          );
        case 'heart':
          return <Heart size={size} className="text-[var(--color-primary)]" />;
        case 'mapPin':
          return <MapPin size={size} className="text-[var(--color-primary)]" />;
        default:
          return <MapPin size={size} className="text-[var(--color-primary)]" />;
      }
    }
    if (addr.label === 'Kuća')
      return <Home size={size} className="text-[var(--color-primary)]" />;
    if (addr.label === 'Posao')
      return <Briefcase size={size} className="text-[var(--color-primary)]" />;
    return <MapPin size={size} className="text-[var(--color-primary)]" />;
  };

  const getSelectedAddressLabel = () => {
    if (selectedAddressId === 'new') return 'Nova adresa (Ručni unos)';
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    return addr ? `${addr.label || 'Adresa'} - ${addr.address}` : 'Nova adresa';
  };

  const getSelectedAddressIcon = () => {
    if (selectedAddressId === 'new')
      return <Plus size={18} className="text-[var(--color-primary)]" />;
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    return getAddressIcon(addr, 18);
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setMapsReady(false);
      return;
    }
    loadGoogleMapsScript(apiKey)
      .then(() => {
        setMapsScriptLoaded(true);
        if (addressInputRef.current) initAutocomplete(addressInputRef.current);
      })
      .catch(() => setMapsReady(false));
  }, []);

  const initAutocomplete = (node) => {
    if (!window.google || !window.google.maps || !window.google.maps.places)
      return;

    // Ako već ima klasu, znači da je init odrađen
    if (node.classList.contains('pac-target-input')) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(node, {
        componentRestrictions: { country: 'rs' },
        fields: ['address_components', 'formatted_address'],
        types: ['address'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;
        let street = '',
          number = '',
          city = '',
          zip = '';
        place.address_components.forEach((comp) => {
          const types = comp.types;
          if (types.includes('route')) street = comp.long_name;
          if (types.includes('street_number')) number = comp.long_name;
          if (types.includes('locality')) city = comp.long_name;
          if (!city && types.includes('administrative_area_level_2'))
            city = comp.long_name;
          if (types.includes('postal_code')) zip = comp.long_name;
        });
        const fullAddress = number ? `${street} ${number}` : street;

        if (setFormData) {
          setFormData((prev) => ({
            ...prev,
            address: fullAddress || prev.address,
            city: city || prev.city,
            postalCode: zip || prev.postalCode,
          }));
        } else {
          if (fullAddress)
            handleChange({ target: { name: 'address', value: fullAddress } });
          if (city) handleChange({ target: { name: 'city', value: city } });
          if (zip) handleChange({ target: { name: 'postalCode', value: zip } });
        }
      });
      autocompleteInstance.current = autocomplete;
      setMapsReady(true);
    } catch (error) {
      setMapsReady(false);
    }
  };

  const onAddressInputMount = useCallback(
    (node) => {
      addressInputRef.current = node;
      if (node && mapsScriptLoaded) {
        // [FIX] Resetujemo instancu da dozvolimo ponovnu inicijalizaciju
        // jer je stari node uništen pri promeni taba
        autocompleteInstance.current = null;
        initAutocomplete(node);
      }
    },
    [mapsScriptLoaded]
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emailInputRef.current &&
        !emailInputRef.current.contains(e.target) &&
        !e.target.closest('.email-dropdown')
      )
        setShowEmailSuggestions(false);
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      )
        setIsCountryDropdownOpen(false);
      if (
        addressSelectorRef.current &&
        !addressSelectorRef.current.contains(e.target)
      )
        setIsAddressSelectorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmailInput = (e) => {
    handleChange(e);
    const val = e.target.value;
    if (!val) {
      setShowEmailSuggestions(false);
      setPrediction('');
      return;
    }
    let newPrediction = '';
    if (val.includes('@')) {
      const [prefix, suffix] = val.split('@');
      if (suffix !== undefined) {
        const match = POPULAR_DOMAINS.find((d) => d.startsWith(suffix));
        if (match && match !== suffix)
          newPrediction = match.slice(suffix.length);
      }
      if (!suffix && suffix !== '') {
        const suggestions = POPULAR_DOMAINS.map((d) => `${prefix}@${d}`);
        setEmailSuggestions(suggestions);
        setShowEmailSuggestions(true);
      } else {
        const matches = POPULAR_DOMAINS.filter((d) => d.startsWith(suffix));
        if (matches.length > 0 && matches[0] !== suffix) {
          const suggestions = matches.map((d) => `${prefix}@${d}`);
          setEmailSuggestions(suggestions);
          setShowEmailSuggestions(true);
        } else {
          setShowEmailSuggestions(false);
        }
      }
    } else {
      if (val.length > 1) {
        const suggestions = POPULAR_DOMAINS.map((d) => `${val}@${d}`);
        setEmailSuggestions(suggestions);
        setShowEmailSuggestions(true);
      } else {
        setShowEmailSuggestions(false);
      }
    }
    setPrediction(newPrediction);
    if (
      !user &&
      !popoverDismissed &&
      !createAccount &&
      val.length > 6 &&
      val.includes('@')
    ) {
      setShowRegPopover(true);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Tab' && prediction) {
      e.preventDefault();
      handleChange({
        target: { name: 'email', value: formData.email + prediction },
      });
      setPrediction('');
      setShowEmailSuggestions(false);
    }
  };
  const selectEmail = (email) => {
    handleChange({ target: { name: 'email', value: email } });
    setShowEmailSuggestions(false);
    setPrediction('');
    emailInputRef.current?.focus();
    if (!user && !popoverDismissed && !createAccount) setShowRegPopover(true);
  };
  const handleCountrySelect = (country) => {
    const full = `${country.dial} ${localPhone}`;
    handleChange({ target: { name: 'phone', value: full } });
    setIsCountryDropdownOpen(false);
  };
  const handleLocalPhoneChange = (e) => {
    const val = e.target.value;
    const full = `${phonePrefix} ${val}`;
    handleChange({ target: { name: 'phone', value: full } });
  };

  return (
    <section
      className={`checkout-section card glass ${
        showSuccessModal ? 'z-high' : ''
      }`}
    >
      {/* ... STILOVI ... */}
      <style>{`
        /* ... Tvoji postojeći stilovi za adresu i mape ... */
        .address-selector-wrapper { position: relative; margin-bottom: 24px; z-index: 40; }
        .address-selector-btn { width: 100%; display: flex; align-items: center; justify-content: space-between; background: var(--color-surface); border: 1px solid var(--color-border); padding: 14px 16px; border-radius: 12px; color: var(--color-text); font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .address-selector-btn:hover { background: var(--color-bg-subtle); border-color: var(--color-primary); }
        .address-dropdown-list { position: absolute; top: 100%; left: 0; width: 100%; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; margin-top: 8px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); overflow: hidden; z-index: 100; }
        .addr-option { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; text-align: left; border: none; background: transparent; color: var(--color-muted); cursor: pointer; border-bottom: 1px solid var(--color-border); transition: all 0.2s; }
        .addr-option:last-child { border-bottom: none; }
        .addr-option:hover { background: var(--color-bg-subtle); color: var(--color-text); }
        .addr-option.active { background: var(--color-bg-subtle); color: var(--color-primary); }
        .pac-container { background-color: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); font-family: inherit; z-index: 99999 !important; margin-top: 6px; }
        .pac-item { border-top: none; padding: 10px 14px; cursor: pointer; color: var(--color-text); }
        .pac-item:hover { background-color: var(--color-bg-subtle); }
        .pac-item-query { color: var(--color-text); font-weight: 700; }
        .pac-item span { color: var(--color-muted); }
        .pac-logo:after { filter: grayscale(1) opacity(0.5); margin: 8px 12px; }
      `}</style>

      <div className="section-header">
        <div className="step-badge">1</div>
        <h2>Podaci za isporuku</h2>
      </div>

      {/* --- ADDRESS SELECTOR --- */}
      {user && savedAddresses.length > 0 && (
        <div className="address-selector-wrapper" ref={addressSelectorRef}>
          <button
            type="button"
            className="address-selector-btn"
            onClick={() => setIsAddressSelectorOpen(!isAddressSelectorOpen)}
          >
            <div className="flex items-center gap-3">
              {getSelectedAddressIcon()}
              <span>{getSelectedAddressLabel()}</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isAddressSelectorOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {isAddressSelectorOpen && (
              <motion.div
                className="address-dropdown-list"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    className={`addr-option ${
                      selectedAddressId === addr.id ? 'active' : ''
                    }`}
                    onClick={() => selectAddress(addr)}
                  >
                    {getAddressIcon(addr)}
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[var(--color-text)]">
                        {addr.label || 'Adresa'}
                      </span>
                      <span className="text-xs opacity-70">
                        {addr.address}, {addr.city}
                      </span>
                    </div>
                    {selectedAddressId === addr.id && (
                      <Check
                        size={16}
                        className="ml-auto text-[var(--color-primary)]"
                      />
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  className={`addr-option ${
                    selectedAddressId === 'new' ? 'active' : ''
                  }`}
                  onClick={() => selectAddress(null)}
                >
                  <Plus size={16} />
                  <span className="font-bold text-sm">
                    Nova adresa (Ručni unos)
                  </span>
                  {selectedAddressId === 'new' && (
                    <Check
                      size={16}
                      className="ml-auto text-[var(--color-primary)]"
                    />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- FORMA --- */}
      <div className="form-grid">
        <div className="input-wrapper-col">
          <div className={`input-group ${getInputClass('name')}`}>
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
          <AnimatePresence mode="wait">
            {errors.name && <ErrorMessage message={errors.name} />}
          </AnimatePresence>
        </div>
        <div className="input-wrapper-col">
          <div className={`input-group ${getInputClass('surname')}`}>
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
          <AnimatePresence mode="wait">
            {errors.surname && <ErrorMessage message={errors.surname} />}
          </AnimatePresence>
        </div>

        {/* EMAIL */}
        <div className="input-wrapper-col full-width relative-wrapper email-input-container">
          <div
            className={`input-group ghost-container ${getInputClass('email')}`}
          >
            <div className="ghost-overlay" style={{ paddingLeft: '42px' }}>
              <span className="invisible-text">{formData.email}</span>
              <span className="prediction-text">{prediction}</span>
              {prediction && (
                <span className="tab-hint-inline">
                  <ArrowRightToLine size={10} /> Tab
                </span>
              )}
            </div>
            <Mail className="input-icon z-index-fix" size={18} />
            <input
              ref={emailInputRef}
              type="email"
              name="email"
              placeholder="E-mail adresa"
              value={formData.email}
              onChange={handleEmailInput}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              required
              autoComplete="email"
              className="real-input"
            />
            {showEmailSuggestions && (
              <ul className="email-dropdown">
                {emailSuggestions.map((s) => (
                  <li
                    key={s}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectEmail(s);
                    }}
                  >
                    {s.split('@')[0]}
                    <span className="domain">@{s.split('@')[1]}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <AnimatePresence mode="wait">
            {errors.email && <ErrorMessage message={errors.email} />}
          </AnimatePresence>
        </div>

        {/* TELEFON */}
        <div className="input-wrapper-col full-width">
          <div className="flex gap-2">
            <div
              className="relative w-[110px] shrink-0"
              ref={countryDropdownRef}
            >
              <button
                type="button"
                className="w-full p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] flex items-center justify-between gap-2 transition-colors hover:bg-[var(--color-bg-subtle)] h-full"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={getFlagUrl(selectedCountry.code)}
                    alt={selectedCountry.code}
                    className="w-5 h-auto rounded-[2px]"
                  />
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {selectedCountry.dial}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[var(--color-muted)] transition-transform ${
                    isCountryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {isCountryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-1 w-[240px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 max-h-[250px] overflow-y-auto country-dropdown-scroll"
                    data-lenis-prevent
                  >
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-all rounded-md"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <img
                          src={getFlagUrl(country.code)}
                          alt={country.code}
                          className="w-5 h-auto rounded-[2px]"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-[var(--color-text)]">
                            {country.label}
                          </span>
                          <span className="text-xs text-[var(--color-muted)]">
                            {country.dial}
                          </span>
                        </div>
                        {selectedCountry.code === country.code && (
                          <Check
                            size={16}
                            className="text-[var(--color-primary)] ml-auto"
                          />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative flex-1">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                size={18}
              />
              <input
                type="tel"
                name="phone-local"
                placeholder="64 1234567"
                style={{ paddingLeft: 36 }}
                value={localPhone}
                onChange={handleLocalPhoneChange}
                required
                className={`w-full p-3 pl-10 bg-[var(--color-surface)] rounded-xl border ${
                  errors.phone
                    ? 'border-red-500'
                    : 'border-[var(--color-border)]'
                } focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text)] placeholder:text-[var(--color-muted)]`}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {errors.phone && <ErrorMessage message={errors.phone} />}
          </AnimatePresence>
        </div>

        {/* ADRESA (Pojavljuje se samo za kurira) */}
        <AnimatePresence>
          {requiredForCourier && (
            <motion.div
              className="full-width form-grid"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ gridColumn: '1 / -1', overflow: 'hidden' }}
            >
              <div className="input-wrapper-col full-width">
                <div className={`input-group ${getInputClass('address')}`}>
                  <MapPin
                    className={`input-icon ${!mapsReady ? 'opacity-50' : ''}`}
                    size={18}
                  />
                  <input
                    ref={onAddressInputMount}
                    type="text"
                    name="address"
                    placeholder={
                      mapsReady
                        ? 'Počnite da kucate ulicu...'
                        : 'Učitavanje mape...'
                    }
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={requiredForCourier}
                    autoComplete="new-password"
                  />
                  {!mapsReady && (
                    <div style={{ position: 'absolute', right: 12 }}>
                      <Loader2 size={18} className="animate-spin text-muted" />
                    </div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {errors.address && <ErrorMessage message={errors.address} />}
                </AnimatePresence>
              </div>
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass('city')}`}>
                  <input
                    type="text"
                    name="city"
                    placeholder="Grad"
                    value={formData.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={requiredForCourier}
                    className="pl-4"
                  />
                </div>
                <AnimatePresence mode="wait">
                  {errors.city && <ErrorMessage message={errors.city} />}
                </AnimatePresence>
              </div>
              <div className="input-wrapper-col">
                <div className={`input-group ${getInputClass('postalCode')}`}>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Poštanski broj"
                    value={formData.postalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={requiredForCourier}
                    className="pl-4"
                  />
                </div>
                <AnimatePresence mode="wait">
                  {errors.postalCode && (
                    <ErrorMessage message={errors.postalCode} />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REGISTER POPOUT */}
        <AnimatePresence>
          {showRegPopover && !user && (
            <motion.div
              className="reg-popover full-width"
              style={{ gridColumn: '1 / -1' }}
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="reg-popover-header">
                <div>
                  <div className="reg-popover-title">
                    <UserPlus size={18} className="text-primary mr-2" /> Novi
                    kupac? Kreirajte nalog odmah.
                  </div>
                  <span className="reg-popover-desc">
                    Unesite lozinku i registrujte se za bržu kupovinu.
                  </span>
                </div>
                <button
                  type="button"
                  className="reg-close-btn"
                  onClick={handleDismissReg}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <Lock
                  className="input-icon"
                  size={16}
                  style={{ color: 'var(--primary)' }}
                />
                <input
                  type="password"
                  placeholder="Lozinka za novi nalog (min. 6)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="button"
                className="reg-confirm-btn"
                onClick={handleConfirmReg}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  'Potvrdi i Registruj se'
                )}
                {!isRegistering && <ArrowRight size={16} />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- [NOVO] NAPOMENA (Sakrivena za lično preuzimanje) --- */}
        <AnimatePresence>
          {requiredForCourier && (
            <motion.div
              className="input-wrapper-col full-width"
              style={{ gridColumn: '1 / -1', marginTop: '10px' }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2 block flex items-center gap-2">
                <MessageSquare
                  size={14}
                  className="text-[var(--color-primary)]"
                />
                Napomena za kurira (Opciono)
              </label>
              <div
                className="input-group"
                style={{ height: 'auto', padding: '0' }}
              >
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Npr. interfon ne radi, ostavite kod komšije..."
                  rows={3}
                  className="w-full p-4 bg-transparent focus:outline-none text-[var(--color-text)] placeholder:text-[var(--color-muted)] resize-none"
                  style={{
                    minHeight: '100px',
                    fontFamily: 'inherit',
                    lineHeight: '1.5',
                    border: 'none',
                    display: 'block',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* --------------------------------------------------------- */}
      </div>
    </section>
  );
}
