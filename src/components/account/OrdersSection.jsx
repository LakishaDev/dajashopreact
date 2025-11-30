import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';
import './OrdersSection.css';
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
} from 'firebase/firestore';

// Uvozimo novu komponentu za prikaz pojedinačne porudžbine
import OrderCard from './OrderCard';

function OrdersSection() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ako korisnik nije ulogovan, nemamo šta da učitamo
    if (!user || !user.email) {
      setLoading(false);
      return;
    } // KREIRANJE UPITA: // 1. Gađamo kolekciju 'orders' // 2. Tražimo samo one gde je customer.email isti kao user.email // 3. Sortiramo po vremenu kreiranja (createdAt) opadajuće (najnovije prvo) // NAPOMENA: Potrebno je kreirati Firebase indeks za ovaj upit!

    const q = query(
      collection(db, 'orders'),
      where('customer.email', '==', user.email),
      orderBy('createdAt', 'desc')
    ); // SLUŠANJE PROMENA (Real-time):

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((doc) => ({
          // [ISPRAVKA]: Koristimo polje 'displayId' (DAJA-xxxxxx) za prikaz,
          // a fallback je stvarni ID dokumenta
          id: doc.data().displayId || doc.id, // Svi ostali podaci
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
        setLoading(false);
      },
      (error) => {
        console.error('Greška pri učitavanju porudžbina:', error);
        setLoading(false);
      }
    ); // Čišćenje listenera kad se komponenta unmountuje

    return () => unsubscribe();
  }, [user]);

  if (loading)
    return (
      <div className="loading-state py-12 flex flex-col items-center justify-center text-[var(--color-muted)]">
                <Loader2 className="animate-spin mb-4" size={32} />       {' '}
        <p>Učitavanje Vaših porudžbina...</p>     {' '}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-content"
    >
           {' '}
      <div className="section-header-row mb-6">
               {' '}
        <h3 className="text-2xl font-bold text-[var(--color-text)]">
                    Moje porudžbine        {' '}
        </h3>
             {' '}
      </div>
           {' '}
      {orders.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center py-12 text-center border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                   {' '}
          <Package
            size={48}
            className="text-[var(--color-muted)] opacity-30 mb-4"
          />
                   {' '}
          <p className="text-[var(--color-text)] font-medium">
                        Još uvek nemate porudžbina.          {' '}
          </p>
                   {' '}
          <p className="text-sm text-[var(--color-muted)] mt-2">
                        Istražite našu ponudu i pronađite savršen sat za sebe.  
                   {' '}
          </p>
                 {' '}
        </div>
      ) : (
        <div className="orders-list space-y-4">
                   {' '}
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
                 {' '}
        </div>
      )}
         {' '}
    </motion.div>
  );
}

export default OrdersSection;
