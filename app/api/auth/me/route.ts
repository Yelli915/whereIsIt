import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifySession, SESSION_COOKIE } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json(null);

  const db = getDb();
  const user = db
    .prepare('SELECT user_id, name, role_type FROM users WHERE user_id = ?')
    .get(session.user_id) as { user_id: string; name: string; role_type: string } | undefined;

  return NextResponse.json(user ?? null);
}
