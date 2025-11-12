# 📦 Auth modul za Dajashop (Account + Modal + Context)

> Komplet komponente za prijavu/registraciju sa glass‑morphism UI, framer‑motion animacijama i lucide ikonama. Responsive i uklapa se u postojeću temu (CSS varijable: `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-primary`, `--color-accent`).

---

## 1) Instalacija dependencija

```bash
npm i framer-motion lucide-react
```

---

## 2) Kontext i provider

**`src/context/AuthContext.jsx`**

```jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register"

  useEffect(() => {
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  }, [user]);

  function showAuth(nextMode = "login") {
    setMode(nextMode);
    setAuthOpen(true);
  }
  function hideAuth() { setAuthOpen(false); }

  async function login({ email, password }) {
    // TODO: zameniti pravim API pozivom
    await new Promise(r => setTimeout(r, 400));
    const name = email.split("@")[0];
    setUser({ id: crypto.randomUUID(), name, email });
  }

  async function register({ name, email, password }) {
    // TODO: zameniti pravim API pozivom
    await new Promise(r => setTimeout(r, 500));
    setUser({ id: crypto.randomUUID(), name, email });
  }

  function logout() { setUser(null); }

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    authOpen, showAuth, hideAuth, mode, setMode,
  }), [user, authOpen, mode]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

---

## 3) Modal sa framer‑motion i lucide ikonama

**`src/components/AuthModal.jsx`**

```jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, X } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

