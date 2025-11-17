import { useEffect, useMemo, useRef, useState } from "react";
import "./ProductCard.css";
import { Link } from "react-router-dom";
import { money } from "../utils/currency.js";
import { useCart } from "../hooks/useCart.js";
import {
  saveProduct,
  uploadImages,
  removeImagesByPaths,
} from "../services/products";
import FlashModal from "./modals/FlashModal.jsx";
import UploadProgressBar from "./UploadProgressBar.jsx";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Save,
  X,
  XCircle,
  CheckCircle2,
  ImagePlus,
  Trash2,
  Plus,
} from "lucide-react";
import { auth, ADMIN_EMAILS } from "../services/firebase";

export default function ProductCard({ p }) {
  const { dispatch } = useCart();

  // ===== ADMIN DETEKCIJA =====
  const [userEmail, setUserEmail] = useState(
    () => auth?.currentUser?.email ?? null
  );
  useEffect(() => {
    const unsub = auth?.onAuthStateChanged?.((u) =>
      setUserEmail(u?.email ?? null)
    );
    return () => unsub?.();
  }, []);
  const isAdmin = useMemo(
    () => !!userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase()),
    [userEmail]
  );

  // ===== LOKALNA STANJA =====
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null); // lokalni draft izmena
  const [optimistic, setOptimistic] = useState(null); // za instant UI update
  const [mainIdx, setMainIdx] = useState(0);

  // slike
  const imgs = useMemo(() => {
    const arr =
      optimistic?.images ?? p.images ?? (p.image ? [{ url: p.image }] : []);
    return Array.isArray(arr) ? arr : [];
  }, [p.images, p.image, optimistic]);

  useEffect(() => {
    // reset glavne slike kad se promeni lista
    setMainIdx((idx) => (imgs[idx] ? idx : 0));
  }, [imgs]);

  // upload
  const fileInputRef = useRef(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // flash modal
  const [flash, setFlash] = useState({
    open: false,
    ok: true,
    title: "",
    subtitle: "",
  });

  // ===== HANDLERS: KORPA =====
  const addToCart = () =>
    dispatch({
      type: "ADD",
      item: {
        id: p.id,
        name: p.name,
        price: p.price,
        image: imgs?.[0]?.url ?? p.image,
        brand: p.brand,
        slug: p.slug,
      },
    });

  // ===== HANDLERS: EDIT =====
  const startEdit = () => {
    setIsEditing(true);
    setDraft({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      slug: p.slug,
      novo: !!p.novo,
      images: imgs, // {url, path?}
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(null);
    setOptimistic(null);
    setUploadPct(0);
    setIsUploading(false);
  };

  const applyOptimistic = async () => {
    // optimistički UI
    setOptimistic((prev) => ({ ...(prev ?? {}), ...draft }));
    try {
      await saveProduct({
        id: draft.id,
        name: draft.name,
        brand: draft.brand,
        price: Number(draft.price),
        slug: draft.slug,
        novo: !!draft.novo,
        images: (draft.images ?? []).map((x) => ({ url: x.url, path: x.path })),
      });
      setFlash({
        open: true,
        ok: true,
        title: "Izmene sačuvane",
        subtitle: "Proizvod je uspešno ažuriran.",
      });
      setIsEditing(false);
      setDraft(null);
      // nakon snapshot-a, optimistic može mirno da ostane ili da se očisti
      setTimeout(() => setOptimistic(null), 300);
    } catch (e) {
      // revert
      setOptimistic(null);
      setFlash({
        open: true,
        ok: false,
        title: "Greška pri čuvanju",
        subtitle: e?.message ?? "Pokušaj ponovo.",
      });
    }
  };

  // ===== HANDLERS: INPUTI =====
  const bind = (field) => ({
    value: draft?.[field] ?? "",
    onChange: (e) =>
      setDraft((d) => ({
        ...d,
        [field]:
          field === "price"
            ? e.target.value.replace(/[^\d]/g, "")
            : e.target.value,
      })),
  });

  // toggle NOVO
  const toggleNovo = () =>
    setDraft((d) => ({
      ...d,
      novo: !d.novo,
    }));

  // ===== HANDLERS: SLIKE =====
  const openFilePicker = () => fileInputRef.current?.click();

  const onUploadFiles = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    setUploadPct(0);
    try {
      const uploaded = await uploadImages(p.id, files, ({ progress }) =>
        setUploadPct(progress)
      );
      // momentalno dodaj u draft + UI
      setDraft((d) => ({
        ...d,
        images: [...(d?.images ?? imgs), ...uploaded],
      }));
      setOptimistic((o) => ({
        ...(o ?? {}),
        images: [...imgs, ...uploaded],
      }));
      // Firestore zapis
      await saveProduct({
        id: p.id,
        images: [...imgs, ...uploaded],
      });
      setFlash({
        open: true,
        ok: true,
        title: "Slike dodate",
        subtitle: `${uploaded.length} fajl(a) uspešno otpremljeno.`,
      });
    } catch (err) {
      setFlash({
        open: true,
        ok: false,
        title: "Upload neuspešan",
        subtitle: err?.message ?? "Pokušaj ponovo.",
      });
    } finally {
      setIsUploading(false);
      setUploadPct(0);
      e.target.value = "";
    }
  };

  // selekcija za grupno brisanje
  const [selectedPaths, setSelectedPaths] = useState([]);
  const toggleSelect = (path) =>
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );

  const removeSelected = async () => {
    if (!selectedPaths.length) return;
    // optimistic – skloni odmah iz UI
    const rest = (draft?.images ?? imgs).filter(
      (x) => !selectedPaths.includes(x.path ?? x.url)
    );
    setDraft((d) => ({ ...(d ?? { id: p.id }), images: rest }));
    setOptimistic((o) => ({ ...(o ?? {}), images: rest }));
    try {
      await removeImagesByPaths(p.id, selectedPaths);
      await saveProduct({ id: p.id, images: rest });
      setFlash({
        open: true,
        ok: true,
        title: "Slike obrisane",
        subtitle: `${selectedPaths.length} fajl(a) uklonjeno.`,
      });
    } catch (e) {
      setFlash({
        open: true,
        ok: false,
        title: "Brisanje neuspešno",
        subtitle: e?.message ?? "Pokušaj ponovo.",
      });
    } finally {
      setSelectedPaths([]);
    }
  };

  // ===== RENDER DATA =====
  const data = optimistic ? { ...p, ...optimistic } : p;

  return (
    <div className="product-card card relative overflow-hidden">
      {/* NOVO bedž */}
      {(data.novo ?? false) && (
        <div className="pointer-events-none absolute left-2 top-2 z-10">
          <div className="rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-xl bg-white/50 dark:bg-zinc-900/40 border border-white/40 shadow">
            ✨ NOVO
          </div>
        </div>
      )}

      {/* Glavna slika + kontrole */}
      <div className="product-card__img relative">
        <Link to={`/product/${data.slug}`} className="block">
          <img
            src={imgs[mainIdx]?.url ?? data.image}
            alt={data.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        {/* PLUS za dodavanje (samo admin, u edit modu) */}
        {isAdmin && isEditing && (
          <button
            type="button"
            onClick={openFilePicker}
            className="absolute right-2 top-2 z-10 rounded-full p-2 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border border-white/40 shadow hover:scale-105 transition"
            title="Dodaj slike"
          >
            <ImagePlus size={18} />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onUploadFiles}
          className="hidden"
        />

        {/* Tumbnails galerija */}
        {imgs.length > 1 && (
          <div className="absolute inset-x-2 bottom-2 z-10 flex gap-2 overflow-x-auto rounded-2xl backdrop-blur-xl bg-white/50 dark:bg-zinc-900/50 p-2 border border-white/40">
            {imgs.map((ph, idx) => {
              const selected = idx === mainIdx;
              const pathKey = ph.path ?? ph.url;
              const checked = selectedPaths.includes(pathKey);
              return (
                <div key={pathKey} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setMainIdx(idx)}
                    className={`h-12 w-12 overflow-hidden rounded-lg border ${
                      selected
                        ? "border-black/70 dark:border-white/70"
                        : "border-white/40"
                    }`}
                    title="Prikaži"
                  >
                    <img
                      src={ph.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>

                  {isAdmin && isEditing && (
                    <label className="absolute -top-2 -right-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(pathKey)}
                        className="peer hidden"
                      />
                      <span className="peer-checked:scale-110 inline-flex items-center justify-center h-6 w-6 rounded-full border border-white/60 backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 shadow">
                        <Plus size={14} className="rotate-45" />
                      </span>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload progress */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-2 right-2 top-2 z-20"
          >
            <UploadProgressBar progress={uploadPct} label="Otpremanje slika" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telo kartice */}
      <div className="product-card__body">
        {/* BRAND */}
        <div className="product-card__brand">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded-lg border px-2 py-1 text-sm"
              placeholder="Brend"
              {...bind("brand")}
            />
          ) : (
            data.brand
          )}
        </div>

        {/* NAME */}
        <Link to={`/product/${data.slug}`} className="product-card__name">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded-lg border px-2 py-1"
              placeholder="Naziv"
              {...bind("name")}
            />
          ) : (
            data.name
          )}
        </Link>

        {/* PRICE */}
        <div className="product-card__price">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded-lg border px-2 py-1 text-right tabular-nums"
              placeholder="Cena (RSD)"
              {...bind("price")}
            />
          ) : (
            money(data.price)
          )}
        </div>

        {/* NOVO toggle (admin) */}
        {isAdmin && isEditing && (
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!draft?.novo}
              onChange={toggleNovo}
            />
            <span>
              Označi kao <strong>NOVO</strong>
            </span>
          </label>
        )}

        {/* DUGME KORPA */}
        {!isEditing && (
          <button className="product-card__btn" onClick={addToCart}>
            Dodaj u korpu
          </button>
        )}

        {/* ADMIN AKCIJE */}
        {isAdmin && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60"
              >
                <Edit3 size={16} /> Izmeni proizvod
              </button>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={applyOptimistic}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-emerald-600 text-white"
                >
                  <Save size={16} /> Sačuvaj izmene
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-zinc-200 dark:bg-zinc-800"
                >
                  <X size={16} /> Prekini izmene
                </motion.button>

                {selectedPaths.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={removeSelected}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-red-600 text-white"
                    title="Obriši izabrane slike"
                  >
                    <Trash2 size={16} /> Obriši izabrane ({selectedPaths.length}
                    )
                  </motion.button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* FLASH MODAL */}
      <FlashModal
        open={flash.open}
        title={flash.title}
        subtitle={flash.subtitle}
        onClose={() => setFlash((f) => ({ ...f, open: false }))}
        icon={
          flash.ok ? (
            <CheckCircle2 className="text-emerald-600" />
          ) : (
            <XCircle className="text-red-600" />
          )
        }
      />
    </div>
  );
}
