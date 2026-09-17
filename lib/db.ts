import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

let _db: DatabaseSync | null = null;

export function getDb() {
  if (!_db) {
    _db = new DatabaseSync(path.join(process.cwd(), 'data', 'app.db'));
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        vehicle_plate_number TEXT,
        vehicle_model TEXT,
        role_type TEXT NOT NULL DEFAULT 'USER',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }
  return _db;
}
