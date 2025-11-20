import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  facebookProvider, // ⬅️ umesto appleProvider
  ensureRecaptcha,
} from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ctx } from './AuthContext';
import { functions } from '../services/firebase';

import {
  createUserWithPasskey,
  signInWithPasskey,
} from '@firebase-web-authn/browser';

// Constants moved outside component to avoid recreation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_RE = /^\+?[0-9]{8,15}$/; // internacionalni
const USER_RE = /^[a-zA-Z0-9._-]{3,24}$/;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login'); // login | register
  const [phoneConf, setPhoneConf] = useState(null); // confirmationResult
  const [pendingEmailVerify, setPendingEmailVerify] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          // ensure user doc
          const ref = doc(db, 'users', u.uid);
          const s = await getDoc(ref);
          if (!s.exists()) {
            await setDoc(
              ref,
              {
                uid: u.uid,
                email: u.email || null,
                phoneNumber: u.phoneNumber || null,
                displayName: u.displayName || null,
                createdAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        }
      }),
    []
  );

  function showAuth(nextMode = 'login') {
    setMode(nextMode);
    setAuthOpen(true);
  }
  function hideAuth() {
    setAuthOpen(false);
    setPendingEmailVerify(false);
    setPhoneConf(null);
  }

  // ---------- helpers ----------
  async function usernameToEmail(username) {
    // mapiranje u Firestore: usernames/{username} -> { uid, email }
    const snap = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data.email || null;
  }

  const detectIdentity = useCallback((id) => {
    if (EMAIL_RE.test(id)) return { type: 'email', value: id };
    if (PHONE_RE.test(id))
      return { type: 'phone', value: id.startsWith('+') ? id : `+${id}` };
    if (USER_RE.test(id)) return { type: 'username', value: id.toLowerCase() };
    return { type: 'unknown', value: id };
  }, []);

  // ---------- sign-in / register ----------
  const login = useCallback(
    async ({ identity, password }) => {
      const id = detectIdentity(identity);
      if (id.type === 'email') {
        await signInWithEmailAndPassword(auth, id.value, password);
        return;
      }
      if (id.type === 'username') {
        const email = await usernameToEmail(id.value);
        if (!email) throw new Error('Korisničko ime ne postoji.');
        await signInWithEmailAndPassword(auth, email, password);
        return;
      }
      if (id.type === 'phone') {
        const verifier = ensureRecaptcha();
        const conf = await signInWithPhoneNumber(auth, id.value, verifier);
        setPhoneConf(conf);
        return 'phone-code';
      }
      throw new Error('Unesite validan email/korisničko ime/broj telefona.');
    },
    [detectIdentity]
  );

  const confirmPhoneCode = useCallback(
    async (code) => {
      if (!phoneConf) throw new Error('Nema aktivne telefonske sesije.');
      const res = await phoneConf.confirm(code);
      setPhoneConf(null);
      // user doc handled by onAuthStateChanged
      return res;
    },
    [phoneConf]
  );

  const register = useCallback(
    async ({ identity, password, name }) => {
      const id = detectIdentity(identity);
      if (id.type === 'email') {
        const cred = await createUserWithEmailAndPassword(
          auth,
          id.value,
          password
        );
        if (name) await updateProfile(cred.user, { displayName: name });
        await sendEmailVerification(cred.user);
        setPendingEmailVerify(true);
        // user doc handled in onAuthStateChanged after email verification/sign-in
        return 'email-verify';
      }
      if (id.type === 'phone') {
        const verifier = ensureRecaptcha();
        const conf = await signInWithPhoneNumber(auth, id.value, verifier);
        setPhoneConf(conf);
        return 'phone-code';
      }
      throw new Error('Za registraciju koristite email ili broj telefona.');
    },
    [detectIdentity]
  );

  const linkUsernameToEmail = useCallback(async (username, email) => {
    // pozovi nakon registracije email-om da rezervišeš username
    if (!USER_RE.test(username)) throw new Error('Nevalidno korisničko ime.');
    await setDoc(
      doc(db, 'usernames', username.toLowerCase()),
      { email },
      { merge: true }
    );
  }, []);

  async function oauth(provider) {
    let prov;
    if (provider === 'google') {
      prov = googleProvider;
    } else if (provider === 'facebook') {
      prov = facebookProvider;
    } else {
      throw new Error('Nepoznat provider.');
    }

    const res = await signInWithPopup(auth, prov);
    return res.user;
  }

  async function logout() {
    await signOut(auth);
  }

  const passkeyLogin = useCallback(async () => {
    try {
      // Automatski započinje proces prijave (FaceID/TouchID prompt)
      await signInWithPasskey(auth, functions);
      return 'success';
    } catch (error) {
      console.error('Passkey login error:', error);
      throw new Error('Prijava putem Passkey-a nije uspela ili je otkazana.');
    }
  }, []);

  const passkeyRegister = useCallback(async (name) => {
    try {
      // Prvo mora biti ulogovan ili kreirati nalog da bi vezao Passkey,
      // ali biblioteka podržava i "usernameless" flow ako je konfigurisan.
      // Za DajaShop, najbolje je da ovo ponudimo kao opciju I registracije I prijave.

      // Napomena: Ova biblioteka očekuje jedinstveno ime za passkey
      await createUserWithPasskey(auth, functions, name);
      return 'success';
    } catch (error) {
      console.error('Passkey register error:', error);
      throw new Error('Registracija Passkey-a nije uspela.');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      authOpen,
      showAuth,
      hideAuth,
      mode,
      setMode,
      login,
      register,
      confirmPhoneCode,
      oauth,
      pendingEmailVerify,
      detectIdentity,
      linkUsernameToEmail,
      logout,
      passkeyLogin,
      passkeyRegister,
    }),
    [
      user,
      authOpen,
      mode,
      pendingEmailVerify,
      confirmPhoneCode,
      detectIdentity,
      linkUsernameToEmail,
      login,
      register,
      passkeyLogin,
      passkeyRegister,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
