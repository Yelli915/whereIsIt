import { NextRequest, NextResponse } from 'next/server';
import { getDb } from './db';
import { verifySession, SESSION_COOKIE, type SessionPayload } from './auth';

// api.yaml 공통 응답 규격: { success: true, data } / { success: false, message }
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const ok = (data: unknown = null) => NextResponse.json({ success: true, data });

export function route<C>(fn: (req: NextRequest, ctx: C) => Response | Promise<Response>) {
  return async (req: NextRequest, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      // 그 외 에러는 Next로 넘김 (빌드 시 dynamic 판별용 내부 에러도 여기로 옴)
      if (!(e instanceof HttpError)) throw e;
      return NextResponse.json({ success: false, message: e.message }, { status: e.status });
    }
  };
}

// Bearer 헤더(api.yaml) 우선, 없으면 로그인 시 발급한 세션 쿠키 사용.
// 권한은 토큰이 아닌 DB 기준 → 탈퇴/권한 변경/로그아웃이 즉시 반영됨
export function requireUser(req: NextRequest): SessionPayload {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySession(token) : null;
  const user =
    session &&
    getDb()
      .prepare('SELECT user_id, role_type, session_version AS ver FROM users WHERE user_id = ? AND session_version = ?')
      .get(session.user_id, session.ver ?? -1);
  if (!user) throw new HttpError(401, '로그인이 필요합니다.');
  return user as unknown as SessionPayload;
}

export function requireAdmin(req: NextRequest): SessionPayload {
  const session = requireUser(req);
  if (session.role_type !== 'ADMIN') throw new HttpError(403, '접근 권한이 없습니다.');
  return session;
}

export const body = (req: NextRequest): Promise<Record<string, any>> =>
  req.json().then((b) => (b && typeof b === 'object' ? b : {}), () => ({}));

export function requireString(v: unknown, field: string): string {
  if (typeof v !== 'string' || !v.trim()) throw new HttpError(400, `${field}을(를) 입력해주세요.`);
  return v.trim();
}

export function requireInt(v: unknown, field: string): number {
  if (!Number.isInteger(v) || (v as number) < 0) throw new HttpError(400, `${field}은(는) 0 이상의 정수여야 합니다.`);
  return v as number;
}

export function findOne<T = Record<string, any>>(sql: string, id: string): T {
  const row = getDb().prepare(sql).get(id);
  if (!row) throw new HttpError(404, '요청한 리소스를 찾을 수 없습니다.');
  return row as T;
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

// SQLite는 BOOLEAN이 없어 0/1로 저장됨 → 응답 시 boolean으로 변환
const FLAGS = ['is_checked_in', 'is_checked_out', 'is_refunded', 'is_payout_done'] as const;
export function toReservation<T extends Record<string, any>>(row: T): T {
  const r: Record<string, any> = { ...row };
  for (const f of FLAGS) if (f in r) r[f] = Boolean(r[f]);
  return r as T;
}

// issue_note 누적 형식: "[GUEST / 2026-10-10 17:30] 내용"
export function noteLine(author: 'GUEST' | 'ADMIN', text: string): string {
  const ts = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);
  return `[${author} / ${ts}] ${text}`;
}

// 게스트 본인 예약만 조작 가능 (404 → 403 순서)
export function ownReservation(req: NextRequest, reservationId: string) {
  const session = requireUser(req);
  const r = findOne('SELECT * FROM reservations WHERE reservation_id = ?', reservationId);
  if (r.guest_id !== session.user_id) throw new HttpError(403, '접근 권한이 없습니다.');
  return r;
}
