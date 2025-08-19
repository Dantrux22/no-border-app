// src/db/database.js
import * as SQLite from 'expo-sqlite';

// Abrimos la DB una sola vez (API nueva)
let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('noborder.db');
  }
  return dbPromise;
}
