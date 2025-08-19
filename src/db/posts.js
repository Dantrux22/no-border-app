// src/db/posts.js
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'no-border.db';
let dbPromise = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
}

async function ensureTables() {
  const db = await getDb();
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      avatar TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT,
      repost_of TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS post_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      type TEXT DEFAULT 'image',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS saved_posts (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      saved_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);
}

function simpleId(prefix = 'p_') {
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function createPost({ userId, body, mediaUris = [] }) {
  await ensureTables();
  const db = await getDb();
  if (!userId || (!body && mediaUris.length === 0)) {
    const e = new Error('missing-fields'); e.code = 'missing-fields'; throw e;
  }

  const author = await db.getFirstAsync(`SELECT id FROM users WHERE id = ?`, [userId]);
  if (!author) { const e = new Error('author-not-found'); e.code = 'author-not-found'; throw e; }

  const id = simpleId();
  await db.runAsync(`INSERT INTO posts (id, user_id, body, repost_of) VALUES (?, ?, ?, NULL)`, [id, userId, body || null]);

  const uris = Array.isArray(mediaUris) ? mediaUris.slice(0, 4) : [];
  for (const uri of uris) {
    await db.runAsync(`INSERT INTO post_media (post_id, uri, type) VALUES (?, ?, 'image')`, [id, uri]);
  }

  return id;
}

export async function toggleRepost({ userId, targetPostId }) {
  await ensureTables();
  const db = await getDb();

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
      `INSERT INTO posts (id, user_id, body, repost_of) VALUES (?, ?, NULL, ?)`,
      [id, userId, targetPostId]
    );
    reposted = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM posts WHERE repost_of = ?`, [targetPostId]);
  return { reposted, reposts: Number(countRow?.n || 0) };
}

export async function toggleLike({ userId, postId }) {
  await ensureTables();
  const db = await getDb();

  const like = await db.getFirstAsync(`SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?`, [userId, postId]);

  let liked;
  if (like) {
    await db.runAsync(`DELETE FROM likes WHERE user_id = ? AND post_id = ?`, [userId, postId]);
    liked = false;
  } else {
    await db.runAsync(`INSERT INTO likes (user_id, post_id) VALUES (?, ?)`, [userId, postId]);
    liked = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM likes WHERE post_id = ?`, [postId]);
  return { liked, likes: Number(countRow?.n || 0) };
}

export async function toggleSave({ userId, postId }) {
  await ensureTables();
  const db = await getDb();

  const saved = await db.getFirstAsync(`SELECT 1 FROM saved_posts WHERE user_id = ? AND post_id = ?`, [userId, postId]);

  let isSaved;
  if (saved) {
    await db.runAsync(`DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?`, [userId, postId]);
    isSaved = false;
  } else {
    await db.runAsync(`INSERT INTO saved_posts (user_id, post_id) VALUES (?, ?)`, [userId, postId]);
    isSaved = true;
  }

  const countRow = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM saved_posts WHERE post_id = ?`, [postId]);
  return { saved: isSaved, saves: Number(countRow?.n || 0) };
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

export async function listFeedPosts({ limit = 30, offset = 0, currentUserId = '' } = {}) {
  await ensureTables();
  const db = await getDb();

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
  const db = await getDb();
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
  return rows.map((r) => mapFeedRow({ ...r, original_id: null })); // fuerza no-repost
}

export async function listUserReposts({ userId, limit = 30, offset = 0, currentUserId = '' }) {
  await ensureTables();
  const db = await getDb();
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
  const db = await getDb();
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
