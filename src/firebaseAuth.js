// src/firebaseAuth.js
import app from './firebaseConfig';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const auth = getAuth(app);

// Promesa singleton para garantizar login anónimo una sola vez
let _readyPromise = null;

export function ensureFirebaseAuthOnce() {
  if (_readyPromise) return _readyPromise;
  _readyPromise = new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      try {
        if (!user) {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } else {
          resolve(user);
        }
      } catch (e) {
        reject(e);
      }
    });
  });
  return _readyPromise;
}
