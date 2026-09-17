import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { hashPassword, signSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const phone_number = body?.phone_number?.trim();
  const password = body?.password;
  const vehicle_plate_number = body?.vehicle_plate_number?.trim() || null;
  const vehicle_model = body?.vehicle_model?.trim() || null;

  if (!name || !phone_number || !password) {
    return NextResponse.json({ error: '이름, 전화번호, 비밀번호를 모두 입력해주세요.' }, { status: 400 });
  }
  if (password.length < 4) {
    return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다.' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT user_id FROM users WHERE phone_number = ?').get(phone_number);
  if (existing) {
    return NextResponse.json({ error: '이미 가입된 전화번호입니다.' }, { status: 409 });
  }

  const user_id = randomUUID();
  db.prepare(
    'INSERT INTO users (user_id, name, phone_number, password_hash, vehicle_plate_number, vehicle_model, role_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(user_id, name, phone_number, hashPassword(password), vehicle_plate_number, vehicle_model, 'USER');

  const token = signSession({ user_id, role_type: 'USER' });
  const res = NextResponse.json({ user_id, name, role_type: 'USER' });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
