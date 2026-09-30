import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { mkdirSync } from 'node:fs';

let _db: DatabaseSync | null = null;

// DB.dbml의 Raw SQL DDL을 SQLite 문법으로 옮긴 것. 스키마 변경 시 DB.dbml과 함께 수정할 것.
export function getDb() {
  if (!_db) {
    const dir = path.join(process.cwd(), 'data'); // DB 파일은 git 제외라 새로 클론하면 폴더가 없음
    mkdirSync(dir, { recursive: true });
    _db = new DatabaseSync(path.join(dir, 'app.db'));
    _db.exec(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        vehicle_plate_number TEXT,
        vehicle_model TEXT,
        role_type TEXT NOT NULL DEFAULT 'USER',
        session_version INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        venue_name TEXT NOT NULL,
        address TEXT NOT NULL,
        start_datetime TEXT NOT NULL,
        end_datetime TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'UPCOMING',
        created_by TEXT NOT NULL REFERENCES users(user_id),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS event_parking_spaces (
        space_id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(event_id),
        host_id TEXT NOT NULL REFERENCES users(user_id),
        address TEXT NOT NULL,
        photo_url TEXT NOT NULL,
        walking_minutes INTEGER NOT NULL,
        entry_notes TEXT,
        price INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS reservations (
        reservation_id TEXT PRIMARY KEY,
        space_id TEXT NOT NULL REFERENCES event_parking_spaces(space_id),
        guest_id TEXT NOT NULL REFERENCES users(user_id),
        vehicle_plate_number TEXT NOT NULL,
        payment_amount INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'CONFIRMED',
        is_checked_in INTEGER NOT NULL DEFAULT 0,
        is_checked_out INTEGER NOT NULL DEFAULT 0,
        is_refunded INTEGER NOT NULL DEFAULT 0,
        is_payout_done INTEGER NOT NULL DEFAULT 0,
        issue_note TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uq_active_space_reservation
        ON reservations (space_id) WHERE status != 'CANCELLED';
      CREATE INDEX IF NOT EXISTS idx_spaces_event_status ON event_parking_spaces (event_id, status);
      CREATE INDEX IF NOT EXISTS idx_reservations_guest ON reservations (guest_id);

      CREATE TABLE IF NOT EXISTS login_failures (
        key TEXT NOT NULL,
        failed_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_login_failures_key ON login_failures (key, failed_at);
    `);
    // session_version 도입 전 만들어진 DB 보정
    const userColumns = _db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
    if (!userColumns.some((c) => c.name === 'session_version')) {
      _db.exec('ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0');
    }
  }
  return _db;
}
