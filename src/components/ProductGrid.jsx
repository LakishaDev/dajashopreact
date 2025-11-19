import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";
import ProductModal from "./modals/ProductModal.jsx";
import useProducts from "../hooks/useProducts";
import { Plus } from "lucide-react";
import { auth, ADMIN_EMAILS } from "../services/firebase"; // Proveri putanju do firebase.js
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function ProductGrid({ items: propItems }) {
  // Podaci
  const { items: hookItems, loading, err } = useProducts();
  const displayItems = propItems || hookItems;
  const [isModalOpen, setModalOpen] = useState(false);

  // --- Admin detekcija ---
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

  // Loading / Error stanja
  if (loading && !propItems) {
    return (
      <div className="py-12 text-center font-medium text-neutral-500 animate-pulse">
        Učitavanje kataloga...
      </div>
    );
  }
  if (err && !propItems) {
    return (
      <div className="py-12 text-center font-bold text-red-500">
        Greška: {String(err)}
      </div>
    );
  }

  return (
    <>
      {/* Grid Container: Tailwind grid sistem */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] items-stretch">
        {/* ADMIN: Dugme za dodavanje (Dashed Glass Card) */}
        {isAdmin && (
          <motion.button
            onClick={() => setModalOpen(true)}
            className="group flex min-h-320px w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-white/20 p-6 text-neutral-400 backdrop-blur-sm transition hover:border-[#c8a94e] hover:bg-white/40 hover:text-[#c8a94e]"
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white/50 shadow-sm transition group-hover:scale-110 group-hover:bg-white group-hover:text-[#c8a94e]">
              <Plus size={32} strokeWidth={2} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100">
              Dodaj novi
            </span>
          </motion.button>
        )}

        {/* Proizvodi */}
        {displayItems.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {/* Modal Komponenta */}
      <ProductModal open={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
