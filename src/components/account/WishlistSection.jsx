import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { money } from '../../utils/currency.js';
import { useWishlist } from '../../context/WishlistProvider.jsx';
import { useCart } from '../../hooks/useCart.js';
import { useFlash } from '../../hooks/useFlash.js';
import { useUndo } from '../../hooks/useUndo.js';
import { Link } from 'react-router-dom';
import ConfirmModal from '../modals/ConfirmModal.jsx';

function WishlistSection() {
  // Uzimamo addToWishlist iz context-a
  const { wishlist, removeFromWishlist, addToWishlist } = useWishlist();
  const { dispatch } = useCart();
  const { flash } = useFlash();
  const { showUndo } = useUndo();

  const [deleteId, setDeleteId] = useState(null);

  const moveToCart = (item) => {
    dispatch({
      type: 'ADD',
      item: item,
    });
    flash('Prebačeno', 'Proizvod prebačen u korpu.', 'cart');
    removeFromWishlist(item.id);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      // 1. Sačuvaj item
      const itemToRemove = wishlist.find((i) => i.id === deleteId);

      // 2. Obriši
      removeFromWishlist(deleteId);

      // 3. Undo Toast
      if (itemToRemove) {
        showUndo(itemToRemove, () => {
          // 4. KORISTIMO 'addToWishlist' UMESTO 'toggle'
          // Ovo garantuje da će se proizvod vratiti, a ne ponovo obrisati
          addToWishlist(itemToRemove);
        });
      }

      setDeleteId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Lista želja ({wishlist.length})</h3>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center py-12 text-center">
          <Heart
            size={48}
            className="text-muted mb-4"
            style={{ opacity: 0.3 }}
          />
          <p className="text-muted">Još niste sačuvali nijedan proizvod.</p>
          <Link
            to="/catalog"
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Istraži katalog
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid grid grid-cols-1 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="card glass p-4 flex items-center gap-4"
            >
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover bg-white border border-neutral-100"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="hover:underline">
                  <h4 className="font-bold text-sm md:text-base truncate">
                    {item.name}
                  </h4>
                </Link>
                <span className="text-xs text-muted uppercase font-bold block mb-1">
                  {item.brand}
                </span>
                <p className="text-neutral-900 font-mono text-sm font-bold">
                  {money(item.price)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => moveToCart(item)}
                  className="p-2 rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors"
                  title="Prebaci u korpu"
                >
                  <ShoppingCart size={18} />
                </button>

                <button
                  onClick={() => setDeleteId(item.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Ukloni"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Ukloni iz liste želja?"
        description="Da li ste sigurni da želite da uklonite ovaj proizvod iz liste želja?"
        confirmText="Ukloni"
        isDanger={true}
      />
    </motion.div>
  );
}

export default WishlistSection;
