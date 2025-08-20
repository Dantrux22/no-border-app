// src/db/posts.js
import { getDB } from './database';

function simpleId(prefix = 'p_') {
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- helpers de migración ----
async function columnExists(db, table, col) {
  const rows = await db.getAllAsync(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === col);
}

async function rebuildPostsTable(db) {
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    // Esquema definitivo
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS posts_new (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        body TEXT,
        repost_of TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    // Copio lo que exista en la vieja
    const cols = await db.getAllAsync(`PRAGMA table_info(posts);`);
    const names = cols.map(c => c.name);
    const hasId = names.includes('id');
    const hasUser = names.includes('user_id');
    const hasRepost = names.includes('repost_of');
    const hasCreated = names.includes('created_at');

    if (hasId && hasUser) {
      await db.execAsync(`
        INSERT INTO posts_new (id, user_id, body, repost_of, created_at)
        SELECT
          id,
          user_id,
          NULL AS body,
          ${hasRepost ? 'repost_of' : 'NULL'} AS repost_of,
          ${hasCreated ? 'created_at' : 'CURRENT_TIMESTAMP'} AS created_at
        FROM posts;
      `);
    }

    await db.execAsync(`DROP TABLE posts;`);
    await db.execAsync(`ALTER TABLE posts_new RENAME TO posts;`);
    await db.execAsync('COMMIT;');
  } catch (e) {
    await db.execAsync('ROLLBACK;');
    throw e;
  }
}

async function ensureTables() {
  const db = await getDB();
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  // Esquema de users compatible con auth.jsx
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      avatar TEXT,
      avatar_url TEXT,
      profile_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Crear posts si no existe (con el esquema correcto)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT,
      repost_of TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Si posts existe pero le falta 'body', reconstruyo
  const hasBody = await columnExists(db, 'posts', 'body');
  if (!hasBody) {
    await rebuildPostsTable(db);
  } else {
    // “por si acaso”: columnas accesorias
    if (!(await columnExists(db, 'posts', 'repost_of'))) {
      await db.runAsync(`ALTER TABLE posts ADD COLUMN repost_of TEXT;`);
    }
    if (!(await columnExists(db, 'posts', 'created_at'))) {
      await db.runAsync(`ALTER TABLE posts ADD COLUMN created_at TEXT;`);
      await db.runAsync(`UPDATE posts SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;`);
    }
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS post_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      type TEXT DEFAULT 'image',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS saved_posts (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);
}

function toArrayFromGroupConcat(str) {
  if (!str) return [];
  return String(str).split('||').map((s) => s.trim()).filter(Boolean);
}

function mapFeedRow(r) {
  const isRepost = !!r.repost_of;
  const useOriginal = isRepost && r.original_id;

  const likes = Number(useOriginal ? r.original_likes_count : r.likes_count) || 0;
  const reposts = Number(useOriginal ? r.original_reposts_count : r.reposts_count) || 0;
  const saves = Number(useOriginal ? r.original_saves_count : r.saves_count) || 0;
  const likedByMe = Boolean(useOriginal ? r.original_liked_by_me : r.liked_by_me);
  const savedByMe = Boolean(useOriginal ? r.original_saved_by_me : r.saved_by_me);
  const media = useOriginal ? toArrayFromGroupConcat(r.original_media_uris) : toArrayFromGroupConcat(r.media_uris);

  return {
    id: r.id,
    createdAt: r.created_at,
    isRepost,
    author: {
      id: r.author_id,
      username: r.author_username,
      avatar: r.author_avatar || '🙂',
      avatarUrl: r.author_avatar_url || null,
    },
    body: useOriginal ? (r.original_body || '') : (r.body || ''),
    media,
    stats: { likes, reposts, saves, likedByMe, savedByMe },
    original: isRepost
      ? {
          id: r.original_id,
          body: r.original_body || '',
          author: {
            id: r.original_author_id,
            username: r.original_author_username,
            avatar: r.original_author_avatar || '🙂',
            avatarUrl: r.original_author_avatar_url || null,
          },
          createdAt: r.original_created_at,
        }
      : null,
  };
}

export async function createPost({ userId, body, mediaUris = [] }) {
  await ensureTables();
  const db = await getDB();
  if (!userId || (!body && mediaUris.length === 0)) {
    const e = new Error('missing-fields'); e.code = 'missing-fields'; throw e;
  }

  const author = await db.getFirstAsync(`SELECT id FROM users WHERE id = ?`, [userId]);
  if (!author) { const e = new Error('author-not-found'); e.code = 'author-not-found'; throw e; }

  const id = simpleId();
  await db.runAsync(
    `INSERT INTO posts (id, user_id, body, repost_of, created_at)
     VALUES (?, ?, ?, NULL, CURRENT_TIMESTAMP)`,
    [id, userId, body || null]
  );

  const uris = Array.isArray(mediaUris) ? mediaUris.slice(0, 4) : [];
  for (const uri of uris) {
    await db.runAsync(
      `INSERT INTO post_media (post_id, uri, type, created_at)
       VALUES (?, ?, 'image', CURRENT_TIMESTAMP)`,
      [id, uri]
    );
  }

  return id;
}

export async function toggleRepost({ userId, targetPostId }) {
  await ensureTables();
  const db = await getDB();

  const t = await db.getFirstAsync(`SELECT id FROM posts WHERE id = ?`, [targetPostId]);
  if (!t) { const e = new Error('original-not-found'); e.code = 'original-not-found'; throw e; }

  const mine = await db.getFirstAsync(
    `SELECT id FROM posts WHERE user_id = ? AND repost_of = ?`,
    [userId, targetPostId]
  );

  let reposted;
  if (mine) {
    await db.runAsync(`DELETE FROM posts WHERE id = ?`, [mine.id]);
    reposted = false;
  } else {
    const id = simpleId('rp_');
    await db.runAsync(
      `INSERT INTO posts (id, user_id, body, repost_of, created_at)
       VALUES (?, ?, NULL, ?, CURRENT_TIMESTAMP)`,
      [id, userId, targetPostId]
    );
    reposted = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM posts WHERE repost_of = ?`, [targetPostId]);
  return { reposted, reposts: Number(countRow?.n || 0) };
}

export async function toggleLike({ userId, postId }) {
  await ensureTables();
  const db = await getDB();

  const like = await db.getFirstAsync(`SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?`, [userId, postId]);

  let liked;
  if (like) {
    await db.runAsync(`DELETE FROM likes WHERE user_id = ? AND post_id = ?`, [userId, postId]);
    liked = false;
  } else {
    await db.runAsync(
      `INSERT INTO likes (user_id, post_id, created_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [userId, postId]
    );
    liked = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM likes WHERE post_id = ?`, [postId]);
  return { liked, likes: Number(countRow?.n || 0) };
}

export async function toggleSave({ userId, postId }) {
  await ensureTables();
  const db = await getDB();

  const saved = await db.getFirstAsync(`SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?`, [userId, postId]);

  let isSaved;
  if (saved) {
    await db.runAsync(`DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?`, [userId, postId]);
    isSaved = false;
  } else {
    await db.runAsync(
      `INSERT INTO saved_posts (user_id, post_id, saved_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [userId, postId]
    );
    isSaved = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM saved_posts WHERE post_id = ?`, [postId]);
  return { saved: isSaved, saves: Number(countRow?.n || 0) };
}

export async function listFeedPosts({ limit = 30, offset = 0, currentUserId = '' } = {}) {
  await ensureTables();
  const db = await getDB();

  const rows = await db.getAllAsync(
    `
    SELECT
      p.id, p.body, p.repost_of, p.created_at,
      u.id AS author_id, u.username AS author_username, u.avatar AS author_avatar, u.avatar_url AS author_avatar_url,

      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM posts rp WHERE rp.repost_of = p.id) AS reposts_count,
      (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = p.id) AS saves_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = p.id) AS media_uris,

      op.id AS original_id, op.body AS original_body, op.created_at AS original_created_at,
      ou.id AS original_author_id, ou.username AS original_author_username, ou.avatar AS original_author_avatar, ou.avatar_url AS original_author_avatar_url,

      (SELECT COUNT(*) FROM likes l2 WHERE l2.post_id = op.id) AS original_likes_count,
      (SELECT COUNT(*) FROM posts r2 WHERE r2.repost_of = op.id) AS original_reposts_count,
      (SELECT COUNT(*) FROM saved_posts s2 WHERE s2.post_id = op.id) AS original_saves_count,
      EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = op.id AND l2.user_id = ?) AS original_liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s2 WHERE s2.post_id = op.id AND s2.user_id = ?) AS original_saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = op.id) AS original_media_uris

    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN posts op ON op.id = p.repost_of
    LEFT JOIN users ou ON ou.id = op.user_id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [currentUserId, currentUserId, currentUserId, currentUserId, limit, offset]
  );

  return rows.map(mapFeedRow);
}

