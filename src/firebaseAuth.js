// src/firebaseAuth.js
import app from './firebaseConfig';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const auth = getAuth(app);

// ─────────────────────────────────────────────────────────────────────────────
// 1) Bootstrap idempotente (para App.js): garantiza un usuario Firebase una sola vez
// ─────────────────────────────────────────────────────────────────────────────
let _readyPromise = null;

export function ensureFirebaseAuthOnce() {
  if (_readyPromise) return _readyPromise;

  _readyPromise = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();

      if (user) return resolve(user); // ya había usuario

      try {
        const cred = await signInAnonymously(auth);
        return resolve(cred.user);
      } catch (e) {
        // Si el anónimo está deshabilitado, devolvemos null silenciosamente
        const code = e?.code || '';
        if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
          return resolve(null);
        }
        return resolve(null);
      }
    });
  });

  return _readyPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2) Asegurar auth "una vez ahora" (para usar en UI: botones, handlers, etc.)
//    No es singleton; si ya hay usuario lo devuelve, si no intenta anónimo.
// ─────────────────────────────────────────────────────────────────────────────
export async function ensureFirebaseAuth() {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (e) {
    const code = e?.code || '';
    if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
      return null;
    }
    return null;
  }
}
