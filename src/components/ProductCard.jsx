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
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Edit3,
  Save,
  X,
  XCircle,
  CheckCircle2,
  ImagePlus,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { auth, ADMIN_EMAILS } from "../services/firebase";

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

export default function ProductCard({ p }) {
  const { dispatch } = useCart();

  // Stanje za slider (stranica i smer)
  const [[page, direction], setPage] = useState([0, 0]);
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

  // Sinhronizacija page-a sa brojem slika (da ne odemo u minus ili previše)
  // 'imgs' varijablu već imaš u svom kodu
  const imageIndex = Math.abs(page % imgs.length);

  // Funkcija za promenu slike (sledeća/prethodna)
  const paginate = (newDirection) => {
    if (imgs.length <= 1) return;
    setPage([page + newDirection, newDirection]);
  };

  // Funkcija za klik na tačkicu (dots) ili thumbnail
  const setIndex = (index) => {
    const newDirection = index > imageIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  // Da li prikazujemo kontrole za slider?
  const showSliderControls = imgs.length > 1;

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
    <div className="product-card card relative overflow-hidden max-w-full md:max-w-56 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      {/* NOVO bedž */}
      {(data.novo ?? false) && (
        <div className="pointer-events-none absolute left-2 top-2 z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-xl bg-white/70 dark:bg-black/50 border border-white/40 shadow-sm text-zinc-800 dark:text-white"
          >
            ✨ NOVO
          </motion.div>
        </div>
      )}

      {/* Glavna slika + Slider */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag={showSliderControls ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Link
              to={`/product/${data.slug}`}
              className="block w-full h-full"
              draggable={false}
            >
              <img
                src={imgs[imageIndex]?.url ?? data.image}
                alt={data.name}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* PLUS za dodavanje (samo admin, u edit modu) */}
        {isAdmin && isEditing && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={openFilePicker}
            className="absolute right-2 top-2 z-20 rounded-full p-2 backdrop-blur-xl bg-white/60 dark:bg-zinc-900/60 border border-white/40 shadow hover:shadow-lg transition text-zinc-800 dark:text-white"
            title="Dodaj slike"
          >
            <ImagePlus size={18} />
          </motion.button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onUploadFiles}
          className="hidden"
        />

        {/* Upload progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-2 right-2 top-14 z-20"
            >
              <UploadProgressBar progress={uploadPct} label="Otpremanje..." />
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION AREA (Dots or Thumbs) */}
        <LayoutGroup>
          <div className="absolute inset-x-0 bottom-0 z-20 p-3  from-black/60 to-transparent pointer-events-none">
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait" initial={false}>
                {/* CASE 1: ADMIN EDIT MODE - Thumbnails */}
                {isAdmin && isEditing && imgs.length > 0 ? (
                  <motion.div
                    key="thumbs"
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex gap-2 overflow-x-auto pb-1 pt-2 scrollbar-hide justify-start"
                  >
                    {imgs.map((ph, idx) => {
                      const selected = idx === imageIndex;
                      const pathKey = ph.path ?? ph.url;
                      const checked = selectedPaths.includes(pathKey);

                      return (
                        <motion.div
                          key={pathKey}
                          layoutId={`thumb-${pathKey}`}
                          className="relative shrink-0 group"
                        >
                          <button
                            type="button"
                            onClick={() => setIndex(idx)}
                            className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                              selected
                                ? "border-blue-500 scale-105 shadow-md opacity-100"
                                : "border-white/40 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={ph.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </button>

                          {/* Modern Glass Checkbox */}
                          <label className="absolute -top-2 -right-2 cursor-pointer z-30">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelect(pathKey)}
                              className="peer hidden"
                            />
                            <div className="h-5 w-5 rounded-md backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/60 shadow-lg flex items-center justify-center transition-all duration-200 peer-checked:bg-red-500 peer-checked:border-red-600 peer-checked:shadow-red-500/30">
                              <Check
                                size={12}
                                className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all"
                                strokeWidth={4}
                              />
                            </div>
                          </label>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  /* CASE 2: USER VIEW MODE - Dots */
                  imgs.length > 1 && (
                    <motion.div
                      key="dots"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center gap-2"
                    >
                      {imgs.map((_, idx) => {
                        const active = idx === imageIndex;
                        return (
                          <motion.button
                            key={idx}
                            layout
                            onClick={(e) => {
                              e.preventDefault();
                              setIndex(idx);
                            }}
                            className="relative h-2.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 border border-zinc-500"
                            animate={{
                              width: active ? 24 : 6,
                              backgroundColor: active
                                ? "rgba(255, 255, 255, 1)"
                                : "rgba(255, 255, 255, 0.4)",
                            }}
                          />
                        );
                      })}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </div>
        </LayoutGroup>
      </div>

      {/* Telo kartice */}
      <div className="product-card__body relative bg-zinc-100 z-10 p-4">
        {/* BRAND */}
        <div className="product-card__brand text-xs uppercase tracking-wider text-zinc-500 mb-1">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-sm bg-transparent outline-none focus:border-blue-500"
              placeholder="Brend"
              {...bind("brand")}
            />
          ) : (
            data.brand
          )}
        </div>

        {/* NAME */}
        <div className="product-card__name font-bold text-lg text-zinc-800 mb-1 leading-tight">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 bg-transparent outline-none focus:border-blue-500"
              placeholder="Naziv"
              {...bind("name")}
            />
          ) : (
            <Link
              to={`/product/${data.slug}`}
              className="hover:text-blue-600 transition-colors"
            >
              {data.name}
            </Link>
          )}
        </div>

        {/* PRICE */}
        <div className="product-card__price text-zinc-900 dark:text-white font-medium">
          {isAdmin && isEditing ? (
            <input
              className="w-full rounded border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-right tabular-nums bg-transparent outline-none focus:border-blue-500"
              placeholder="Cena (RSD)"
              {...bind("price")}
            />
          ) : (
            money(data.price)
          )}
        </div>

        {/* NOVO toggle (admin) */}
        {isAdmin && isEditing && (
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={!!draft?.novo}
                onChange={toggleNovo}
                className="peer hidden"
              />
              <div className="h-5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700 peer-checked:bg-blue-500 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4"></div>
            </div>
            <span>
              Označi kao <strong>NOVO</strong>
            </span>
          </label>
        )}

        {/* DUGME KORPA */}
        {!isEditing && (
          <button
            className="product-card__btn mt-3 w-full py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            onClick={addToCart}
          >
            Dodaj u korpu
          </button>
        )}

        {/* ADMIN AKCIJE */}
        {isAdmin && (
          <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEdit}
                className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-zinc-800 hover:text-zinc-50 "
              >
                <Edit3 size={14} /> Izmeni
              </button>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={applyOptimistic}
                  className="flex-1 inline-flex justify-center items-center gap-2 rounded-lg bg-emerald-500 text-white px-3 py-2 text-sm shadow-md hover:bg-emerald-600"
                >
                  <Save size={14} /> Sačuvaj
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelEdit}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={16} />
                </motion.button>

                <AnimatePresence>
                  {selectedPaths.length > 0 && (
                    <motion.button
                      initial={{ width: 0, opacity: 0, padding: 0 }}
                      animate={{
                        width: "auto",
                        opacity: 1,
                        padding: "0.5rem 0.75rem",
                      }}
                      exit={{ width: 0, opacity: 0, padding: 0 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={removeSelected}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-500 text-white text-sm whitespace-nowrap overflow-hidden"
                      title="Obriši izabrane slike"
                    >
                      <Trash2 size={14} />{" "}
                      <span className="text-xs font-bold">
                        {selectedPaths.length}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
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
