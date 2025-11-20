// npm i firebase
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  RecaptchaVerifier,
} from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAnalytics } from 'firebase/analytics';

// ---- Config iz .env (Vite) ----
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional (Analytics)
};

// ---- Init Firebase ----
export const app = initializeApp(cfg);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west1');

// ---- App Check (reCAPTCHA v3) ----
// Debug token samo u DEV okruženju:
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
}

const siteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY;
if (siteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
} else {
  console.warn('[AppCheck] VITE_FIREBASE_RECAPTCHA_SITE_KEY nije setovan.');
}

// ---- Analytics (ako postoji measurementId i radi u browseru) ----
export let analytics = null;
if (typeof window !== 'undefined' && cfg.measurementId) {
  try {
    analytics = getAnalytics(app);
  } catch {
    // npr. ako si u dev bez HTTPS, analytics može da padne – ignoriši
  }
}

// ---- OAuth provideri ----
export const googleProvider = new GoogleAuthProvider();

// Facebook
export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: 'popup',
});

// ---- Phone Auth: invisible reCAPTCHA v2 host ----
// U DOM-u mora postojati <div id="recaptcha-container"></div> kada pozoveš ensureRecaptcha().
export function ensureRecaptcha() {
  if (!window.__recaptchaVerifier) {
    window.__recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      { size: 'invisible' }
    );
  }
  return window.__recaptchaVerifier;
}

// ---- Admin emailovi iz .env ----
const rawAdmins = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',');
export const ADMIN_EMAILS = rawAdmins
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
export const isAdminEmail = (email) =>
  !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());
