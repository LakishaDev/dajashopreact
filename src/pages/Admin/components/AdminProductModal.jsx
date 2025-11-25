// src/pages/Admin/components/AdminProductModal.jsx

import { useState, useEffect, useRef, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  X,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  Image as ImageIcon,
  GripHorizontal,
  UploadCloud,
  Check,
  Maximize2, // Dodata ikonica za zoom hover
  Link as LinkIcon, // <--- DODAJ OVO (LinkIcon)
  Loader2, // <--- DODAJ OVO (opciono za spinner)
} from 'lucide-react';
import {
  brandService,
  categoryService,
  specKeyService,
  uploadRemoteImage, // <--- DODAJ OVO
} from '../../../services/admin';
import { saveProduct, uploadImages } from '../../../services/products';
import FlashModal from '../../../components/modals/FlashModal.jsx';
import UploadProgressBar from '../../../components/UploadProgressBar.jsx';
// --- NOVI IMPORT ---
import ImageGalleryModal from '../../../components/modals/ImageGalleryModal.jsx';

// --- HELPER: CLEAN SLUG GENERATOR ---
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/đ/g, 'dj')
    .replace(/ž/g, 'z')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// --- 1. Custom Select ---
function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Izaberi...',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || value || placeholder;

  return (
    <div
      className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      ref={containerRef}
    >
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
        {label}
      </span>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between bg-white border text-left px-4 py-3 rounded-xl transition-all duration-200 
          ${
            isOpen
              ? 'border-neutral-800 ring-2 ring-neutral-100'
              : 'border-neutral-200 hover:border-neutral-300'
          }`}
      >
        <span
          className={`text-sm ${
            value ? 'text-neutral-900 font-medium' : 'text-neutral-400'
          }`}
        >
          {selectedLabel}
        </span>
        <ChevronDown
          size={16}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full bg-white border border-neutral-100 rounded-xl shadow-xl max-h-60 overflow-auto custom-scrollbar p-1"
          >
            {options.map((option) => (
              <button
                key={option.id || option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                  ${
                    value === option.value
                      ? 'bg-neutral-50 text-neutral-900 font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
              >
                {option.label}
                {value === option.value && (
                  <Check size={14} className="text-emerald-500" />
                )}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-xs text-neutral-400 text-center">
                Nema dostupnih opcija
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 2. Image Manager (SA CLICK EVENTOM) ---
// --- 2. Image Manager (SA URL UPLOADOM) ---
function ImageManager({
  images,
  onChange,
  onImageClick,
  productSlug,
  productName,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // --- NOVI STATE ZA URL ---
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

  // --- POSTOJEĆI UPLOAD (LOKALNI FAJLOVI) ---
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    let storageFolderName = productSlug;
    if (!storageFolderName && productName) {
      storageFolderName = generateSlug(productName);
    }

    if (!storageFolderName) {
      alert("Molim vas unesite 'Naziv' ili 'Slug' pre ubacivanja slika.");
      e.target.value = null;
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadImages(
        storageFolderName,
        files,
        ({ progress }) => setProgress(progress)
      );
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Greška pri otpremanju slika.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  // --- NOVO: URL UPLOAD HANDLER ---
  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;

    // 1. Validacija foldera (isto kao kod običnog uploada)
    let storageFolderName = productSlug;
    if (!storageFolderName && productName) {
      storageFolderName = generateSlug(productName);
    }

    if (!storageFolderName) {
      alert("Molim vas unesite 'Naziv' pre preuzimanja slike sa linka.");
      return;
    }

    setUrlLoading(true);
    try {
      // Pozivamo tvoj servis koji gađa Cloud Function
      const res = await uploadRemoteImage(urlInput, storageFolderName);

      if (res.success) {
        // Backend vraća 'results' niz sa svim obrađenim slikama
        // Filtriramo samo uspešne i formatiramo ih za frontend
        const newImages = (res.results || [])
          .filter((r) => r.success)
          .map((r) => ({
            url: r.newUrl,
            path: r.storagePath, // Čuvamo path da bi mogli da brišemo kasnije ako treba
          }));

        if (newImages.length > 0) {
          onChange([...images, ...newImages]);
          setUrlInput(''); // Reset polja
        } else {
          alert('Server nije uspeo da preuzme sliku. Proverite link.');
        }
      } else {
        alert('Došlo je do greške pri preuzimanju slike.');
      }
    } catch (error) {
      console.error(error);
      alert('Greška na serveru prilikom preuzimanja.');
    } finally {
      setUrlLoading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Galerija
        </span>
        {/* Dugme za lokalni upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <UploadCloud size={14} /> Dodaj sa računara
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* --- NOVO: URL UPLOAD SEKCIJA --- */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <LinkIcon
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlUpload()}
            placeholder="Nalepi direktan link slike (http...)"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-800 focus:ring-2 focus:ring-neutral-200 outline-none transition-all placeholder:text-neutral-400"
            disabled={urlLoading}
          />
        </div>
        <button
          onClick={handleUrlUpload}
          disabled={urlLoading || !urlInput}
          className="bg-neutral-900 text-white p-2.5 rounded-xl disabled:opacity-50 hover:bg-black transition-colors shadow-sm"
          title="Preuzmi sliku"
        >
          {urlLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
        </button>
      </div>

      {/* --- PROGRES BAROVI --- */}
      <AnimatePresence>
        {/* Lokalni upload progress */}
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <UploadProgressBar
              progress={progress}
              label="Otpremanje sa računara..."
            />
          </motion.div>
        )}

        {/* URL upload "fake" progress (jer cloud function ne vraća stream procenata) */}
        {urlLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {/* Koristimo tvoj UploadProgressBar, ali pošto je server-side proces, 
                 stavljamo animirani loading text ili statični progress */}
            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50/50 p-2">
              <div className="flex justify-between text-xs mb-1 text-blue-700 font-medium">
                <span>Preuzimanje sa servera...</span>
                <Loader2 size={12} className="animate-spin" />
              </div>
              <div className="h-1.5 rounded-full bg-blue-100 overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- LISTA SLIKA (Reorder) --- */}
      <Reorder.Group
        axis="y"
        values={images}
        onReorder={onChange}
        className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1"
      >
        {images.map((img, idx) => (
          <Reorder.Item
            key={img.url}
            value={img}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-2 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative"
            >
              <div className="p-2 text-neutral-300 group-hover:text-neutral-400">
                <GripHorizontal size={18} />
              </div>

              {/* Thumbnail */}
              <div
                className="h-12 w-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0 cursor-zoom-in relative"
                onClick={() => onImageClick(idx)}
              >
                <img
                  src={img.url || '/placeholder.png'}
                  alt=""
                  className="h-full w-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 truncate font-mono">
                  {img.path ? (
                    img.path.split('/').pop()
                  ) : (
                    <span className="text-emerald-600">Preuzeto sa linka</span>
                  )}
                </p>
                {/* Prikaz originalnog URL-a kao tooltip ili mali tekst ako želiš */}
              </div>
              <button
                type="button"
                onClick={() => removeImage(images.indexOf(img))}
                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {images.length === 0 && !uploading && !urlLoading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer gap-2"
        >
          <ImageIcon size={24} />
          <span className="text-sm font-medium">Nema slika</span>
        </div>
      )}
    </div>
  );
}

// --- 3. Main Modal Component ---
/**
 * Admin Product Modal
 * Omogućava kreiranje i izmenu proizvoda u admin panelu.
 * Uključuje upravljanje slikama, specifikacijama i osnovnim informacijama o proizvodu.
 * Koristi Framer Motion za animacije i Lenis za sprečavanje skrolovanja unutar modala.
 * @module AdminProductModal
 * @author DarkoKc
 * @version 1.0.0
 * @license MIT
 * @requires react
 * @requires framer-motion
 * @requires lucide-react
 * @requires ../../../services/admin
 * @requires ../../../services/products
 * @requires ../../../components/modals/FlashModal
 * @requires ../../../components/UploadProgressBar
 * @requires ../../../components/modals/ImageGalleryModal
 * @see {@link ../../../services/admin}
 * @see {@link ../../../services/products}
 * @see {@link ../../../components/modals/FlashModal}
 * @see {@link ../../../components/UploadProgressBar}
 * @see {@link ../../../components/modals/ImageGalleryModal}
 * @example
 * <AdminProductModal product={product} onClose={handleClose} onSuccess={handleSuccess} />
 * @description
 * Ovaj modal omogućava administratorima da kreiraju ili izmenjuju proizvode.
 * Podržava dodavanje slika, specifikacija, i osnovnih informacija kao što su naziv, cena, brend i kategorija.
 * Koristi prilagođene komponente za selektovanje i upravljanje slikama.
 * Implementira validaciju i prikazuje povratne informacije putem FlashModal komponente.
 * Takođe uključuje funkcionalnost za pregled slika u punom ekranu putem ImageGalleryModal komponente.
 */
export default function AdminProductModal({ product, onClose, onSuccess }) {
  const [brands, setBrands] = useState([]);
  const [cats, setCats] = useState([]);
  const [specKeys, setSpecKeys] = useState([]);

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    images: [],
    description: '',
    gender: '',
    department: 'satovi',
    specs: {},
    model3DUrl: '',
    slug: '',
  });

  // State za Image Gallery Modal
  const [galleryIndex, setGalleryIndex] = useState(null);

  const [tempSpecKey, setTempSpecKey] = useState('');
  const [tempSpecVal, setTempSpecVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ open: false });

  useEffect(() => {
    const sub1 = brandService.subscribe(setBrands);
    const sub2 = categoryService.subscribe(setCats);
    const sub3 = specKeyService.subscribe(setSpecKeys);

    if (product) {
      let loadedImages = [];
      if (product.images && Array.isArray(product.images)) {
        loadedImages = product.images;
      } else if (product.image) {
        loadedImages = [{ url: product.image }];
      }

      setForm({
        ...product,
        images: loadedImages,
        specs: product.specs || {},
        model3DUrl: product.model3DUrl || '',
        department: product.department || 'satovi',
        slug: product.slug || '',
      });
    }

    return () => {
      sub1();
      sub2();
      sub3();
    };
  }, [product]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'department') {
        next.brand = '';
        next.category = '';
      }
      if (field === 'brand') {
        next.category = '';
      }
      return next;
    });
  };

  const addSpec = () => {
    if (!tempSpecKey || !tempSpecVal) return;
    const def = specKeys.find((k) => k.name === tempSpecKey);
    let finalVal = tempSpecVal;
    if (def?.unit && !tempSpecVal.endsWith(def.unit)) {
      finalVal = `${tempSpecVal} ${def.unit}`;
    }
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [tempSpecKey]: finalVal },
    }));
    setTempSpecKey('');
    setTempSpecVal('');
  };

  const removeSpec = (key) => {
    const newSpecs = { ...form.specs };
    delete newSpecs[key];
    setForm((prev) => ({ ...prev, specs: newSpecs }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert('Naziv i cena su obavezni.');
    setLoading(true);
    try {
      const finalSlug = form.slug || generateSlug(form.name);
      const payload = {
        ...form,
        price: Number(form.price),
        image: form.images[0]?.url || '',
        slug: finalSlug,
      };
      if (!product) delete payload.id;
      else payload.id = product.id;

      await saveProduct(payload);

      setFlash({ open: true, title: 'Uspešno sačuvano!', ok: true });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setFlash({ open: true, title: 'Greška', ok: false });
    } finally {
      setLoading(false);
    }
  };

  // Filteri
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => (b.department || 'satovi') === form.department);
  }, [brands, form.department]);

  const brandOptions = filteredBrands.map((b) => ({
    value: b.name,
    label: b.name,
    id: b.id,
  }));

  const filteredCats = useMemo(() => {
    let c = cats.filter(
      (cat) => (cat.department || 'satovi') === form.department
    );
    if (form.brand) {
      c = c.filter((cat) => cat.brand === form.brand);
    }
    return c;
  }, [cats, form.department, form.brand]);

  const catOptions = filteredCats.map((c) => ({
    value: c.name,
    label: c.name,
    id: c.id,
  }));

  const filteredSpecs = useMemo(() => {
    return specKeys.filter(
      (s) => (s.department || 'satovi') === form.department
    );
  }, [specKeys, form.department]);

  const specOptions = filteredSpecs.map((k) => ({
    value: k.name,
    label: k.name,
    id: k.id,
    unit: k.unit,
  }));

  const departmentOptions = [
    { value: 'satovi', label: 'Satovi' },
    { value: 'daljinski', label: 'Daljinski' },
    { value: 'baterije', label: 'Baterije' },
    { value: 'naocare', label: 'Naočare' },
  ];

  const genderOptions = [
    { value: '', label: 'Unisex' },
    { value: 'MUŠKI', label: 'Muški' },
    { value: 'ŽENSKI', label: 'Ženski' },
  ];

  const activeUnit =
    specOptions.find((o) => o.value === tempSpecKey)?.unit || '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <FlashModal
        {...flash}
        onClose={() => setFlash({ ...flash, open: false })}
      />

      {/* --- IMAGE GALLERY MODAL --- */}
      {galleryIndex !== null && (
        <ImageGalleryModal
          images={form.images}
          initialIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        data-lenis-prevent
        className="w-full max-w-5xl bg-[#f5f5f7] border border-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-5 border-b border-neutral-200/60 bg-white/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {product ? 'Izmena proizvoda' : 'Novi proizvod'}
            </h2>
            <p className="text-sm text-neutral-500">
              Popuni detalje i upravljaj inventarom.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto custom-scrollbar p-8"
          data-lenis-prevent
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Naziv
                    </span>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all font-medium"
                      placeholder="Unesi naziv proizvoda..."
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      URL Slug (Opciono)
                    </span>
                    <input
                      value={form.slug || generateSlug(form.name)}
                      onChange={(e) => handleChange('slug', e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-600 font-mono outline-none focus:ring-2 focus:ring-neutral-200"
                      placeholder="auto-generisano"
                    />
                    <span className="text-[10px] text-neutral-400 ml-1">
                      Ovo je link proizvoda. Ako je prazno, generiše se iz
                      naziva.
                    </span>
                  </label>
                </div>
                <div className="md:col-span-1">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Cena (RSD)
                    </span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => handleChange('price', e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 font-mono outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
                      placeholder="0"
                    />
                  </label>
                </div>
                <div className="md:col-span-1">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Opis (Opciono)
                    </span>
                    <input
                      value={form.description || ''}
                      onChange={(e) =>
                        handleChange('description', e.target.value)
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
                      placeholder="Kratak opis..."
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomSelect
                  label="Odeljenje"
                  value={form.department}
                  options={departmentOptions}
                  onChange={(v) => handleChange('department', v)}
                />
                <CustomSelect
                  label="Brend"
                  value={form.brand}
                  options={brandOptions}
                  onChange={(v) => handleChange('brand', v)}
                  placeholder={
                    brandOptions.length === 0
                      ? 'Nema brendova'
                      : 'Izaberi brend'
                  }
                  disabled={brandOptions.length === 0}
                />
                <CustomSelect
                  label="Kategorija"
                  value={form.category}
                  options={catOptions}
                  onChange={(v) => handleChange('category', v)}
                  placeholder={
                    !form.brand
                      ? 'Prvo izaberi brend'
                      : catOptions.length === 0
                      ? 'Nema kategorija'
                      : 'Izaberi kategoriju'
                  }
                  disabled={!form.brand || catOptions.length === 0}
                />
                <CustomSelect
                  label="Pol"
                  value={form.gender}
                  options={genderOptions}
                  onChange={(v) => handleChange('gender', v)}
                />
                <div className="md:col-span-3">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      3D Model URL (.glb)
                    </span>
                    <input
                      value={form.model3DUrl}
                      onChange={(e) =>
                        handleChange('model3DUrl', e.target.value)
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all font-medium"
                      placeholder="/models/moj-sat.glb (iz Storage-a)"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">
                  Tehničke Specifikacije
                </h3>
                <div className="flex gap-3 items-end mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <div className="flex-1 min-w-[140px]">
                    <CustomSelect
                      label="Osobina"
                      value={tempSpecKey}
                      options={specOptions}
                      onChange={setTempSpecKey}
                      placeholder={
                        specOptions.length === 0 ? 'Nema opcija' : 'Izaberi...'
                      }
                    />
                  </div>
                  <div className="flex-1 relative">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Vrednost
                    </span>
                    <input
                      value={tempSpecVal}
                      onChange={(e) => setTempSpecVal(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-neutral-400"
                      placeholder="npr. 200"
                    />
                    {activeUnit && (
                      <span className="absolute right-3 top-[32px] text-neutral-400 text-xs font-bold pointer-events-none">
                        {activeUnit}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={addSpec}
                    disabled={!tempSpecKey || !tempSpecVal}
                    className="bg-neutral-900 text-white p-3 rounded-xl hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-neutral-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {Object.entries(form.specs).map(([key, val]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex justify-between items-center p-3 bg-neutral-50 border border-neutral-100 rounded-xl group"
                      >
                        <div>
                          <span className="text-xs text-neutral-400 block uppercase font-bold">
                            {key}
                          </span>
                          <span className="text-sm font-medium text-neutral-800">
                            {val}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSpec(key)}
                          className="text-neutral-300 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {Object.keys(form.specs).length === 0 && (
                  <div className="text-center py-6 text-neutral-400 text-sm border-2 border-dashed border-neutral-100 rounded-xl">
                    Nema dodatih specifikacija
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 h-full">
                {/* PROSLEĐUJEMO onImageClick */}
                <ImageManager
                  images={form.images}
                  onChange={(imgs) => handleChange('images', imgs)}
                  onImageClick={(index) => setGalleryIndex(index)} // OTVARA GALERIJU
                  productSlug={form.slug} // <--- Dodato
                  productName={form.name} // <--- Dodato
                />
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                  <p className="flex gap-2 items-start">
                    <span className="text-lg">💡</span>
                    <span>
                      Klikni na sliku za pregled. Prva slika je glavna.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t border-neutral-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
          >
            Otkaži
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-neutral-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black hover:shadow-lg hover:shadow-neutral-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {loading ? (
              'Čuvanje...'
            ) : (
              <>
                <Save size={18} /> Sačuvaj promene
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
