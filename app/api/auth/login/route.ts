import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, signSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone_number = body?.phone_number?.trim();
  const password = body?.password;

  if (!phone_number || !password) {
    return NextResponse.json({ error: '전화번호와 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const db = getDb();
  const user = db
    .prepare('SELECT user_id, name, password_hash, role_type FROM users WHERE phone_number = ?')
    .get(phone_number) as { user_id: string; name: string; password_hash: string; role_type: string } | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: '전화번호 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = signSession({ user_id: user.user_id, role_type: user.role_type });
  const res = NextResponse.json({ user_id: user.user_id, name: user.name, role_type: user.role_type });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
