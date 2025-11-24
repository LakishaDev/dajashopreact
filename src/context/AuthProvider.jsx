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
  facebookProvider,
  ensureRecaptcha,
} from '../services/firebase';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'; // <--- Dodat onSnapshot
import { Ctx } from './AuthContext';
import { functions } from '../services/firebase';

import {
  createUserWithPasskey,
  signInWithPasskey,
  linkWithPasskey,
} from '@firebase-web-authn/browser';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_RE = /^\+?[0-9]{8,15}$/;
const USER_RE = /^[a-zA-Z0-9._-]{3,24}$/;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // <--- Podaci iz baze (korpa, wishlist...)
  const [authOpen, setAuthOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [phoneConf, setPhoneConf] = useState(null);
  const [pendingEmailVerify, setPendingEmailVerify] = useState(false);

  useEffect(() => {
    // Slušamo promene autentifikacije (Login/Logout)
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const userDocRef = doc(db, 'users', u.uid);

        // 1. Provera da li dokument postoji, ako ne - kreiraj ga
        // Ovo radimo samo jednom pri loginu
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(
            userDocRef,
            {
              uid: u.uid,
              email: u.email || null,
              phoneNumber: u.phoneNumber || null,
              displayName: u.displayName || null,
              createdAt: serverTimestamp(),
              cart: [],
              wishlist: [],
            },
            { merge: true }
          );
        }

        // 2. REAL-TIME LISTENER (Ovo rešava tvoj problem sinhronizacije)
        // Sluša svaku promenu na user dokumentu (npr. kad dodaš u korpu na drugom uređaju)
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserInfo(docSnap.data());
          }
        });

        // Cleanup snapshot listenera kad se user promeni
        return () => {
          unsubscribeSnapshot();
        };
      } else {
        // Ako nema usera, nema ni userInfo podataka
        setUserInfo(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  function showAuth(nextMode = 'login') {
    setMode(nextMode);
    setAuthOpen(true);
  }

  function hideAuth() {
    setAuthOpen(false);
    setPendingEmailVerify(false);
    setPhoneConf(null);
  }

  // ... (Ostale helper funkcije ostaju iste: detectIdentity, login, register, itd.) ...
  // Samo kopiraj ostatak funkcija iz prošlog fajla (usernameToEmail, login, register, oauth, logout...)
  // Da ne pravim gužvu, pretpostavljam da su ti jasne, ključan je ovaj useEffect gore.

  async function usernameToEmail(username) {
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
    setUserInfo(null); // Čistimo state
  }

  const passkeyLogin = useCallback(async () => {
    try {
      await signInWithPasskey(auth, functions);
      return 'success';
    } catch (error) {
      console.error('Passkey login error:', error);
      throw new Error('Prijava putem Passkey-a nije uspela ili je otkazana.');
    }
  }, []);

  const passkeyRegister = useCallback(async (name) => {
    try {
      await createUserWithPasskey(auth, functions, name);
      return 'success';
    } catch (error) {
      console.error('Passkey register error:', error);
      throw new Error('Registracija Passkey-a nije uspela.');
    }
  }, []);

  const linkPasskey = useCallback(async (passkeyName) => {
    try {
      if (!auth.currentUser) {
        throw new Error('Morate biti ulogovani da biste dodali Passkey.');
      }
      await linkWithPasskey(auth, functions, passkeyName, 'first');
      return 'success';
    } catch (error) {
      console.error('Link Passkey error:', error);
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      userInfo, // <--- Ovo sada sadrži LIVE podatke korpe i wishlist-e
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
      linkPasskey,
    }),
    [
      user,
      userInfo,
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
      linkPasskey,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
