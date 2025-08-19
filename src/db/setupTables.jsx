import { db } from './db';

export const initTables = () => {
  db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT NOT NULL,
        avatar TEXT
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        username TEXT,
        avatar TEXT,
        content TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        originalPostId INTEGER,
        createdAt TEXT
      );
    `);
  });
};
