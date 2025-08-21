// src/db/migrations/addLocationColumns.js
import { getDB } from '../database';

async function columnExists(db, table, col) {
  const rows = await db.getAllAsync(`PRAGMA table_info(${table});`);
  return rows.some((r) => r.name === col);
}

export async function migratePostsAddLocationColumns() {
  const db = await getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      text TEXT,
      image_uri TEXT,
      likes INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  if (!(await columnExists(db, 'posts', 'latitude'))) {
    await db.execAsync(`ALTER TABLE posts ADD COLUMN latitude REAL;`);
  }
  if (!(await columnExists(db, 'posts', 'longitude'))) {
    await db.execAsync(`ALTER TABLE posts ADD COLUMN longitude REAL;`);
  }
  if (!(await columnExists(db, 'posts', 'location_label'))) {
    await db.execAsync(`ALTER TABLE posts ADD COLUMN location_label TEXT;`);
  }
}
