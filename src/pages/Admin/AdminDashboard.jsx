// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isAdminEmail } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Tag,
  Layers,
  List,
  Search,
  Edit3,
  Plus,
  X,
  Check,
  Trash2,
  Filter, // Vraćena ikonica
  ChevronDown, // Vraćena ikonica
} from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import { deleteProduct } from '../../services/products';

// Components
import AdminProductModal from './components/AdminProductModal.jsx';
import ConfirmModal from '../../components/modals/ConfirmModal.jsx';
import {
  brandService,
  categoryService,
  specKeyService,
} from '../../services/admin';
import { money } from '../../utils/currency';
import { useLenis } from 'lenis/react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { items: products } = useProducts();
  const lenis = useLenis();

  const [activeTab, setActiveTab] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');

  // --- SEARCH FILTER STATE (VRAĆENO) ---
  const [searchFilters, setSearchFilters] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const filterOptions = [
    { id: 'name', label: 'Naziv' },
    { id: 'department', label: 'Odeljenje' },
    { id: 'brand', label: 'Brend' },
    { id: 'category', label: 'Kategorija' },
    { id: 'price', label: 'Cena' },
  ];

  // Zatvaranje dropdown-a na klik sa strane
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearchFilter = (id) => {
    setSearchFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // --- MODAL STATE ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // --- SHARED DATA ---
  const departmentOptions = [
    { id: 'satovi', label: 'Satovi' },
    { id: 'daljinski', label: 'Daljinski' },
    { id: 'baterije', label: 'Baterije' },
    { id: 'naocare', label: 'Naočare' },
  ];

  // --- BRANDS STATE ---
  const [brands, setBrands] = useState([]);
  const [brandFilters, setBrandFilters] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDept, setNewBrandDept] = useState('');
  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editingBrandName, setEditingBrandName] = useState('');

  // --- CATEGORIES STATE ---
  const [categories, setCategories] = useState([]);
  const [catFilters, setCatFilters] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDept, setNewCatDept] = useState('');
  const [newCatBrand, setNewCatBrand] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [catBrandFilter, setCatBrandFilter] = useState(''); // Filter za brend u kategorijama

  // --- SPECS STATE ---
  const [specs, setSpecs] = useState([]);
  const [specFilters, setSpecFilters] = useState([]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecUnit, setNewSpecUnit] = useState('');
  const [newSpecDept, setNewSpecDept] = useState('');
  const [editingSpecId, setEditingSpecId] = useState(null);
  const [editingSpecName, setEditingSpecName] = useState('');

  // Fetch Data
  useEffect(() => {
    const unsub1 = brandService.subscribe(setBrands, console.error);
    const unsub2 = categoryService.subscribe(setCategories, console.error);
    const unsub3 = specKeyService.subscribe(setSpecs, console.error);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  // Auth Check
  useEffect(() => {
    if (!user || !isAdminEmail(user.email)) nav('/');
  }, [user, nav]);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { duration: 0.8 });
  }, [lenis]);

  if (!user) return null;

  // --- 1. FILTRIRANJE PROIZVODA (VRAĆENO) ---
  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;

    // Ako su uključeni specifični filteri
    if (searchFilters.length > 0) {
      return searchFilters.some((field) => {
        let val = p[field];
        // Fix za stare proizvode koji nemaju department
        if (field === 'department') val = val || 'satovi';
        return String(val || '')
          .toLowerCase()
          .includes(term);
      });
    }

    // Default pretraga (Naziv ili Brend)
    return (
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term)
    );
  });

  // --- 2. FILTRIRANJE BRENDOVA ---
  const visibleBrands = useMemo(() => {
    if (brandFilters.length === 0) return brands;
    return brands.filter((b) =>
      brandFilters.includes(b.department || 'satovi')
    );
  }, [brands, brandFilters]);

  // --- 3. FILTRIRANJE KATEGORIJA ---
  const availableBrandsForFilter = useMemo(() => {
    if (catFilters.length === 0) return brands;
    return brands.filter((b) => catFilters.includes(b.department || 'satovi'));
  }, [brands, catFilters]);

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => {
      const deptMatch =
        catFilters.length === 0 ||
        catFilters.includes(c.department || 'satovi');
      const brandMatch = !catBrandFilter || c.brand === catBrandFilter;
      return deptMatch && brandMatch;
    });
  }, [categories, catFilters, catBrandFilter]);

  const availableBrandsForCat = useMemo(() => {
    if (catFilters.length === 1)
      return brands.filter((b) => (b.department || 'satovi') === catFilters[0]);
    if (newCatDept)
      return brands.filter((b) => (b.department || 'satovi') === newCatDept);
    return brands;
  }, [brands, catFilters, newCatDept]);

  // --- 4. FILTRIRANJE SPECIFIKACIJA ---
  const visibleSpecs = useMemo(() => {
    if (specFilters.length === 0) return specs;
    return specs.filter((s) => specFilters.includes(s.department || 'satovi'));
  }, [specs, specFilters]);

  // --- BRAND ACTIONS ---
  const toggleBrandFilter = (deptId) =>
    setBrandFilters((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId]
    );
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const extra = {
      department:
        (brandFilters.length === 1 ? brandFilters[0] : newBrandDept) ||
        'satovi',
    };
    try {
      await brandService.add(newBrandName, extra);
      setNewBrandName('');
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleUpdateBrand = async () => {
    if (!editingBrandName.trim()) return;
    try {
      await brandService.update(editingBrandId, editingBrandName);
      setEditingBrandId(null);
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleDeleteBrand = async (id) => {
    if (window.confirm('Obriši?')) await brandService.remove(id);
  };

  // --- CATEGORY ACTIONS ---
  const toggleCatFilter = (deptId) => {
    setCatFilters((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId]
    );
    setCatBrandFilter('');
    setNewCatBrand('');
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const brandToUse = catBrandFilter || newCatBrand;
    if (!brandToUse) return alert('Moraš izabrati brend.');

    const brandObj = brands.find((b) => b.name === brandToUse);
    const dept =
      brandObj?.department ||
      (catFilters.length === 1 ? catFilters[0] : newCatDept) ||
      'satovi';

    const extra = { department: dept, brand: brandToUse };
    try {
      await categoryService.add(newCatName, extra);
      setNewCatName('');
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleUpdateCategory = async () => {
    if (!editingCatName.trim()) return;
    try {
      await categoryService.update(editingCatId, editingCatName);
      setEditingCatId(null);
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleDeleteCategory = async (id) => {
    if (window.confirm('Obriši?')) await categoryService.remove(id);
  };

  // --- SPEC ACTIONS ---
  const toggleSpecFilter = (deptId) =>
    setSpecFilters((prev) =>
      prev.includes(deptId)
        ? prev.filter((d) => d !== deptId)
        : [...prev, deptId]
    );
  const handleAddSpec = async (e) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;
    const extra = {
      department:
        (specFilters.length === 1 ? specFilters[0] : newSpecDept) || 'satovi',
      unit: newSpecUnit.trim(),
    };
    try {
      await specKeyService.add(newSpecName, extra);
      setNewSpecName('');
      setNewSpecUnit('');
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleUpdateSpec = async () => {
    if (!editingSpecName.trim()) return;
    try {
      await specKeyService.update(editingSpecId, editingSpecName);
      setEditingSpecId(null);
    } catch (err) {
      alert('Greška.');
    }
  };
  const handleDeleteSpec = async (id) => {
    if (window.confirm('Obriši?')) await specKeyService.remove(id);
  };

  // Product Actions
  const openNew = () => {
    setEditProduct(null);
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setModalOpen(true);
  };
  const handleDeleteProduct = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f5f5f7] rounded-b-2xl">
      <div className="bg-white border-b border-neutral-200 sticky top-[var(--header-bar-h)] z-30 shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">
            Admin Panel
          </h1>
          <div className="flex gap-2 overflow-x-auto px-2 py-4 custom-scrollbar">
            <TabButton
              active={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              icon={Package}
              label="Proizvodi"
            />
            <TabButton
              active={activeTab === 'brands'}
              onClick={() => setActiveTab('brands')}
              icon={Tag}
              label="Brendovi"
            />
            <TabButton
              active={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
              icon={Layers}
              label="Kategorije"
            />
            <TabButton
              active={activeTab === 'specs'}
              onClick={() => setActiveTab('specs')}
              icon={List}
              label="Specifikacije"
            />
          </div>
        </div>
      </div>

      <div className="container mt-8">
        {/* --- PROIZVODI (SADA SA SEARCH FILTEROM) --- */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              {/* SEARCH BAR + FILTER */}
              <div className="flex flex-1 max-w-2xl gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    size={18}
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={
                      searchFilters.length > 0
                        ? `Pretraži po: ${searchFilters
                            .map(
                              (f) => filterOptions.find((o) => o.id === f).label
                            )
                            .join(', ')}...`
                        : 'Pretraži proizvode...'
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-neutral-200 transition-all text-neutral-900"
                  />
                </div>

                {/* FILTER DROPDOWN */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`h-full px-4 rounded-xl border flex items-center gap-2 font-medium transition-all
                      ${
                        searchFilters.length > 0
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                      }`}
                  >
                    <Filter size={18} />
                    <span className="hidden sm:inline">Filteri</span>
                    {searchFilters.length > 0 && (
                      <span className="ml-1 bg-white text-neutral-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {searchFilters.length}
                      </span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        isFilterOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-neutral-100 rounded-xl shadow-xl z-50 overflow-hidden p-1"
                      >
                        <div className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-50 mb-1">
                          Pretraži po:
                        </div>
                        {filterOptions.map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => toggleSearchFilter(opt.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left mb-0.5
                              ${
                                searchFilters.includes(opt.id)
                                  ? 'bg-neutral-50 text-neutral-900 font-semibold'
                                  : 'text-neutral-600 hover:bg-neutral-50'
                              }`}
                          >
                            <span>{opt.label}</span>
                            {searchFilters.includes(opt.id) && (
                              <Check size={16} className="text-emerald-500" />
                            )}
                          </button>
                        ))}
                        <div className="border-t border-neutral-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setSearchFilters([]);
                              setIsFilterOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors uppercase tracking-wide"
                          >
                            Resetuj filtere
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={openNew}
                className="bg-neutral-900 text-white rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-black font-bold"
              >
                <Plus size={20} /> Dodaj Proizvod
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs font-bold tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="p-4">Slika</th>
                      <th className="p-4">Naziv</th>
                      <th className="p-4">Odeljenje</th>
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
                              src={p.image || '/placeholder.png'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-neutral-900">
                          {p.name}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                            {p.department || 'satovi'}
                          </span>
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
                              className="p-2 text-neutral-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 rounded-full"
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
            </div>
          </motion.div>
        )}

        {/* --- BRENDOVI --- */}
        {activeTab === 'brands' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card glass p-6 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-primary">
                    <Tag size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Brendovi</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {departmentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleBrandFilter(opt.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border border-transparent ${
                        brandFilters.includes(opt.id)
                          ? 'bg-neutral-900 text-white shadow-md'
                          : 'bg-white/50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {brandFilters.length > 0 && (
                    <button
                      onClick={() => setBrandFilters([])}
                      className="px-2 text-xs font-bold text-red-400 hover:text-red-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <form onSubmit={handleAddBrand} className="flex gap-2 mb-4">
                {brandFilters.length !== 1 && (
                  <select
                    className="bg-white/5 border border-primary-dark rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                    value={newBrandDept}
                    onChange={(e) => setNewBrandDept(e.target.value)}
                  >
                    <option value="">- Odeljenje -</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
                {brandFilters.length === 1 && (
                  <div className="flex items-center px-3 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl whitespace-nowrap uppercase tracking-wide border border-blue-100">
                    {
                      departmentOptions.find((o) => o.id === brandFilters[0])
                        ?.label
                    }
                  </div>
                )}
                <input
                  className="flex-1 bg-white/5 border border-primary-dark rounded-xl px-4 py-2 text-sm focus:border-primary outline-none transition-colors"
                  placeholder="Novi brend..."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!newBrandName.trim()}
                  className="btn btn--primary rounded-xl px-3"
                >
                  <Plus size={18} />
                </button>
              </form>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar max-h-[500px]">
                <AnimatePresence initial={false}>
                  {visibleBrands.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-primary group transition-colors"
                    >
                      {editingBrandId === item.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            className="flex-1 bg-black/20 rounded-lg px-2 py-1 text-sm outline-none border border-primary/50"
                            value={editingBrandName}
                            onChange={(e) =>
                              setEditingBrandName(e.target.value)
                            }
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateBrand}
                            className="text-emerald-500 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingBrandId(null)}
                            className="text-red-400 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>
                            {brandFilters.length !== 1 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 border border-white/5 uppercase tracking-wider">
                                {item.department || 'satovi'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingBrandId(item.id);
                                setEditingBrandName(item.name);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-primary transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(item.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- KATEGORIJE --- */}
        {activeTab === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card glass p-6 h-full flex flex-col">
              <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 text-primary">
                      <Layers size={20} />
                    </div>
                    <h2 className="text-xl font-bold">Kategorije</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {departmentOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => toggleCatFilter(opt.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border border-transparent ${
                          catFilters.includes(opt.id)
                            ? 'bg-neutral-900 text-white shadow-md'
                            : 'bg-white/50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    {(catFilters.length > 0 || catBrandFilter) && (
                      <button
                        onClick={() => {
                          setCatFilters([]);
                          setCatBrandFilter('');
                        }}
                        className="px-2 text-xs font-bold text-red-400 hover:text-red-600"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-neutral-400" />
                  <select
                    className="bg-white/5 border border-primary-dark rounded-xl px-3 py-1.5 text-xs focus:border-primary outline-none transition-colors min-w-[150px] text-neutral-700"
                    value={catBrandFilter}
                    onChange={(e) => setCatBrandFilter(e.target.value)}
                  >
                    <option value="">Svi Brendovi</option>
                    {availableBrandsForFilter.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <form
                onSubmit={handleAddCategory}
                className="flex flex-wrap gap-2 mb-4 items-end"
              >
                {catFilters.length !== 1 && (
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                      Odeljenje
                    </label>
                    <select
                      className="w-full bg-white/5 border border-primary-dark rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                      value={newCatDept}
                      onChange={(e) => {
                        setNewCatDept(e.target.value);
                        setNewCatBrand('');
                      }}
                    >
                      <option value="">- Izaberi -</option>
                      {departmentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {catFilters.length === 1 && (
                  <div className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl whitespace-nowrap uppercase tracking-wide border border-blue-100 mb-[1px]">
                    {
                      departmentOptions.find((o) => o.id === catFilters[0])
                        ?.label
                    }
                  </div>
                )}
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                    Brend
                  </label>
                  <select
                    className="w-full bg-white/5 border border-primary-dark rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                    value={newCatBrand}
                    onChange={(e) => setNewCatBrand(e.target.value)}
                  >
                    <option value="">- Izaberi Brend -</option>
                    {availableBrandsForCat.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-[2] min-w-[150px]">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                    Naziv
                  </label>
                  <input
                    className="w-full bg-white/5 border border-primary-dark rounded-xl px-4 py-2 text-sm focus:border-primary outline-none transition-colors"
                    placeholder="npr. G-Shock..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    !newCatName.trim() || (!newCatBrand && !catBrandFilter)
                  }
                  className="btn btn--primary rounded-xl px-3 py-2 mb-[1px]"
                >
                  <Plus size={18} />
                </button>
              </form>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar max-h-[500px]">
                <AnimatePresence initial={false}>
                  {visibleCategories.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-primary group transition-colors"
                    >
                      {editingCatId === item.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            className="flex-1 bg-black/20 rounded-lg px-2 py-1 text-sm outline-none border border-primary/50"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateCategory}
                            className="text-emerald-500 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingCatId(null)}
                            className="text-red-400 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-white border border-white/10">
                              {item.brand}
                            </span>
                            {catFilters.length !== 1 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 border border-white/5 uppercase tracking-wider">
                                {item.department || 'satovi'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingCatId(item.id);
                                setEditingCatName(item.name);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-primary transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(item.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- SPECIFIKACIJE --- */}
        {activeTab === 'specs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card glass p-6 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 text-primary">
                    <List size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Karakteristike</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {departmentOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleSpecFilter(opt.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border border-transparent ${
                        specFilters.includes(opt.id)
                          ? 'bg-neutral-900 text-white shadow-md'
                          : 'bg-white/50 text-neutral-500 border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  {specFilters.length > 0 && (
                    <button
                      onClick={() => setSpecFilters([])}
                      className="px-2 text-xs font-bold text-red-400 hover:text-red-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <form
                onSubmit={handleAddSpec}
                className="flex flex-wrap gap-2 mb-4 items-end"
              >
                {specFilters.length !== 1 && (
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                      Odeljenje
                    </label>
                    <select
                      className="w-full bg-white/5 border border-primary-dark rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-colors"
                      value={newSpecDept}
                      onChange={(e) => setNewSpecDept(e.target.value)}
                    >
                      <option value="">- Izaberi -</option>
                      {departmentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {specFilters.length === 1 && (
                  <div className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl whitespace-nowrap uppercase tracking-wide border border-blue-100 mb-[1px]">
                    {
                      departmentOptions.find((o) => o.id === specFilters[0])
                        ?.label
                    }
                  </div>
                )}
                <div className="flex-[2] min-w-[120px]">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                    Naziv
                  </label>
                  <input
                    className="w-full bg-white/5 border border-primary-dark rounded-xl px-4 py-2 text-sm focus:border-primary outline-none transition-colors"
                    placeholder="Npr. Težina"
                    value={newSpecName}
                    onChange={(e) => setNewSpecName(e.target.value)}
                  />
                </div>
                <div className="w-[100px]">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 ml-1">
                    Jed. (opc)
                  </label>
                  <input
                    className="w-full bg-white/5 border border-primary-dark rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-colors text-center"
                    placeholder="g, mm"
                    value={newSpecUnit}
                    onChange={(e) => setNewSpecUnit(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newSpecName.trim()}
                  className="btn btn--primary rounded-xl px-3 py-2 mb-[1px]"
                >
                  <Plus size={18} />
                </button>
              </form>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar max-h-[500px]">
                <AnimatePresence initial={false}>
                  {visibleSpecs.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-primary group transition-colors"
                    >
                      {editingSpecId === item.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            className="flex-1 bg-black/20 rounded-lg px-2 py-1 text-sm outline-none border border-primary/50"
                            value={editingSpecName}
                            onChange={(e) => setEditingSpecName(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateSpec}
                            className="text-emerald-500 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingSpecId(null)}
                            className="text-red-400 p-1 hover:bg-white/10 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {item.name}
                            </span>{' '}
                            {item.unit && (
                              <span className="text-xs text-neutral-400 bg-white/10 px-1.5 rounded">
                                ({item.unit})
                              </span>
                            )}{' '}
                            {specFilters.length !== 1 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-neutral-400 border border-white/5 uppercase tracking-wider">
                                {item.department || 'satovi'}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingSpecId(item.id);
                                setEditingSpecName(item.name);
                              }}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-primary transition-colors"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSpec(item.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <AdminProductModal
            product={editProduct}
            onClose={() => setModalOpen(false)}
            onSuccess={() => {}}
          />
        )}
      </AnimatePresence>
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteProduct}
        title="Obriši proizvod?"
        description="Ovaj proizvod će biti trajno uklonjen."
        confirmText="Obriši"
        isDanger={true}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
        active
          ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-300 scale-105'
          : 'bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border border-neutral-200'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );
}
