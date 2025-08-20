// src/firebaseRtdb.js
import app from './firebaseConfig';
import { getDatabase, ref, runTransaction } from 'firebase/database';

const rtdb = getDatabase(app);
// Donde guardamos el contador global:
const COUNT_REF = ref(rtdb, 'app/noborder/supportersCount');

/**
 * Ajusta el contador global en RTDB con una transacción (+1, -1).
 */
export async function bumpSupporters(delta = 0) {
  if (!delta) return;
  await runTransaction(COUNT_REF, (current) => (current || 0) + delta);
}
