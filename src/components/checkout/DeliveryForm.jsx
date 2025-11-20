import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import ErrorMessage from './ErrorMessage';

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

export default function DeliveryForm({
  formData,
  errors,
  handleChange,
  handleBlur,
  submitCount,
  user,
  getInputClass,
  shippingMethod,
  requiredForCourier,
  showSuccessModal,
  // Props za registraciju
  password,
  setPassword,
  showRegPopover,
  setShowRegPopover,
  handleDismissReg,
  handleConfirmReg,
  isRegistering,
  popoverDismissed,
  createAccount,
}) {
  const addressInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const countryDropdownRef = useRef(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const currentCountry = useMemo(() => {
    const val = formData.phone;
    if (!val) return COUNTRY_CODES.find((c) => c.code === 'RS');
    const found = COUNTRY_CODES.find((c) => val.startsWith(c.dial));
    if (found) return found;
    return COUNTRY_CODES.find((c) => c.code === 'RS');
  }, [formData.phone]);

  // --- GOOGLE PLACES AUTOCOMPLETE ---
  useEffect(() => {
    if (shippingMethod === 'pickup') return;

    let autocomplete = null;
    let checkInterval = null;
    const initGooglePlaces = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places)
        return false;
      if (addressInputRef.current) {
        autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current,
          {
            componentRestrictions: { country: 'rs' },
            fields: ['address_components', 'formatted_address'],
            types: ['address'],
          }
        );
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
          if (fullAddress)
            handleChange({ target: { name: 'address', value: fullAddress } });
          if (city) handleChange({ target: { name: 'city', value: city } });
          if (zip) handleChange({ target: { name: 'postalCode', value: zip } });
        });
        setMapsReady(true);
        return true;
      }
      return false;
    };

    if (!initGooglePlaces()) {
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if (initGooglePlaces() || attempts > 20) clearInterval(checkInterval);
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (autocomplete)
        window.google.maps.event.clearInstanceListeners(autocomplete);
      const pacs = document.querySelectorAll('.pac-container');
      pacs.forEach((el) => el.remove());
    };
  }, [shippingMethod, handleChange]);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emailInputRef.current &&
        !emailInputRef.current.contains(e.target) &&
        !e.target.closest('.email-dropdown')
      ) {
        setShowEmailSuggestions(false);
      }
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
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
      const fullEmail = formData.email + prediction;
      const event = { target: { name: 'email', value: fullEmail } };
      handleChange(event);
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
    let raw = formData.phone.replace(/\s/g, '');
    let localPart = raw;
    if (currentCountry && raw.startsWith(currentCountry.dial)) {
      localPart = raw.substring(currentCountry.dial.length);
    } else if (raw.startsWith('0')) {
      localPart = raw.substring(1);
    }
    localPart = localPart.replace(/^0+/, '');
    const newValue = `${country.dial} ${localPart}`;
    handleChange({ target: { name: 'phone', value: newValue } });
    setIsCountryDropdownOpen(false);
    const inputEl = document.querySelector('input[name="phone"]');
    if (inputEl) {
      inputEl.focus();
      setTimeout(() => {
        inputEl.setSelectionRange(newValue.length, newValue.length);
      }, 10);
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    handleChange({ target: { name: 'phone', value: val } });
  };

  const handlePhoneFocus = (e) => {
    const el = e.target;
    setTimeout(() => {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }, 0);
  };

  return (
    <section
      className={`checkout-section card glass ${
        showSuccessModal ? 'z-high' : ''
      }`}
    >
      <div className="section-header">
        <div className="step-badge">1</div>
        <h2>Podaci za isporuku</h2>
      </div>
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
            {errors.name && (
              <ErrorMessage
                key={`err-name-${submitCount}`}
                message={errors.name}
              />
            )}
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
            {errors.surname && (
              <ErrorMessage
                key={`err-surname-${submitCount}`}
                message={errors.surname}
              />
            )}
          </AnimatePresence>
        </div>
        <div
          className={`input-wrapper-col full-width relative-wrapper email-input-container`}
        >
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
            {errors.email && (
              <ErrorMessage
                key={`err-email-${submitCount}`}
                message={errors.email}
              />
            )}
          </AnimatePresence>
        </div>
        <div className="input-wrapper-col full-width">
          <div
            className={`input-group ghost-container ${getInputClass('phone')}`}
          >
            <div
              className="flag-trigger-wrapper z-index-fix"
              ref={countryDropdownRef}
              style={{ left: '6px' }}
            >
              <button
                type="button"
                className="flag-btn"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              >
                <img
                  src={getFlagUrl(currentCountry?.code || 'RS')}
                  alt={currentCountry?.code}
                  className="w-5 h-auto rounded-[2px]"
                />
                <ChevronDown
                  size={12}
                  className={`transition-transform ${
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
                    className="flag-dropdown country-dropdown-scroll"
                    data-lenis-prevent
                  >
                    {COUNTRY_CODES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className="flag-item"
                        onClick={() => handleCountrySelect(country)}
                      >
                        <img
                          src={getFlagUrl(country.code)}
                          alt={country.code}
                          className="w-5"
                        />
                        <div className="flag-text">
                          <span className="font-bold text-gray-900">
                            {country.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {country.dial}
                          </span>
                        </div>
                        {currentCountry?.code === country.code && (
                          <Check size={14} className="text-success ml-auto" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Telefon"
              value={formData.phone}
              onChange={handlePhoneChange}
              onFocus={handlePhoneFocus}
              onClick={handlePhoneFocus}
              required
              className="real-input"
              style={{ paddingLeft: '75px' }}
            />
          </div>
          <AnimatePresence mode="wait">
            {errors.phone && (
              <ErrorMessage
                key={`err-phone-${submitCount}`}
                message={errors.phone}
              />
            )}
          </AnimatePresence>
        </div>
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
                    ref={addressInputRef}
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
                    autoComplete="off"
                    disabled={!mapsReady}
                  />
                  {!mapsReady && (
                    <div style={{ position: 'absolute', right: 12 }}>
                      <Loader2 size={18} className="animate-spin text-muted" />
                    </div>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {errors.address && (
                    <ErrorMessage
                      key={`err-address-${submitCount}`}
                      message={errors.address}
                    />
                  )}
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
                  {errors.city && (
                    <ErrorMessage
                      key={`err-city-${submitCount}`}
                      message={errors.city}
                    />
                  )}
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
                    <ErrorMessage
                      key={`err-postalCode-${submitCount}`}
                      message={errors.postalCode}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                    <UserPlus size={18} className="text-primary mr-2" />
                    Novi kupac? Kreirajte nalog odmah.
                  </div>
                  <span className="reg-popover-desc">
                    Unesite lozinku i registrujte se za bržu kupovinu.
                  </span>
                </div>
                <button
                  type="button"
                  className="reg-close-btn"
                  onClick={handleDismissReg}
                  aria-label="Zatvori"
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
      </div>
    </section>
  );
}
