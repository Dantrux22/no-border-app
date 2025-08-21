// src/db/auth.jsx
import { getDB } from './database';

function id(prefix = 'u_') {
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function columnExists(db, table, col) {
  const rows = await db.getAllAsync(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === col);
}

async function ensureUsersBaseTable(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL
    );
  `);
}

async function migrateUsersAddMissingColumns(db) {
  if (!(await columnExists(db, 'users', 'avatar'))) {
    await db.runAsync(`ALTER TABLE users ADD COLUMN avatar TEXT;`);
  }
  if (!(await columnExists(db, 'users', 'avatar_url'))) {
    await db.runAsync(`ALTER TABLE users ADD COLUMN avatar_url TEXT;`);
  }
  if (!(await columnExists(db, 'users', 'profile_completed'))) {
    await db.runAsync(`ALTER TABLE users ADD COLUMN profile_completed INTEGER;`);
    await db.runAsync(`UPDATE users SET profile_completed = 0 WHERE profile_completed IS NULL;`);
  }
  if (!(await columnExists(db, 'users', 'created_at'))) {
    await db.runAsync(`ALTER TABLE users ADD COLUMN created_at TEXT;`);
    await db.runAsync(`UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;`);
  }
}

async function ensureSessionTable(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS session (
      k TEXT PRIMARY KEY NOT NULL,
      user_id TEXT
    );
  `);
}

async function ensureTables() {
  const db = await getDB();
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  await ensureUsersBaseTable(db);
  await migrateUsersAddMissingColumns(db);
  await ensureSessionTable(db);
}

async function setSessionUser(userId) {
  const db = await getDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO session (k, user_id) VALUES ('current', ?)`,
    [userId]
  );
}

export async function getCurrentUserId() {
  await ensureTables();
  const db = await getDB();
  const row = await db.getFirstAsync(`SELECT user_id FROM session WHERE k='current'`);
  return row?.user_id || null;
}

export async function getUserById(uid) {
  await ensureTables();
  const db = await getDB();
  return await db.getFirstAsync(`SELECT * FROM users WHERE id=?`, [uid]);
}

export async function updateUserAvatar(uid, emoji = '🙂') {
  await ensureTables();
  const db = await getDB();
  await db.runAsync(`UPDATE users SET avatar=? WHERE id=?`, [emoji, uid]);
  return getUserById(uid);
}

export async function updateUserAvatarUrl(uid, url) {
  await ensureTables();
  const db = await getDB();
  await db.runAsync(`UPDATE users SET avatar_url=? WHERE id=?`, [url || null, uid]);
  return getUserById(uid);
}

export async function markProfileCompleted(uid, value = 1) {
  await ensureTables();
  const db = await getDB();
  await db.runAsync(`UPDATE users SET profile_completed=? WHERE id=?`, [value ? 1 : 0, uid]);
}

export async function isProfileCompleted(uid) {
  await ensureTables();
  const db = await getDB();
  const row = await db.getFirstAsync(`SELECT profile_completed FROM users WHERE id=?`, [uid]);
  return !!(row && Number(row.profile_completed) === 1);
}

export async function registerUser({ email, password, username }) {
  await ensureTables();
  const db = await getDB();

  const e = (email || '').trim().toLowerCase();
  const u = (username || '').trim().toLowerCase();
  const p = String(password || '');

  if (!e || !u || !p) { const err = new Error('missing-fields'); err.code = 'missing-fields'; throw err; }

  const emailRow = await db.getFirstAsync(`SELECT id FROM users WHERE email=?`, [e]);
  if (emailRow) { const err = new Error('email-already-in-use'); err.code = 'email-already-in-use'; throw err; }

  const userRow = await db.getFirstAsync(`SELECT id FROM users WHERE username=?`, [u]);
  if (userRow) { const err = new Error('username-already-in-use'); err.code = 'username-already-in-use'; throw err; }

  const uid = id();
  await db.runAsync(
    `INSERT INTO users (id, email, password, username, avatar, profile_completed, created_at)
     VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
    [uid, e, p, u, '🙂']
  );

  await setSessionUser(uid);

  return {
    id: uid,
    email: e,
    username: u,
    avatar: '🙂',
    avatarUrl: null,
    profileCompleted: 0,
    created_at: new Date().toISOString(),
  };
}

export async function loginUser({ email, password }) {
  await ensureTables();
  const db = await getDB();

  const e = (email || '').trim().toLowerCase();
  const p = String(password || '');

  if (!e || !p) { const err = new Error('missing-fields'); err.code = 'missing-fields'; throw err; }

  const row = await db.getFirstAsync(`SELECT * FROM users WHERE email=?`, [e]);
  if (!row) { const err = new Error('user-not-found'); err.code = 'user-not-found'; throw err; }
  if (row.password !== p) { const err = new Error('wrong-password'); err.code = 'wrong-password'; throw err; }

  await setSessionUser(row.id);

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatar: row.avatar || '🙂',
    avatarUrl: row.avatar_url || null,
    profileCompleted: Number(row.profile_completed || 0),
    created_at: row.created_at,
  };
}

export async function logoutUser() {
  await ensureTables();
  const db = await getDB();
  await db.runAsync(`DELETE FROM session WHERE k='current'`);
}
