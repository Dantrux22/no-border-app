// src/cloud/plugAndPlay.js
import app from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { getDB } from '../db/database';

async function ensureLocalTables(db) {
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      password TEXT,
      username TEXT UNIQUE,
      avatar TEXT,
      avatar_url TEXT,
      profile_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT,
      repost_of TEXT,
      latitude REAL,
      longitude REAL,
      location_label TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS synced_posts (
      post_id TEXT PRIMARY KEY NOT NULL
    );
  `);
}

async function upsyncOnce(rtdb) {
  const db = await getDB();
  await ensureLocalTables(db);
  const rows = await db.getAllAsync(`
    SELECT p.*
    FROM posts p
    LEFT JOIN synced_posts sp ON sp.post_id = p.id
    WHERE sp.post_id IS NULL
    ORDER BY p.created_at ASC
    LIMIT 20;
  `);
  for (const p of rows) {
    const payload = {
      id: p.id,
      user_id: p.user_id,
      body: p.body || '',
      repost_of: p.repost_of || null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      location_label: p.location_label ?? null,
      created_at: p.created_at || null,
    };
    await set(ref(rtdb, `posts/${p.id}`), payload);
    await db.runAsync(`INSERT OR IGNORE INTO synced_posts (post_id) VALUES (?)`, [p.id]);
  }
}

async function handleDownsync(snapshot) {
  const db = await getDB();
  await ensureLocalTables(db);
  const obj = snapshot.val() || {};
  const list = Array.isArray(obj) ? obj : Object.values(obj);
  for (const r of list) {
    if (!r?.id || !r?.user_id) continue;
    await db.runAsync(
      `INSERT OR IGNORE INTO users (id, email, password, username)
       VALUES (?, '', '', COALESCE(?, 'user_' || substr(?,1,6)))`,
      [r.user_id, r.user_id, r.user_id]
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO posts (id, user_id, body, repost_of, latitude, longitude, location_label, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
      [r.id, r.user_id, r.body || '', r.repost_of || null, r.latitude ?? null, r.longitude ?? null, r.location_label ?? null, r.created_at || null]
    );
  }
}

export function plugAndPlayCloud(options = {}) {
  const auth = getAuth(app);
  const rtdb = getDatabase(app);

  const offAuth = onAuthStateChanged(auth, (user) => {
    if (user && options.dispatch) {
      options.dispatch({ type: 'user/setFirebaseUser', payload: { uid: user.uid } });
    }
  });

  const postsRef = ref(rtdb, 'posts');
  const unsub = onValue(postsRef, (snap) => { handleDownsync(snap).catch(() => {}); });

  const iv = setInterval(() => { upsyncOnce(rtdb).catch(() => {}); }, 5000);

  return () => { clearInterval(iv); off(postsRef); offAuth(); };
}
