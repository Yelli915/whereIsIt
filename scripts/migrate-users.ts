import { getDb } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { SEED_IDS } from '../lib/mock-store';

const db = getDb();

const seedUsers = [
  { user_id: SEED_IDS.GUEST, name: '김게스트', phone_number: '010-1111-1111', password: 'guest1234', vehicle_plate_number: '12가3456', vehicle_model: '아반떼', role_type: 'USER' },
  { user_id: SEED_IDS.HOST, name: '박호스트', phone_number: '010-2222-2222', password: 'host1234', role_type: 'USER' },
  { user_id: SEED_IDS.ADMIN, name: '최운영', phone_number: '010-9999-9999', password: 'admin1234', role_type: 'ADMIN' },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO users (user_id, name, phone_number, password_hash, vehicle_plate_number, vehicle_model, role_type)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const u of seedUsers) {
  insert.run(u.user_id, u.name, u.phone_number, hashPassword(u.password), u.vehicle_plate_number ?? null, u.vehicle_model ?? null, u.role_type);
}

console.log('users table ready, seed accounts:');
seedUsers.forEach((u) => console.log(`  ${u.phone_number} / ${u.password} (${u.role_type === 'ADMIN' ? '관리자' : u.user_id})`));
