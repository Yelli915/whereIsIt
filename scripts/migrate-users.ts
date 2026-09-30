import { getDb } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { seedDB, SEED_IDS } from '../lib/seed';

// lib/seed.ts 시드 데이터를 그대로 SQLite에 적재 (이미 있는 행은 건너뜀)
const db = getDb();
const { users, events, spaces, reservations } = seedDB();

const passwords: Record<string, string> = {
  [SEED_IDS.GUEST]: 'guest1234',
  [SEED_IDS.GUEST2]: 'guest1234',
  [SEED_IDS.GUEST3]: 'guest1234',
  [SEED_IDS.HOST]: 'host1234',
  [SEED_IDS.ADMIN]: 'admin1234',
};

function insertAll(table: string, rows: Record<string, any>[]) {
  // created_at은 DB 기본값(datetime('now'))을 써야 API 정렬과 형식이 맞음
  for (const { created_at, ...row } of rows) {
    const cols = Object.keys(row);
    const values = Object.values(row).map((v) => (typeof v === 'boolean' ? Number(v) : v ?? null));
    db.prepare(`INSERT OR IGNORE INTO ${table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...values);
  }
}

db.exec('BEGIN');
insertAll('users', users.map((u) => ({ ...u, password_hash: hashPassword(passwords[u.user_id]) })));
insertAll('events', events);
insertAll('event_parking_spaces', spaces);
insertAll('reservations', reservations);
db.exec('COMMIT');

console.log('seed complete. accounts:');
users.forEach((u) => console.log(`  ${u.phone_number} / ${passwords[u.user_id]} (${u.name}, ${u.role_type})`));