export default function AuthModal() {
  const { authOpen, hideAuth, mode, setMode, login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) await login({ email, password });
      else await register({ name, email, password });
      hideAuth();
      setEmail(""); setPassword(""); setName("");
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
            initial={{ y: 30, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            role="dialog"
            aria-modal="true"
          >
            <button className="icon-btn close" onClick={hideAuth} aria-label="Zatvori">
              <X size={20} />
            </button>

            <div className="tabs">
              <button
                className={`tab ${isLogin ? "active" : ""}`}
                onClick={() => setMode("login")}
              >Prijava</button>
              <button
                className={`tab ${!isLogin ? "active" : ""}`}
                onClick={() => setMode("register")}
              >Registracija</button>
            </div>

            <form className="form" onSubmit={onSubmit}>
              {!isLogin && (
                <label className="field">
                  <span>Ime i prezime</span>
                  <div className="input">
                    <User className="ico" size={18} />
                    <input
                      type="text"
                      placeholder="npr. Marko Marković"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </label>
              )}

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
                  <button type="button" className="icon-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <button className="btn-primary w-full" disabled={loading}>
                {loading ? (isLogin ? "Prijavljivanje…" : "Kreiranje naloga…") : (isLogin ? "Prijavi se" : "Napravi nalog")}
              </button>

              {isLogin && (
                <p className="hint">Nemaš nalog? <button type="button" className="link" onClick={() => setMode("register")}>Registruj se</button></p>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 4) Account stranica (sa Odjavom)

**`src/pages/Account.jsx`**

```jsx
import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import "../styles/auth.css";

export default function Account() {
  const { user, logout, showAuth } = useAuth();

  if (!user) {
    return (
      <div className="container account-page">
        <motion.div
          className="glass account-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Moj nalog</h1>
          <p>Nisi prijavljen. Prijavi se ili napravi nalog.</p>
          <div className="row">
            <button className="btn-primary" onClick={() => showAuth("login")}>Prijavi se</button>
            <button className="btn-secondary" onClick={() => showAuth("register")}>Registruj se</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container account-page">
      <motion.div
        className="glass account-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="userline">
          <div className="avatar">
            <User size={22} />
          </div>
          <div>
            <h1>Zdravo, {user.name}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>
        <div className="row">
          <button className="btn-danger" onClick={logout}>
            <LogOut size={18} />
            <span>Odjavi se</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

---

## 5) Dugme za header (Prijavi se / avatar)

**`src/components/HeaderLoginButton.jsx`**

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/auth.css";

export default function HeaderLoginButton() {
  const { user, showAuth, logout } = useAuth();

  if (!user) {
    return (
      <button className="btn-ghost pill" onClick={() => showAuth("login")}>
        <User size={18} />
        <span>Prijavi se</span>
      </button>
    );
  }

  return (
    <div className="header-user">
      <Link to="/account" className="avatar small" aria-label="Moj nalog">
        <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
      </Link>
      <button className="link" onClick={logout}>Odjava</button>
    </div>
  );
}
```

---

## 6) Uključi modal globalno (na vrhu app‑a)

**`src/App.jsx`** (primer integracije)

```jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AuthModal from "./components/AuthModal.jsx";
import Account from "./pages/Account.jsx";
// ... ostale import-e (Home, Catalog, NavBar, itd.)

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* NavBar ide ovde */}
        {/* Modal je globalan da bi radio iz header-a */}
        <AuthModal />

        <Routes>
          {/* ostale rute */}
          <Route path="/account" element={<Account />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 7) Umetni dugme u vaš NavBar

**`src/components/NavBar.jsx`** (samo deo gde je desni kraj headera)

```jsx
import HeaderLoginButton from "./HeaderLoginButton.jsx";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="container navbar__wrap">
        <div className="navbar__row">
          {/* ... leva strana (logo, kategorije) ... */}
          <div className="spacer" />
          {/* ... pretraga, korpa ... */}
          <HeaderLoginButton />
        </div>
      </div>
    </header>
  );
}
```

> **Napomena:** Ako koristite CSS grid/flex u vašoj `navbar__row`, `spacer` može biti `<div className="flex-1"/>` ili koristite postojeći layout. Bitno je da `HeaderLoginButton` bude u desnom klasteru sa korpom.

---

## 8) Stilovi (glass, forme, dugmad)

**`src/styles/auth.css`**

```css
/* ===== Osnove / Tematske varijable ===== */
:root {
  --color-bg: var(--color-bg, #fff);
  --color-surface: var(--color-surface, #f5f5f7);
  --color-text: var(--color-text, #111);
  --color-muted: var(--color-muted, #6e6e73);
  --color-primary: var(--color-primary, #111);
  --color-accent: var(--color-accent, #d2d2d7);
}

.container { max-width: 1200px; margin-inline: auto; padding-inline: 12px; }

/* ===== Glass card ===== */
.glass {
  background: linear-gradient(
    180deg,
    color-mix(in oklab, var(--color-surface) 70%, transparent),
    color-mix(in oklab, var(--color-surface) 88%, transparent)
  );
  border: 1px solid color-mix(in oklab, var(--color-accent) 45%, transparent);
  backdrop-filter: blur(12px) saturate(120%);
  -webkit-backdrop-filter: blur(12px) saturate(120%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* ===== Modal ===== */
.auth-overlay {
  position: fixed; inset: 0; z-index: 70;
  background: rgba(0,0,0,0.35);
  display: grid; place-items: center;
  padding: 16px;
}
.auth-card {
  width: 100%; max-width: 420px; padding: 22px; position: relative;
}
.icon-btn { display: inline-grid; place-items: center; border: 0; background: transparent; cursor: pointer; }
.icon-btn.close { position: absolute; top: 10px; right: 10px; opacity: .8; }

.tabs { display: grid; grid-auto-flow: column; gap: 8px; margin-bottom: 14px; }
.tab { padding: 8px 12px; border-radius: 999px; border: 1px solid transparent; background: transparent; color: var(--color-text); }
.tab.active { border-color: color-mix(in oklab, var(--color-accent) 60%, transparent); background: var(--color-surface); }

.form { display: grid; gap: 12px; }
.field > span { display: block; font-size: 12px; color: var(--color-muted); margin-bottom: 6px; }
.input { display: grid; grid-auto-flow: column; grid-auto-columns: max-content 1fr max-content; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 12px; background: color-mix(in oklab, var(--color-surface) 96%, transparent); border: 1px solid color-mix(in oklab, var(--color-accent) 55%, transparent); }
.input .ico { opacity: .8; }
.input input { border: 0; outline: 0; background: transparent; color: var(--color-text); font-size: 14px; width: 100%; }

.hint { font-size: 13px; color: var(--color-muted); text-align: center; margin-top: 6px; }
.hint .link { border: 0; background: transparent; color: var(--color-text); text-decoration: underline; cursor: pointer; }

/* ===== Dugmad ===== */
.btn-primary, .btn-secondary, .btn-danger, .btn-ghost {
  display: inline-grid; grid-auto-flow: column; gap: 8px; align-items: center; justify-content: center;
  padding: 10px 14px; border-radius: 12px; border: 1px solid transparent; cursor: pointer; font-weight: 600;
}
.btn-primary { background: var(--color-text); color: #fff; }
.btn-primary:disabled { opacity: .7; cursor: default; }
.btn-secondary { background: var(--color-surface); color: var(--color-text); border-color: color-mix(in oklab, var(--color-accent) 55%, transparent); }
.btn-danger { background: #e5484d; color: #fff; }
.btn-ghost { background: transparent; color: var(--color-text); border-color: color-mix(in oklab, var(--color-accent) 55%, transparent); }
.btn-ghost.pill { border-radius: 999px; padding-inline: 14px; }

.w-full { width: 100%; }
.row { display: flex; gap: 10px; flex-wrap: wrap; }

/* ===== Account stranica ===== */
.account-page { padding: 24px 0; }
.account-card, .account-empty { padding: 18px; }
.userline { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.avatar { width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; background: var(--color-surface); border: 1px solid color-mix(in oklab, var(--color-accent) 55%, transparent); color: var(--color-text); }
.avatar.small { width: 32px; height: 32px; font-weight: 700; }
.header-user { display: flex; align-items: center; gap: 8px; }
.muted { color: var(--color-muted); }

/* Responsive */
@media (max-width: 480px) {
  .auth-card { max-width: 100%; padding: 18px; }
  .btn-primary, .btn-secondary, .btn-danger, .btn-ghost { padding: 10px 12px; }
}
```

---

## 9) Gde montirati modal i kontekst

U **root** aplikacije (npr. `main.jsx` ili `index.jsx`) samo renderujte `<App />` kao i do sada; bitno je da u `App.jsx` (vidi gore) obuhvatite sve u `AuthProvider` i ubacite `<AuthModal />` jednom globalno.

---

## 10) Hook za korišćenje u drugim mestima (primer)

Ako bilo gde treba "otvori login", samo:

```jsx
import { useAuth } from "../context/AuthContext.jsx";

function NekaKomponenta() {
  const { showAuth } = useAuth();
  return <button onClick={() => showAuth("login")}>Prijava</button>;
}
```

---

### Napomena za backend
Trenutno je implementirana *fake* autentikacija (localStorage). Kada povežete pravi API, zamenite `login` i `register` u `AuthContext.jsx` da šalju `fetch`/`axios` ka vašem serveru i na uspeh da setuju `setUser(...)` sa podacima korisnika i JWT/token čuvajte u `localStorage`/`cookie` po potrebi.

