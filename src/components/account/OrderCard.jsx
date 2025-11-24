// src/components/account/OrderCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronDown,
  MapPin,
  Phone,
  CreditCard,
  Clock,
} from 'lucide-react';
import { money } from '../../utils/currency';

export default function OrderCard({ order }) {
  const [isOpen, setIsOpen] = useState(false);

  // Određivanje boje bedža na osnovu statusa
  const getStatusColor = (status) => {
    switch (status) {
      case 'Isporučeno':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Otkazano':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Poslato':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; // Na čekanju
    }
  };

  return (
    <motion.div
      className="order-card-modern card glass mb-4 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* HEADER KARTICE - Uvek vidljiv */}
      <div
        className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)]">
            <Package size={24} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[var(--color-text)] m-0">
              #{order.id}
            </h4>
            <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mt-1">
              <Clock size={14} />
              <span>{order.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
          <div className="text-right hidden sm:block">
            <span className="block text-xs text-[var(--color-muted)]">
              Ukupno
            </span>
            <span className="block font-bold text-[var(--color-primary)] text-lg">
              {money(order.finalTotal)}
            </span>
          </div>
          <ChevronDown
            size={20}
            className={`text-[var(--color-muted)] transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* DETALJI - Expandable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--color-border)] bg-[var(--color-bg-subtle)]"
          >
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LISTA PROIZVODA */}
              <div>
                <h5 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                  Artikli
                </h5>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start text-sm"
                    >
                      <span className="text-[var(--color-text)]">
                        <span className="text-[var(--color-primary)] font-bold">
                          {item.qty}x
                        </span>{' '}
                        {item.name}
                      </span>
                      <span className="text-[var(--color-text)] font-medium">
                        {money(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex justify-between items-center">
                  <span className="text-[var(--color-muted)]">Dostava:</span>
                  <span className="text-[var(--color-text)]">
                    {order.shippingCost === 0
                      ? 'Besplatna'
                      : money(order.shippingCost)}
                  </span>
                </div>
              </div>

              {/* INFO O DOSTAVI */}
              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                    Podaci za dostavu
                  </h5>
                  <div className="flex items-start gap-2 text-sm text-[var(--color-text)]">
                    <MapPin
                      size={16}
                      className="mt-1 text-[var(--color-primary)] shrink-0"
                    />
                    <div>
                      <p className="font-bold">
                        {order.customer.name} {order.customer.surname}
                      </p>
                      {order.shippingMethod === 'pickup' ? (
                        <p className="text-[var(--color-muted)]">
                          Lično preuzimanje u radnji (Niš)
                        </p>
                      ) : (
                        <p className="text-[var(--color-muted)]">
                          {order.customer.address}, {order.customer.postalCode}{' '}
                          {order.customer.city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                    Plaćanje & Kontakt
                  </h5>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text)] mb-1">
                    <CreditCard
                      size={16}
                      className="text-[var(--color-primary)]"
                    />
                    <span>
                      {order.paymentMethod === 'cod' ? 'Pouzećem' : 'Karticom'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <Phone size={16} className="text-[var(--color-primary)]" />
                    <span>{order.customer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
