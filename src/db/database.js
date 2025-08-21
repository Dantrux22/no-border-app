// src/db/database.js
import * as SQLite from 'expo-sqlite';

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('noborder.db');
  }
  return dbPromise;
}
