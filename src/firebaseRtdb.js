// src/firebaseRtdb.js
import app from './firebaseConfig';
import { getDatabase, ref, runTransaction } from 'firebase/database';

const rtdb = getDatabase(app);
const COUNT_REF = ref(rtdb, 'app/noborder/supportersCount');

export async function bumpSupporters(delta = 0) {
  if (!delta) return;
  await runTransaction(COUNT_REF, (current) => {
    const base = typeof current === 'number' ? current : 0;
    const next = base + delta;
    return next < 0 ? 0 : next;
  });
}
