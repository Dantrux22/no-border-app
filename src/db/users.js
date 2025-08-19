// src/db/users.js
import { getDB } from './database';
import * as Crypto from 'expo-crypto';

// Hash local simple: SHA256( lower(email) + ':' + password )
async function makeHash(email, password) {
  const key = `${String(email).toLowerCase()}:${password ?? ''}`;
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, key);
}

/** --- Schema & migración --- */
export async function initDB() {
  const db = await getDB();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      username TEXT,
      avatar TEXT,
      is_logged INTEGER DEFAULT 0,
      password_hash TEXT
    );
  `);
}

/** Obtiene usuario con sesión activa o null */
export async function getCurrentUserId() {
  const db = await getDB();
  const row = await db.getFirstAsync('SELECT id FROM users WHERE is_logged = 1 LIMIT 1;');
  return row ? row.id : null;
}

export async function getLoggedUser() {
  const db = await getDB();
  const row = await db.getFirstAsync(
    'SELECT id, email, username, avatar FROM users WHERE is_logged = 1 LIMIT 1;'
  );
  return row ?? null;
}

export async function getUserByEmail(email) {
  const db = await getDB();
  const row = await db.getFirstAsync(
    'SELECT id, email, username, avatar, is_logged, password_hash FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1;',
    [email]
  );
  return row ?? null;
}

export async function logoutAll() {
  const db = await getDB();
  await db.runAsync('UPDATE users SET is_logged = 0;');
}

/** Actualiza avatar; si no existe el usuario, lo crea y marca sesión */
export async function updateUserAvatar(uid, avatar) {
  const db = await getDB();

  const result = await db.runAsync('UPDATE users SET avatar = ? WHERE id = ?;', [avatar, uid]);
  if (!result.changes) {
    await db.runAsync(
      'INSERT INTO users (id, avatar, is_logged) VALUES (?, ?, 1);',
      [uid, avatar]
    );
  }
}

/** --- Registro con password (username OBLIGATORIO) --- */
export async function registerWithPassword(email, password, username) {
  await initDB();
  const db = await getDB();

  if (!email || !password) throw new Error('EMAIL_OR_PASSWORD_MISSING');
  if (!username || !username.trim()) throw new Error('USERNAME_REQUIRED');

  const uid = String(email).toLowerCase();
  const hash = await makeHash(email, password);

  // Upsert con username obligatorio
  const upd = await db.runAsync(
    'UPDATE users SET email = ?, username = ?, password_hash = ? WHERE id = ?;',
    [email, username.trim(), hash, uid]
  );

  if (!upd.changes) {
    await db.runAsync(
      'INSERT INTO users (id, email, username, password_hash, is_logged) VALUES (?, ?, ?, ?, 0);',
      [uid, email, username.trim(), hash]
    );
  }

  // Loguear esta sesión
  await db.runAsync('UPDATE users SET is_logged = 0;');
  await db.runAsync('UPDATE users SET is_logged = 1 WHERE id = ?;', [uid]);

  const user = await getUserByEmail(email);
  const firstTime = !user?.avatar;
  return { user, firstTime };
}

/** --- Login con password --- */
export async function loginWithPassword(email, password) {
  await initDB();
  const db = await getDB();

  const user = await getUserByEmail(email);
  if (!user?.password_hash) throw new Error('USER_NOT_FOUND');

  const hash = await makeHash(email, password);
  if (hash !== user.password_hash) throw new Error('INVALID_CREDENTIALS');

  await db.runAsync('UPDATE users SET is_logged = 0;');
  await db.runAsync('UPDATE users SET is_logged = 1 WHERE id = ?;', [user.id]);

  const refreshed = await getUserByEmail(email);
  const firstTime = !refreshed?.avatar;
  return { user: refreshed, firstTime };
}
