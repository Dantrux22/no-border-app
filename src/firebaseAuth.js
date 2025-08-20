// src/firebaseAuth.js
import app from './firebaseConfig';
import { getAuth, signInAnonymously } from 'firebase/auth';

/**
 * Exportás el auth por si en el futuro querés leer el usuario Firebase.
 */
export const auth = getAuth(app);

/**
 * Garantiza que haya un usuario Firebase (anónimo) firmado.
 * No toca tu login SQLite: conviven.
 */
export async function ensureFirebaseAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}
