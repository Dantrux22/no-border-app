// src/firebaseAuth.js
import app from './firebaseConfig';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export const auth = getAuth(app);

let _readyPromise = null;

export function ensureFirebaseAuthOnce() {
  if (_readyPromise) return _readyPromise;

  _readyPromise = new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) return resolve(user); 

      try {
        const cred = await signInAnonymously(auth);
        return resolve(cred.user);
      } catch (e) {
        return resolve(null);
      }
    });
  });

  return _readyPromise;
}

export async function ensureFirebaseAuth() {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch {
    return null;
  }
}
