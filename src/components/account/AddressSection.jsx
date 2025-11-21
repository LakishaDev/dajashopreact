import React, { useState, useEffect, useRef } from 'react';
import { useFlash } from '../../hooks/useFlash.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Edit2,
  PenTool,
  Loader2,
} from 'lucide-react';

import { db } from '../../services/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

// Uvezeni eksterni resursi
import { FORM_RULES } from '../../data/validationRules';
import ConfirmModal from '../modals/ConfirmModal.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';
import { ADDRESS_ICONS, renderIcon } from '../../utils/accountHelpers.jsx';

// *** KLJUČNO: Korišćenje Vite varijable okruženja za API ključ ***
const GMAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

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

  const initialFormState = {
    label: 'Kuća',
    icon: 'home',
    name: user.displayName || '',
    address: '',
    city: '',
    zip: '',
    phone: user.phoneNumber || '',
  };
  const [form, setForm] = useState(initialFormState);

  // --- REAL-TIME DATA FETCHING (Firebase Firestore) ---
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'users', user.uid, 'addresses'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddresses(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [user]);

  // --- DYNAMIC GOOGLE MAPS SCRIPT LOADING ---
  useEffect(() => {
    // Ako nismo u modu dodavanja/izmena ILI je skripta već učitana, ne radimo ništa
    if (!isAdding || (window.google && window.google.maps)) {
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) return;

    // Kreiranje novog Script taga
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_API_KEY}&libraries=places&language=sr`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';

    document.head.appendChild(script);
  }, [isAdding]);

  // --- GOOGLE PLACES AUTOCOMPLETE INITIALIZATION ---
  useEffect(() => {
    if (!isAdding) return;
    let autocomplete = null;

    const initGooglePlaces = () => {
      // Provera da li je Google Maps API učitan
      if (!window.google || !window.google.maps || !window.google.maps.places)
        return false;

      if (addressInputRef.current) {
        // Logika inicijalizacije Google Autocomplete-a
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
          setForm((prev) => ({
            ...prev,
            address: fullAddress || prev.address,
            city: city || prev.city,
            zip: zip || prev.zip,
          }));
          setErrors((prev) => ({
            ...prev,
            address: null,
            city: null,
            zip: null,
          }));
        });
        return true;
      }
      return false;
    };

    // Ako Autocomplete nije odmah inicijalizovan (skripta se još učitava), pokušavajmo svakih 500ms
    if (!initGooglePlaces()) {
      const i = setInterval(() => {
        if (initGooglePlaces()) clearInterval(i);
      }, 500);
      return () => clearInterval(i);
    }

    // Cleanup funkcija za uklanjanje slušalaca i Places kontejnera
    return () => {
      if (autocomplete)
        window.google.maps.event.clearInstanceListeners(autocomplete);
      const pac = document.querySelector('.pac-container');
      if (pac) pac.remove();
    };
  }, [isAdding]);

  // --- VALIDACIJA, RUKOVANJE FORME I CRUD OPERACIJE ---

  const validateField = (name, value) => {
    if (name === 'name' && !FORM_RULES.name.regex.test(value))
      return FORM_RULES.name.message;
    if (name === 'address' && !FORM_RULES.address.regex.test(value))
      return FORM_RULES.address.message;
    if (name === 'city' && (!value || value.trim().length < 2))
      return 'Unesite validan naziv grada.';
    if (name === 'zip' && !FORM_RULES.postalCode.regex.test(value))
      return FORM_RULES.postalCode.message;
    if (name === 'phone' && !FORM_RULES.phone.regex.test(value))
      return FORM_RULES.phone.message;
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
    setForm({
      label: addr.label,
      icon: addr.icon || 'mapPin',
      name: addr.name,
      address: addr.address,
      city: addr.city,
      zip: addr.zip,
      phone: addr.phone,
    });
    setEditingId(addr.id);
    setIsAdding(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(initialFormState);
    setErrors({});
    setSubmitCount(0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newErrors = {
      name: validateField('name', form.name),
      address: validateField('address', form.address),
      city: validateField('city', form.city),
      zip: validateField('zip', form.zip),
      phone: validateField('phone', form.phone),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((err) => err !== null)) {
      setSubmitCount((c) => c + 1);
      return;
    }

    const isEditing = !!editingId;
    const optimisticAddress = { ...form };
    let localId;

    try {
      if (isEditing) {
        // Optimistički update za EDIT
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === editingId ? { ...addr, ...form } : addr
          )
        );

        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingId), {
          ...form,
          updatedAt: serverTimestamp(),
        });

        flash('Uspeh', 'Adresa izmenjena.', 'success');
      } else {
        // Optimistički update za NOVO
        localId = 'temp-' + Date.now();
        optimisticAddress.id = localId;
        optimisticAddress.isOptimistic = true;
        setAddresses((prev) => [optimisticAddress, ...prev]);

        const colRef = collection(db, 'users', user.uid, 'addresses');
        await addDoc(colRef, { ...form, createdAt: serverTimestamp() });

        flash('Uspeh', 'Adresa sačuvana.', 'success');
      }
      handleCancel();
    } catch (error) {
      console.error(error);
      flash('Greška', 'Greška pri čuvanju.', 'error');

      // Rollback
      if (!isEditing && localId) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== localId));
      }
    }
  };

  const handleConfirmDelete = async () => {
    const idToDelete = deleteId;
    if (!idToDelete) return;

    // Optimističko brisanje
    setAddresses((prev) => prev.filter((addr) => addr.id !== idToDelete));

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', idToDelete));
      flash('Obrisano', 'Adresa uklonjena.', 'info');
    } catch (error) {
      console.error(error);
      flash('Greška', 'Greška pri brisanju.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTypeSelect = (type) => {
    if (type === 'Kuća') setForm({ ...form, label: 'Kuća', icon: 'home' });
    else if (type === 'Posao')
      setForm({ ...form, label: 'Posao', icon: 'briefcase' });
    else setForm({ ...form, label: '', icon: 'mapPin' });
  };

  const isStandardLabel = ['Kuća', 'Posao'].includes(form.label);

  // --- RENDER ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Moje adrese</h3>
        {!isAdding && (
          <button
            className="btn-primary small"
            onClick={() => {
              setEditingId(null);
              setForm(initialFormState);
              setIsAdding(true);
            }}
          >
            <Plus size={16} /> Dodaj novu
          </button>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="address-form card glass"
            onSubmit={handleSave}
            noValidate
          >
            <h4>{editingId ? 'Izmeni adresu' : 'Nova adresa'}</h4>
            <div className="form-grid">
              <label className="full">
                <span>Tip adrese</span>
                <div className="radio-group">
                  {['Kuća', 'Posao'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={`chip ${form.label === type ? 'active' : ''}`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      {type === 'Kuća' && <Home size={14} />}
                      {type === 'Posao' && <Briefcase size={14} />}
                      {type}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`chip ${!isStandardLabel ? 'active' : ''}`}
                    onClick={() => handleTypeSelect('Custom')}
                  >
                    <PenTool size={14} /> Custom
                  </button>
                </div>
                {!isStandardLabel && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      placeholder="Unesite naziv..."
                      value={form.label}
                      onChange={(e) =>
                        setForm({ ...form, label: e.target.value })
                      }
                      className="border-primary mb-3"
                      autoFocus
                      required
                    />
                    <span>Izaberi ikonicu:</span>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {Object.entries(ADDRESS_ICONS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm({ ...form, icon: key })}
                          title={val.label}
                          className={`p-2 rounded-lg border transition-all ${
                            form.icon === key
                              ? 'bg-[var(--color-primary)] text-[var(--color-bg)] border-[var(--color-primary)]'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <val.icon size={18} />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </label>
              <label>
                <span>Ime i prezime</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Ime i prezime"
                  className={errors.name ? 'input-error' : ''}
                />
                <AnimatePresence mode="wait">
                  {errors.name && (
                    <ErrorMessage
                      key={`name-${submitCount}`}
                      message={errors.name}
                    />
                  )}
                </AnimatePresence>
              </label>
              <label className="full">
                <span>Ulica i broj</span>
                <div className="input-with-icon">
                  <MapPin
                    size={16}
                    className={`input-icon-left ${
                      errors.address ? 'text-red-500' : ''
                    }`}
                  />
                  <input
                    ref={addressInputRef}
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Počnite da kucate adresu..."
                    className={errors.address ? 'input-error' : ''}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                <AnimatePresence mode="wait">
                  {errors.address && (
                    <ErrorMessage
                      key={`addr-${submitCount}`}
                      message={errors.address}
                    />
                  )}
                </AnimatePresence>
              </label>
              <label>
                <span>Grad</span>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Niš"
                  className={errors.city ? 'input-error' : ''}
                />
                <AnimatePresence mode="wait">
                  {errors.city && (
                    <ErrorMessage
                      key={`city-${submitCount}`}
                      message={errors.city}
                    />
                  )}
                </AnimatePresence>
              </label>
              <label>
                <span>Poštanski broj</span>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="18000"
                  className={errors.zip ? 'input-error' : ''}
                />
                <AnimatePresence mode="wait">
                  {errors.zip && (
                    <ErrorMessage
                      key={`zip-${submitCount}`}
                      message={errors.zip}
                    />
                  )}
                </AnimatePresence>
              </label>
              <label className="full">
                <span>Telefon</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="064..."
                  className={errors.phone ? 'input-error' : ''}
                />
                <AnimatePresence mode="wait">
                  {errors.phone && (
                    <ErrorMessage
                      key={`phone-${submitCount}`}
                      message={errors.phone}
                    />
                  )}
                </AnimatePresence>
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-ghost"
                onClick={handleCancel}
              >
                Otkaži
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Izmeni' : 'Sačuvaj'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      <div className="addresses-grid">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Učitavanje...</p>
          </div>
        ) : addresses.length === 0 && !isAdding ? (
          <div className="empty-state">
            <MapPin size={48} className="text-muted" style={{ opacity: 0.3 }} />
            <p>Nemate sačuvanih adresa.</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <motion.div
              layout
              key={addr.id}
              className="address-card card glass"
            >
              <div className="addr-header">
                <span className="addr-label">
                  {addr.icon ? (
                    renderIcon(addr.icon, 14)
                  ) : addr.label === 'Kuća' ? (
                    <Home size={14} />
                  ) : addr.label === 'Posao' ? (
                    <Briefcase size={14} />
                  ) : (
                    <MapPin size={14} />
                  )}
                  {addr.label}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-icon-danger"
                    onClick={() => handleEdit(addr)}
                    title="Izmeni"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon-danger"
                    onClick={() => setDeleteId(addr.id)}
                    title="Obriši"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="addr-body">
                <strong>{addr.name}</strong>
                <p>{addr.address}</p>
                <p>
                  {addr.zip} {addr.city}
                </p>
                <p className="addr-phone">{addr.phone}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Obriši adresu?"
        description="Ova adresa će biti trajno uklonjena. Da li ste sigurni?"
        confirmText="Obriši"
        isDanger={true}
      />
    </motion.div>
  );
}

export default AddressSection;
