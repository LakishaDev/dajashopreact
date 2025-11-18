// src/pages/Admin/components/AdminProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
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
} from "lucide-react";
import {
  brandService,
  categoryService,
  specKeyService,
} from "../../../services/admin";
import { saveProduct, uploadImages } from "../../../services/products";
import FlashModal from "../../../components/modals/FlashModal.jsx";
import UploadProgressBar from "../../../components/UploadProgressBar.jsx";

// --- 1. Custom Animated Dropdown Component ---
function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Izaberi...",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Zatvori na klik van
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || value || placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border text-left px-4 py-3 rounded-xl transition-all duration-200 
          ${
            isOpen
              ? "border-neutral-800 ring-2 ring-neutral-100"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
      >
        <span
          className={`text-sm ${
            value ? "text-neutral-900 font-medium" : "text-neutral-400"
          }`}
        >
          {selectedLabel}
        </span>
        <ChevronDown
          size={16}
          className={`text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
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
                      ? "bg-neutral-50 text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-50"
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
                Nema opcija
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- 2. Image Manager Component ---
function ImageManager({ images, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      // Simulacija ID-a posto proizvod mozda jos nema ID
      const tempId = "temp_" + Date.now();
      const uploaded = await uploadImages(tempId, files, ({ progress }) =>
        setProgress(progress)
      );
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Greška pri otpremanju slika.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Galerija
        </span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <UploadCloud size={14} /> Dodaj slike
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

      {/* Progress Bar */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <UploadProgressBar progress={progress} label="Otpremanje..." />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable List */}
      <Reorder.Group
        axis="y"
        values={images}
        onReorder={onChange}
        className="space-y-2"
      >
        {images.map((img) => (
          <Reorder.Item
            key={img.url}
            value={img}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-2 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="p-2 text-neutral-300 group-hover:text-neutral-400">
                <GripHorizontal size={18} />
              </div>
              <div className="h-12 w-12 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50 shrink-0">
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-neutral-500 truncate">
                  {img.path ? img.path.split("/").pop() : "Eksterna slika"}
                </p>
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

      {images.length === 0 && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer gap-2"
        >
          <ImageIcon size={24} />
          <span className="text-sm font-medium">Klikni da dodaš slike</span>
        </div>
      )}
    </div>
  );
}

// --- 3. Main Modal Component ---
export default function AdminProductModal({ product, onClose, onSuccess }) {
  const [brands, setBrands] = useState([]);
  const [cats, setCats] = useState([]);
  const [specKeys, setSpecKeys] = useState([]);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    images: [], // Array of {url, path}
    description: "",
    gender: "",
    specs: {},
    model3DUrl: "",
  });

  const [tempSpecKey, setTempSpecKey] = useState("");
  const [tempSpecVal, setTempSpecVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ open: false });

  // Load data
  useEffect(() => {
    const sub1 = brandService.subscribe(setBrands);
    const sub2 = categoryService.subscribe(setCats);
    const sub3 = specKeyService.subscribe(setSpecKeys);

    if (product) {
      // Normalizuj slike u niz objekata ako je stari format
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
        model3DUrl: product.model3DUrl || "", // <--- UČITAVANJE 3D URL-A
      });
    }

    return () => {
      sub1();
      sub2();
      sub3();
    };
  }, [product]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSpec = () => {
    if (!tempSpecKey || !tempSpecVal) return;
    setForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [tempSpecKey]: tempSpecVal },
    }));
    setTempSpecKey("");
    setTempSpecVal("");
  };

  const removeSpec = (key) => {
    const newSpecs = { ...form.specs };
    delete newSpecs[key];
    setForm((prev) => ({ ...prev, specs: newSpecs }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert("Naziv i cena su obavezni.");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        // Glavna slika je prva u nizu
        image: form.images[0]?.url || "",
        slug:
          form.slug ||
          form.name.toLowerCase().replace(/ /g, "-") +
            "-" +
            Date.now().toString().slice(-4),
      };
      if (!product) delete payload.id;
      else payload.id = product.id;

      await saveProduct(payload);

      setFlash({ open: true, title: "Uspešno sačuvano!", ok: true });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setFlash({ open: true, title: "Greška", ok: false });
    } finally {
      setLoading(false);
    }
  };

  // Transform data for dropdowns
  const brandOptions = brands.map((b) => ({
    value: b.name,
    label: b.name,
    id: b.id,
  }));
  const catOptions = cats.map((c) => ({
    value: c.name,
    label: c.name,
    id: c.id,
  }));
  const genderOptions = [
    { value: "", label: "Unisex" },
    { value: "MUŠKI", label: "Muški" },
    { value: "ŽENSKI", label: "Ženski" },
  ];
  const specOptions = specKeys.map((k) => ({
    value: k.name,
    label: k.name,
    id: k.id,
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <FlashModal
        {...flash}
        onClose={() => setFlash({ ...flash, open: false })}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="w-full max-w-5xl bg-[#f5f5f7] border border-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-neutral-200/60 bg-white/50 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {product ? "Izmena proizvoda" : "Novi proizvod"}
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN (Main Info) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Naziv i Cena */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Naziv
                    </span>
                    <input
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all font-medium"
                      placeholder="Unesi naziv proizvoda..."
                    />
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
                      onChange={(e) => handleChange("price", e.target.value)}
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
                      value={form.description || ""}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
                      placeholder="Kratak opis..."
                    />
                  </label>
                </div>
              </div>

              {/* Dropdowns Grid */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomSelect
                  label="Brend"
                  value={form.brand}
                  options={brandOptions}
                  onChange={(v) => handleChange("brand", v)}
                />
                <CustomSelect
                  label="Kategorija"
                  value={form.category}
                  options={catOptions}
                  onChange={(v) => handleChange("category", v)}
                />
                <CustomSelect
                  label="Pol"
                  value={form.gender}
                  options={genderOptions}
                  onChange={(v) => handleChange("gender", v)}
                />
                {/* NOVO: 3D Model URL */}
                <div className="md:col-span-3">
                  <label className="block">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      3D Model URL (.glb)
                    </span>
                    <input
                      value={form.model3DUrl}
                      onChange={(e) =>
                        handleChange("model3DUrl", e.target.value)
                      }
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-400 transition-all font-medium"
                      placeholder="/models/moj-sat.glb (iz Storage-a)"
                    />
                  </label>
                </div>
              </div>

              {/* Specifikacije */}
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
                      placeholder="Izaberi..."
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">
                      Vrednost
                    </span>
                    <input
                      value={tempSpecVal}
                      onChange={(e) => setTempSpecVal(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-400"
                      placeholder="npr. 200g, Čelik..."
                    />
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

            {/* RIGHT COLUMN (Images) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 h-full">
                <ImageManager
                  images={form.images}
                  onChange={(imgs) => handleChange("images", imgs)}
                />

                {/* Preview grid tip */}
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                  <p className="flex gap-2 items-start">
                    <span className="text-lg">💡</span>
                    <span>
                      Možeš da menjaš redosled slika prevlačenjem. Prva slika u
                      nizu će biti glavna slika proizvoda.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
              "Čuvanje..."
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
