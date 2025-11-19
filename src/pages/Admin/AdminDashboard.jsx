// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { isAdminEmail } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Tag,
  Layers,
  List,
  Search,
  Edit3,
  Plus,
  X, // <--- X ikonica za brisanje
} from "lucide-react";
import useProducts from "../../hooks/useProducts";
import { deleteProduct } from "../../services/products"; // <--- import servisa

// Components
import ManageList from "./components/ManageList.jsx";
import AdminProductModal from "./components/AdminProductModal.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal.jsx"; // <--- import modala
import {
  brandService,
  categoryService,
  specKeyService,
} from "../../services/admin";
import { money } from "../../utils/currency";
import { useLenis } from "lenis/react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { items: products } = useProducts();
  const lenis = useLenis();

  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Delete state
  const [deleteId, setDeleteId] = useState(null);

  // Auth Check
  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) {
      nav("/");
    }
  }, [user, nav]);

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.8 });
    }
  }, [lenis]);

  if (!user) return null;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNew = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setModalOpen(true);
  };

  // Brisanje
  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteProduct(deleteId);
        // Optimistic update nije neophodan jer useProducts slusa realtime promene
      } catch (error) {
        console.error("Greška pri brisanju:", error);
        alert("Došlo je do greške prilikom brisanja.");
      }
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f5f5f7]">
      {" "}
      {/* Svetlija pozadina generalno */}
      {/* Header Admin Panela */}
      <div className="bg-white border-b border-neutral-200 sticky top-[var(--header-bar-h)] z-30 shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">
            Admin Panel
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto px-2 py-4 custom-scrollbar">
            <TabButton
              active={activeTab === "products"}
              onClick={() => setActiveTab("products")}
              icon={Package}
              label="Proizvodi"
            />
            <TabButton
              active={activeTab === "brands"}
              onClick={() => setActiveTab("brands")}
              icon={Tag}
              label="Brendovi"
            />
            <TabButton
              active={activeTab === "categories"}
              onClick={() => setActiveTab("categories")}
              icon={Layers}
              label="Kategorije"
            />
            <TabButton
              active={activeTab === "specs"}
              onClick={() => setActiveTab("specs")}
              icon={List}
              label="Specifikacije"
            />
          </div>
        </div>
      </div>
      <div className="container mt-8">
        {/* CONTENT: PROIZVODI */}
        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  size={18}
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pretraži proizvode..."
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-neutral-200 transition-all text-neutral-900"
                />
              </div>
              <button
                onClick={openNew}
                className="bg-neutral-900 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-black hover:shadow-lg transition-all active:scale-95 font-bold"
              >
                <Plus size={20} /> Dodaj Proizvod
              </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-bold tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-4">Slika</th>
                      <th className="p-4">Naziv</th>
                      <th className="p-4">Brend</th>
                      <th className="p-4">Cena</th>
                      <th className="p-4">Kategorija</th>
                      <th className="p-4 text-right">Akcije</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredProducts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden">
                            <img
                              src={p.image || "/placeholder.png"}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-neutral-900">
                          {p.name}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                            {p.brand}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-neutral-900">
                          {money(p.price)}
                        </td>
                        <td className="p-4 text-neutral-500">{p.category}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 text-neutral-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                              title="Izmeni"
                            >
                              <Edit3 size={18} />
                            </button>

                            {/* DUGME ZA BRISANJE - X IKONICA */}
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                              title="Obriši"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="p-12 text-center text-neutral-400">
                  Nema proizvoda koji odgovaraju pretrazi.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CONTENT: BRENDOVI / KATEGORIJE / SPECS */}
        {activeTab !== "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {activeTab === "brands" && (
              <ManageList service={brandService} title="Brendovi" icon={Tag} />
            )}
            {activeTab === "categories" && (
              <ManageList
                service={categoryService}
                title="Kategorije"
                icon={Layers}
              />
            )}
            {activeTab === "specs" && (
              <ManageList
                service={specKeyService}
                title="Karakteristike"
                icon={List}
              />
            )}
          </motion.div>
        )}
      </div>
      {/* MODAL ZA EDIT/NEW */}
      <AnimatePresence>
        {modalOpen && (
          <AdminProductModal
            product={editProduct}
            onClose={() => setModalOpen(false)}
            onSuccess={() => {
              /* refresh handled automatically */
            }}
          />
        )}
      </AnimatePresence>
      {/* CONFIRM MODAL ZA BRISANJE */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Obriši proizvod?"
        description="Ovaj proizvod će biti trajno uklonjen iz baze podataka. Da li ste sigurni?"
        confirmText="Obriši"
        isDanger={true}
      />
    </div>
  );
}

// Pomoćna komponenta za tabove (Svetla tema)
function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap
        ${
          active
            ? "bg-neutral-900 text-white shadow-lg shadow-neutral-300 scale-105"
            : "bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200"
        }
      `}
    >
      <Icon size={18} /> {label}
    </button>
  );
}