export async function listUserPosts({ userId, limit = 30, offset = 0, currentUserId = '' }) {
  await ensureTables();
  const db = await getDB();
  const rows = await db.getAllAsync(
    `
    SELECT
      p.id, p.body, p.repost_of, p.created_at,
      u.id AS author_id, u.username AS author_username, u.avatar AS author_avatar, u.avatar_url AS author_avatar_url,

      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM posts rp WHERE rp.repost_of = p.id) AS reposts_count,
      (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = p.id) AS saves_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = p.id) AS media_uris

    FROM posts p
    JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ? AND p.repost_of IS NULL
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [currentUserId, currentUserId, userId, limit, offset]
  );
  return rows.map((r) => mapFeedRow({ ...r, original_id: null }));
}

export async function listUserReposts({ userId, limit = 30, offset = 0, currentUserId = '' }) {
  await ensureTables();
  const db = await getDB();
  const rows = await db.getAllAsync(
    `
    SELECT
      p.id, p.body, p.repost_of, p.created_at,
      u.id AS author_id, u.username AS author_username, u.avatar AS author_avatar, u.avatar_url AS author_avatar_url,

      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM posts rp WHERE rp.repost_of = p.id) AS reposts_count,
      (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = p.id) AS saves_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = p.id) AS media_uris,

      op.id AS original_id, op.body AS original_body, op.created_at AS original_created_at,
      ou.id AS original_author_id, ou.username AS original_author_username, ou.avatar AS original_author_avatar, ou.avatar_url AS original_author_avatar_url,

      (SELECT COUNT(*) FROM likes l2 WHERE l2.post_id = op.id) AS original_likes_count,
      (SELECT COUNT(*) FROM posts r2 WHERE r2.repost_of = op.id) AS original_reposts_count,
      (SELECT COUNT(*) FROM saved_posts s2 WHERE s2.post_id = op.id) AS original_saves_count,
      EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = op.id AND l2.user_id = ?) AS original_liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s2 WHERE s2.post_id = op.id AND s2.user_id = ?) AS original_saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = op.id) AS original_media_uris

    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN posts op ON op.id = p.repost_of
    LEFT JOIN users ou ON ou.id = op.user_id
    WHERE p.user_id = ? AND p.repost_of IS NOT NULL
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [currentUserId, currentUserId, currentUserId, currentUserId, userId, limit, offset]
  );
  return rows.map(mapFeedRow);
}

