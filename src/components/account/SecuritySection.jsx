// src/components/account/SecuritySection.jsx

import React, { useState } from 'react';
import { useFlash } from '../../hooks/useFlash.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, KeyRound, ShieldCheck } from 'lucide-react';

import { auth } from '../../services/firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

import SecuritySettings from '../account/SecuritySettings.jsx';

// --- SECURITY SECTION (Change Password) ---
function SecuritySection({ user }) {
  const { flash } = useFlash();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      flash('Greška', 'Lozinke se ne poklapaju.', 'error');
      return;
    }
    if (newPass.length < 6) {
      flash('Greška', 'Nova lozinka mora imati bar 6 karaktera.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (user.providerData.some((p) => p.providerId === 'password')) {
        const cred = EmailAuthProvider.credential(user.email, currentPass);
        await reauthenticateWithCredential(user, cred);

        await updatePassword(user, newPass);

        flash('Uspeh', 'Lozinka je uspešno promenjena.', 'success');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        flash(
          'Greška',
          'Promena lozinke nije moguća za korisnike prijavljene preko društvenih mreža.',
          'error'
        );
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        flash('Greška', 'Pogrešna trenutna lozinka.', 'error');
      } else if (err.code === 'auth/too-many-requests') {
        flash('Greška', 'Previše pokušaja. Probajte kasnije.', 'error');
      } else {
        flash('Greška', 'Došlo je do greške prilikom izmene.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isEmailPasswordUser = user.providerData.some(
    (p) => p.providerId === 'password'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-content"
    >
      <div className="section-header-row">
        <h3>Bezbednost & Privatnost</h3>
      </div>

      <div className="card glass" style={{ padding: '24px' }}>
        <h4
          className="text-lg font-bold mb-4 flex items-center gap-2"
          style={{ marginBottom: '20px', fontSize: '1.1rem' }}
        >
          <ShieldCheck size={20} className="text-[var(--color-primary)]" />{' '}
          Promena lozinke
        </h4>

        <AnimatePresence mode="wait">
          {isEmailPasswordUser ? (
            <motion.form
              key="form"
              onSubmit={handleUpdate}
              className="max-w-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div
                className="form-grid"
                style={{ gridTemplateColumns: '1fr', gap: '16px' }}
              >
                <label>
                  <span>Trenutna lozinka</span>
                  <div className="input-with-icon">
                    <KeyRound size={16} className="input-icon-left" />
                    <input
                      type="password"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="••••••"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>Nova lozinka</span>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon-left" />
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Min. 6 karaktera"
                      required
                    />
                  </div>
                </label>
                <label>
                  <span>Potvrdi novu lozinku</span>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon-left" />
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Ponovi novu lozinku"
                      required
                    />
                  </div>
                </label>
              </div>
              <div className="form-actions mt-6">
                <button className="btn-primary" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Promeni lozinku'
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="info"
              className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-semibold">
                Nije moguće menjati lozinku ovde. Koristite svoj nalog na
                društvenoj mreži ({user.providerData[0]?.providerId}) za
                prijavu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="card glass" style={{ padding: '24px' }}>
        <h4
          className="text-lg font-bold mb-4 flex items-center gap-2"
          style={{ marginBottom: '20px', fontSize: '1.1rem' }}
        >
          <KeyRound size={20} className="text-[var(--color-primary)]" />{' '}
          Autentifikacija
        </h4>

        <AnimatePresence mode="wait">
          <SecuritySettings />
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default SecuritySection;
