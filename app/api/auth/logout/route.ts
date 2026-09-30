import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// session_version을 올려 이 사용자에게 발급된 모든 토큰(다른 기기 포함)을 무효화.
// 이미 만료/무효인 토큰이어도 쿠키 삭제는 항상 성공
export async function POST(req: NextRequest) {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  if (session) {
    getDb()
      .prepare('UPDATE users SET session_version = session_version + 1 WHERE user_id = ? AND session_version = ?')
      .run(session.user_id, session.ver ?? -1);
  }
  const res = NextResponse.json({ success: true, data: null });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
