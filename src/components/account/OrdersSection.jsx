// src/components/account/OrdersSection.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { motion } from 'framer-motion';
import { money } from '../../utils/currency.js';
import { Package, ChevronRight, Clock, Loader2 } from 'lucide-react';

import { db } from '../../services/firebase';
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';

function OrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'orders'),
      where('customer.email', '==', user.email),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Greška pri učitavanju porudžbina:', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  if (loading)
    return (
      <div className="loading-state">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Moje porudžbine</h3>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} className="text-muted" style={{ opacity: 0.3 }} />
          <p>Nemate prethodnih porudžbina.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-item card glass">
              <div className="order-icon">
                <Package size={24} />
              </div>
              <div className="order-details">
                <div className="order-top">
                  <h4>#{order.id}</h4>
                  <span
                    className={`status-badge ${
                      order.status === 'Isporučeno'
                        ? 'success'
                        : order.status === 'Otkazano'
                        ? 'cancelled'
                        : 'pending'
                    }`}
                  >
                    {order.status || 'Na čekanju'}
                  </span>
                </div>
                <div className="order-meta">
                  <span>
                    <Clock size={14} /> {order.date}
                  </span>
                  <span>•</span>
                  <span>{order.items?.length || 0} artikl(a)</span>
                </div>
              </div>
              <div className="order-right">
                <div className="order-total">
                  {money(order.finalTotal || order.total)}
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default OrdersSection;
