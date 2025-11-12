import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "./AuthModal.css";

export default function AuthModal() {
  const { authOpen, hideAuth, mode, setMode, login, register } = useAuth();
  const isLogin = mode === "login";

  // bez čekanja – obe forme su mount-ovane, kliza se track
  function go(next) {
    setMode(next);
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) await login({ email, password });
      else await register({ name, email, password });
      setEmail("");
      setPassword("");
      setName("");
      hideAuth();
    } finally {
      setLoading(false);
    }
  }

  return (
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
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
          >
            <button
              className="icon-btn close"
              onClick={hideAuth}
              aria-label="Zatvori"
            >
              <X size={20} />
            </button>

            {/* TAB BAR – klizna bela pozadina */}
            <div className="tabs">
              <motion.button
                className={`tab ${isLogin ? "active" : ""}`}
                onClick={() => go("login")}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
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
                      type: "spring",
                      stiffness: 700,
                      damping: 40,
                      mass: 0.45,
                    }}
                  />
                )}
              </motion.button>

              <motion.button
                className={`tab ${!isLogin ? "active" : ""}`}
                onClick={() => go("register")}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
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
                      type: "spring",
                      stiffness: 700,
                      damping: 40,
                      mass: 0.45,
                    }}
                  />
                )}
              </motion.button>
            </div>

            {/* SLIDER: obe forme mount-ovane, track kliza 0% / -100% */}
            <div className="form-slider">
              <motion.div
                className="track"
                animate={{ x: isLogin ? "0%" : "-100%" }}
                transition={{
                  type: "spring",
                  stiffness: 520,
                  damping: 38,
                  bounce: 0.25,
                }}
              >
                {/* PRIJAVA */}
                <div
                  className={`pane ${isLogin ? "active" : "inactive"}`}
                  aria-hidden={!isLogin}
                >
                  <div className="pane-inner">
                    <form className="form" onSubmit={onSubmit}>
                      <label className="field">
                        <span>Email</span>
                        <div className="input">
                          <Mail className="ico" size={18} />
                          <input
                            type="email"
                            placeholder="ime@primer.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </label>

                      <label className="field">
                        <span>Lozinka</span>
                        <div className="input">
                          <Lock className="ico" size={18} />
                          <input
                            type={showPass ? "text" : "password"}
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
                              showPass ? "Sakrij lozinku" : "Prikaži lozinku"
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

                      <motion.button
                        className="btn-primary w-full"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                          type: "spring",
                          stiffness: 700,
                          damping: 30,
                        }}
                      >
                        {loading ? "Prijavljivanje…" : "Prijavi se"}
                      </motion.button>

                      <p className="hint">
                        Nemaš nalog?{" "}
                        <button
                          type="button"
                          className="link"
                          onClick={() => go("register")}
                        >
                          Registruj se
                        </button>
                      </p>
                    </form>
                  </div>
                </div>

                {/* REGISTRACIJA */}
                <div
                  className={`pane ${!isLogin ? "active" : "inactive"}`}
                  aria-hidden={isLogin}
                >
                  <div className="pane-inner">
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
                        <span>Email</span>
                        <div className="input">
                          <Mail className="ico" size={18} />
                          <input
                            type="email"
                            placeholder="ime@primer.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </label>

                      <label className="field">
                        <span>Lozinka</span>
                        <div className="input">
                          <Lock className="ico" size={18} />
                          <input
                            type={showPass ? "text" : "password"}
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
                              showPass ? "Sakrij lozinku" : "Prikaži lozinku"
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

                      <motion.button
                        className="btn-primary w-full"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        transition={{
                          type: "spring",
                          stiffness: 700,
                          damping: 30,
                        }}
                      >
                        {loading ? "Kreiranje naloga…" : "Napravi nalog"}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
