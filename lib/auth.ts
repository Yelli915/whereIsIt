import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import type { NextResponse } from 'next/server';
import { getDb } from './db';

export const SESSION_COOKIE = 'naejari_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일, JWT 만료와 동일

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// 없는 계정도 같은 시간만큼 해시 비교 → 응답 시간으로 가입 여부 추측 방지
export const DUMMY_PASSWORD_HASH = hashPassword(randomBytes(16).toString('hex'));

// 전화번호는 숫자만 저장 (010-1234-5678 / 01012345678 모두 같은 계정)
export function normalizePhone(v: unknown): string | null {
  const digits = typeof v === 'string' ? v.replace(/\D/g, '') : '';
  return /^01[016789]\d{7,8}$/.test(digits) ? digits : null;
}

// ver = users.session_version. 로그아웃 시 DB 값이 올라가 이전 토큰은 모두 무효
export interface SessionPayload {
  user_id: string;
  role_type: string;
  ver: number;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign({ user_id: payload.user_id, role_type: payload.role_type, ver: payload.ver }, jwtSecret(), {
    algorithm: 'HS256',
    expiresIn: SESSION_MAX_AGE,
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] }) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

// 로그인 무차별 대입 방지: 15분 안에 번호당 5회, IP당 20회 실패하면 차단
const FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LIMITS = { phone: 5, ip: 20 } as const;

export function isLoginLocked(key: string, max: number): boolean {
  const row = getDb()
    .prepare('SELECT COUNT(*) AS n FROM login_failures WHERE key = ? AND failed_at > ?')
    .get(key, Date.now() - FAILURE_WINDOW_MS) as { n: number };
  return row.n >= max;
}

export function recordLoginFailure(keys: string[]) {
  const db = getDb();
  const now = Date.now();
  db.prepare('DELETE FROM login_failures WHERE failed_at <= ?').run(now - FAILURE_WINDOW_MS);
  const insert = db.prepare('INSERT INTO login_failures (key, failed_at) VALUES (?, ?)');
  for (const key of keys) insert.run(key, now);
}

// 성공 시 번호 기록만 초기화. IP 기록은 유지해야 본인 계정 로그인으로 카운터를 리셋하며 남의 번호를 대입하는 걸 막음
export function clearLoginFailures(key: string) {
  getDb().prepare('DELETE FROM login_failures WHERE key = ?').run(key);
}
