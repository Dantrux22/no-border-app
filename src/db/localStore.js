// src/db/localStore.js
import { getDB } from './database';

/** Guarda o mergea datos de perfil local del usuario */
export async function saveUserProfile(uid, data) {
  const db = await getDB();

  // Creamos tabla si no existe
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      username TEXT,
      avatar TEXT,
      is_logged INTEGER DEFAULT 0
    );
  `);

  // Intentar update parcial (solo avatar/username/email si vienen)
  const fields = [];
  const params = [];
  if (data?.avatar !== undefined) { fields.push('avatar = ?'); params.push(data.avatar); }
  if (data?.username !== undefined) { fields.push('username = ?'); params.push(data.username); }
  if (data?.email !== undefined) { fields.push('email = ?'); params.push(data.email); }

  if (fields.length) {
    params.push(uid);
    const res = await db.runAsync(`UPDATE users SET ${fields.join(', ')} WHERE id = ?;`, params);
    if (!res.changes) {
      // si no existe, insert básico
      await db.runAsync(
        'INSERT INTO users (id, email, username, avatar, is_logged) VALUES (?, ?, ?, ?, 1);',
        [uid, data?.email ?? null, data?.username ?? null, data?.avatar ?? null]
      );
    }
  } else {
    // Si no hay fields (extraño), asegurar existencia del registro
    await db.runAsync(
      'INSERT OR IGNORE INTO users (id, is_logged) VALUES (?, 1);',
      [uid]
    );
  }
}

/** Obtiene perfil local del usuario */
export async function getUserProfile(uid) {
  const db = await getDB();
  const row = await db.getFirstAsync(
    'SELECT id, email, username, avatar, is_logged FROM users WHERE id = ? LIMIT 1;',
    [uid]
  );
  return row ?? null;
}
