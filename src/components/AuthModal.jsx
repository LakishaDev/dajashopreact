import React, { useEffect, useMemo, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  X,
  Facebook,
  Smartphone,
  AtSign,
  ShieldCheck,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth.js';

import './AuthModal.css';

import FlashModal from './modals/FlashModal.jsx';

export default function AuthModal() {
  const {
    authOpen,

    hideAuth,

    mode,

    setMode,

    login,

    register,

    confirmPhoneCode,

    oauth,

    pendingEmailVerify,

    detectIdentity,
  } = useAuth();

  const isLogin = mode === 'login';

  // slider tab

  function go(next) {
    setMode(next);
  }

  const [identity, setIdentity] = useState('');

  const [password, setPassword] = useState('');

  const [name, setName] = useState('');

  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  const [awaitPhoneCode, setAwaitPhoneCode] = useState(false);

  const [smsCode, setSmsCode] = useState('');

  const [sentTo, setSentTo] = useState(''); // prikaz broja u info traci

  // flash success modal

  const [flashOpen, setFlashOpen] = useState(false);

  const [flashTitle, setFlashTitle] = useState('');

  const [flashSub, setFlashSub] = useState('');

  const idType = useMemo(
    () => detectIdentity(identity).type,

    [identity, detectIdentity]
  );

  // lock scroll iza modala

  useEffect(() => {
    if (!authOpen) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prev;
    };
  }, [authOpen]);

  useEffect(() => {
    // reset per tab

    setPassword('');

    setSmsCode('');

    setAwaitPhoneCode(false);

    setSentTo('');
  }, [mode]);

  const isPhone = idType === 'phone';

  const showPassword = !isPhone;

  function openFlash(msg, sub = '') {
    setFlashTitle(msg);

    setFlashSub(sub);

    setFlashOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      if (isLogin) {
        const r = await login({ identity, password });

        if (r === 'phone-code') {
          setAwaitPhoneCode(true);

          setSentTo(identity);
        } else {
          hideAuth();

          openFlash('Prijava uspešna', 'Dobro došao nazad! ⌚');
        }
      } else {
        const r = await register({ identity, password, name });

        if (r === 'phone-code') {
          setAwaitPhoneCode(true);

          setSentTo(identity);
        } else if (pendingEmailVerify) {
          // ostaje u modalu i prikazuje "Proveri email"
        } else {
          hideAuth();

          openFlash('Registracija uspešna', 'Srećna kupovina! 🛍️');
        }
      }
    } catch (err) {
      alert(err.message || 'Greška.');
    } finally {
      setLoading(false);
    }
  }

  async function onConfirmCode(e) {
    e.preventDefault();

    setLoading(true);

    try {
      await confirmPhoneCode(smsCode);

      hideAuth();

      openFlash(
        isLogin ? 'Prijava uspešna' : 'Registracija uspešna',

        'Broj telefona verifikovan ✅'
      );
    } catch (err) {
      alert(err.message || 'Nevažeći kod.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOauth(provider) {
    try {
      setLoading(true);

      await oauth(provider);

      hideAuth();

      openFlash(
        'Uspeh',

        provider === 'google'
          ? 'Google prijava je prošla.'
          : 'Facebook prijava je prošla.'
      );
    } catch (err) {
      alert(err?.message || 'Greška pri OAuth prijavi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FLASH modal – stoji izvan Auth overlay-a da ostane vidljiv i nakon hideAuth() */}

      <FlashModal
        open={flashOpen}
        title={flashTitle}
        subtitle={flashSub}
        onClose={() => setFlashOpen(false)}
        duration={2000}
      />

      <AnimatePresence>
        {authOpen && (
          <motion.div
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="auth-card glass"
              role="dialog"
              aria-modal="true"
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <button
                className="icon-btn close"
                onClick={hideAuth}
                aria-label="Zatvori"
              >
                <X size={20} />
              </button>

              {/* TAB BAR */}

              <div className="tabs">
                <motion.button
                  className={`tab ${isLogin ? 'active' : ''}`}
                  onClick={() => go('login')}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: 'spring',

                    stiffness: 800,

                    damping: 35,

                    mass: 0.35,
                  }}
                >
                  <span className="tab-label">Prijava</span>

                  {isLogin && (
                    <motion.span
                      layoutId="tabPill"
                      className="tab-pill"
                      transition={{
                        type: 'spring',

                        stiffness: 700,

                        damping: 40,

                        mass: 0.45,
                      }}
                    />
                  )}
                </motion.button>

                <motion.button
                  className={`tab ${!isLogin ? 'active' : ''}`}
                  onClick={() => go('register')}
                  whileTap={{ scale: 0.96 }}
                  transition={{
                    type: 'spring',

                    stiffness: 800,

                    damping: 35,

                    mass: 0.35,
                  }}
                >
                  <span className="tab-label">Registracija</span>

                  {!isLogin && (
                    <motion.span
                      layoutId="tabPill"
                      className="tab-pill"
                      transition={{
                        type: 'spring',

                        stiffness: 700,

                        damping: 40,

                        mass: 0.45,
                      }}
                    />
                  )}
                </motion.button>
              </div>

              {/* SLIDER */}

              <div className="form-slider">
                <motion.div
                  className="track"
                  animate={{ x: isLogin ? '0%' : '-100%' }}
                  transition={{
                    type: 'spring',

                    stiffness: 520,

                    damping: 38,

                    bounce: 0.25,
                  }}
                >
                  {/* PRIJAVA */}

                  <div
                    className={`pane ${isLogin ? 'active' : 'inactive'}`}
                    aria-hidden={!isLogin}
                  >
                    <div className="pane-inner">
                      {!awaitPhoneCode ? (
                        <form className="form" onSubmit={onSubmit}>
                          <label className="field">
                            <span>Identitet</span>

                            <div className="input">
                              {idType === 'phone' ? (
                                <Smartphone className="ico" size={18} />
                              ) : idType === 'username' ? (
                                <AtSign className="ico" size={18} />
                              ) : (
                                <Mail className="ico" size={18} />
                              )}

                              <input
                                type="text"
                                placeholder="Email / korisničko ime / +3816…"
                                value={identity}
                                onChange={(e) =>
                                  setIdentity(e.target.value.trim())
                                }
                                required
                              />
                            </div>
                          </label>

                          {showPassword && (
                            <label className="field">
                              <span>Lozinka</span>

                              <div className="input">
                                <Lock className="ico" size={18} />

                                <input
                                  type={showPass ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  minLength={6}
                                />

                                <button
                                  type="button"
                                  className="icon-btn"
                                  onClick={() => setShowPass((p) => !p)}
                                  aria-label={
                                    showPass
                                      ? 'Sakrij lozinku'
                                      : 'Prikaži lozinku'
                                  }
                                >
                                  {showPass ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </label>
                          )}

                          <motion.button
                            className="btn-primary w-full"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                              type: 'spring',

                              stiffness: 700,

                              damping: 30,
                            }}
                          >
                            {loading ? 'Prijavljivanje…' : 'Prijavi se'}
                          </motion.button>

                          {/* OAUTH dugmad */}

                          <div className="oauth-row">
                            <button
                              type="button"
                              className="btn-oauth"
                              onClick={() => handleOauth('google')}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                              >
                                <path
                                  fill="#EA4335"
                                  d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.6C16.9 3.1 14.7 2 12 2 6.9 2 3 5.9 3 11s3.9 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1-.1-1.4H12z"
                                />
                              </svg>

                              <span>Google</span>
                            </button>

                            <button
                              type="button"
                              className="btn-oauth"
                              onClick={() => handleOauth('facebook')}
                            >
                              <Facebook size={18} />

                              <span>Facebook</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form className="form" onSubmit={onConfirmCode}>
                          {/* INFO traka iznad polja */}

                          <div className="verify-box">
                            Na vaš broj {sentTo || 'telefona'} poslali smo SMS
                            kod za verifikaciju. Unesite ga ispod. 📲
                          </div>

                          <label className="field">
                            <span>SMS kod</span>

                            <div className="input">
                              <ShieldCheck className="ico" size={18} />

                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="123456"
                                value={smsCode}
                                onChange={(e) => setSmsCode(e.target.value)}
                                required
                                minLength={6}
                                maxLength={6}
                              />
                            </div>
                          </label>

                          <motion.button
                            className="btn-primary w-full"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                              type: 'spring',

                              stiffness: 700,

                              damping: 30,
                            }}
                          >
                            Potvrdi kod
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* REGISTRACIJA */}

                  <div
                    className={`pane ${!isLogin ? 'active' : 'inactive'}`}
                    aria-hidden={isLogin}
                  >
                    <div className="pane-inner">
                      {!awaitPhoneCode && !pendingEmailVerify ? (
                        <form className="form" onSubmit={onSubmit}>
                          <label className="field">
                            <span>Ime i prezime</span>

                            <div className="input">
                              <User className="ico" size={18} />

                              <input
                                type="text"
                                placeholder="npr. Marko Marković"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                              />
                            </div>
                          </label>

                          <label className="field">
                            <span>Email ili broj telefona</span>

                            <div className="input">
                              {idType === 'phone' ? (
                                <Smartphone className="ico" size={18} />
                              ) : (
                                <Mail className="ico" size={18} />
                              )}

                              <input
                                type="text"
                                placeholder="ime@primer.com ili +3816…"
                                value={identity}
                                onChange={(e) =>
                                  setIdentity(e.target.value.trim())
                                }
                                required
                              />
                            </div>
                          </label>

                          {idType !== 'phone' && (
                            <label className="field">
                              <span>Lozinka</span>

                              <div className="input">
                                <Lock className="ico" size={18} />

                                <input
                                  type={showPass ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  required
                                  minLength={6}
                                />

                                <button
                                  type="button"
                                  className="icon-btn"
                                  onClick={() => setShowPass((p) => !p)}
                                  aria-label={
                                    showPass
                                      ? 'Sakrij lozinku'
                                      : 'Prikaži lozinku'
                                  }
                                >
                                  {showPass ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>
                            </label>
                          )}

                          <motion.button
                            className="btn-primary w-full"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                              type: 'spring',

                              stiffness: 700,

                              damping: 30,
                            }}
                          >
                            {loading ? 'Kreiranje naloga…' : 'Napravi nalog'}
                          </motion.button>

                          {/* OAUTH dugmad */}

                          <div className="oauth-row">
                            <button
                              type="button"
                              className="btn-oauth"
                              onClick={() => handleOauth('google')}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                aria-hidden="true"
                              >
                                <path
                                  fill="#EA4335"
                                  d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.6C16.9 3.1 14.7 2 12 2 6.9 2 3 5.9 3 11s3.9 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1-.1-1.4H12z"
                                />
                              </svg>

                              <span>Google</span>
                            </button>

                            <button
                              type="button"
                              className="btn-oauth"
                              onClick={() => handleOauth('facebook')}
                            >
                              <Facebook size={18} />

                              <span>Facebook</span>
                            </button>
                          </div>
                        </form>
                      ) : pendingEmailVerify ? (
                        <div className="verify-box">
                          <h3>Proveri email 📬</h3>

                          <p>
                            Poslali smo link za verifikaciju. Otvori email i
                            potvrdi nalog, pa zatvori ovaj prozor.
                          </p>
                        </div>
                      ) : (
                        <form className="form" onSubmit={onConfirmCode}>
                          {/* INFO traka iznad polja */}

                          <div className="verify-box">
                            Na vaš broj {sentTo || 'telefona'} poslali smo SMS
                            kod za verifikaciju. Unesite ga ispod. 📲
                          </div>

                          <label className="field">
                            <span>SMS kod</span>

                            <div className="input">
                              <ShieldCheck className="ico" size={18} />

                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="123456"
                                value={smsCode}
                                onChange={(e) => setSmsCode(e.target.value)}
                                required
                                minLength={6}
                                maxLength={6}
                              />
                            </div>
                          </label>

                          <motion.button
                            className="btn-primary w-full"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                              type: 'spring',

                              stiffness: 700,

                              damping: 30,
                            }}
                          >
                            Potvrdi kod
                          </motion.button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Firebase ReCAPTCHA host (invisible) */}

              <div id="recaptcha-container" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