export async function listSavedPosts({ userId, limit = 50, offset = 0, currentUserId = '' }) {
  await ensureTables();
  const db = await getDB();
  const rows = await db.getAllAsync(
    `
    SELECT
      p.id, p.body, p.repost_of, p.created_at,
      u.id AS author_id, u.username AS author_username, u.avatar AS author_avatar, u.avatar_url AS author_avatar_url,

      (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM posts rp WHERE rp.repost_of = p.id) AS reposts_count,
      (SELECT COUNT(*) FROM saved_posts s WHERE s.post_id = p.id) AS saves_count,
      EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) AS liked_by_me,
      EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id = p.id AND s.user_id = ?) AS saved_by_me,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = p.id) AS media_uris,

      op.id AS original_id, op.body AS original_body, op.created_at AS original_created_at,
      ou.id AS original_author_id, ou.username AS original_author_username, ou.avatar AS original_author_avatar, ou.avatar_url AS original_author_avatar_url,
      (SELECT GROUP_CONCAT(uri, '||') FROM post_media WHERE post_id = op.id) AS original_media_uris

    FROM saved_posts sp
    JOIN posts p ON p.id = sp.post_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN posts op ON op.id = p.repost_of
    LEFT JOIN users ou ON ou.id = op.user_id
    WHERE sp.user_id = ?
    ORDER BY sp.saved_at DESC
    LIMIT ? OFFSET ?
    `,
    [currentUserId, currentUserId, userId, limit, offset]
  );
  return rows.map(mapFeedRow);
}
