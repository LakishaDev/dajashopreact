// src/pages/Account.jsx

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import './Account.css';

// Uvezene izdvojene komponente
import AccountNav from '../components/account/AccountNav.jsx';
import ProfileSection from '../components/account/ProfileSection.jsx';
import AddressSection from '../components/account/AddressSection.jsx';
import WishlistSection from '../components/account/WishlistSection.jsx';
import OrdersSection from '../components/account/OrdersSection.jsx';
import SecuritySection from '../components/account/SecuritySection.jsx';
import { AnimatePresence } from 'framer-motion';

// NAPOMENA: Sve uvezene biblioteke i servisi (firebase, lucide-react, money, useFlash, ConfimModal, SecuritySettings, FORM_RULES)
// su premešteni u odgovarajuće komponente/sekcije koje ih koriste.

export default function Account() {
  const { user, logout, showAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="container account-page centered">
        <motion.div
          className="glass account-empty-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Nova klasa za ikonu - veća i u primarnoj boji */}
          <div className="empty-icon-wrap large">
            <User size={64} />
          </div>

          <h1>Dobrodošli u Daja Shop Nalog</h1>
          <p className="lead">
            Prijavom dobijate pristup praćenju statusa porudžbina, čuvanju
            adresa i kreiranju liste želja.
          </p>

          <div className="auth-actions">
            {/* Primarno dugme za logovanje je sada fokus */}
            <button
              className="btn-primary large"
              onClick={() => showAuth('login')}
            >
              Prijavi se odmah
            </button>
            {/* Sekundarno dugme sa novom klasom */}
            <button
              className="btn-link-primary"
              onClick={() => showAuth('register')}
            >
              Novi korisnik? Registruj se
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="container account-dashboard">
      <AccountNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logout={logout}
      />
      <main className="account-main">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && <ProfileSection key="prof" user={user} />}
          {activeTab === 'orders' && <OrdersSection key="ord" user={user} />}
          {activeTab === 'security' && (
            <SecuritySection key="sec" user={user} />
          )}
          {activeTab === 'addresses' && (
            <AddressSection key="addr" user={user} />
          )}
          {activeTab === 'wishlist' && <WishlistSection key="wish" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
