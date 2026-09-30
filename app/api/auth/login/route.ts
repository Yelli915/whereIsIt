import { getDb } from '@/lib/db';
import { route, ok, body, HttpError } from '@/lib/api';
import {
  verifyPassword,
  signSession,
  setSessionCookie,
  normalizePhone,
  DUMMY_PASSWORD_HASH,
  LOGIN_LIMITS,
  isLoginLocked,
  recordLoginFailure,
  clearLoginFailures,
} from '@/lib/auth';

// 웹은 httpOnly 쿠키, 그 외 클라이언트는 access_token을 Bearer로 사용 (api.yaml)
export const POST = route(async (req) => {
  const b = await body(req);
  const phone_number = normalizePhone(b.phone_number);
  const password = typeof b.password === 'string' ? b.password : '';
  if (!phone_number || !password) throw new HttpError(400, '전화번호와 비밀번호를 입력해주세요.');

  // 프록시가 주는 IP가 없으면 IP 제한은 생략 (모든 사용자가 한 버킷에 묶여 서로 차단되는 것 방지)
  const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim();
  const phoneKey = `phone:${phone_number}`;
  const ipKey = ip ? `ip:${ip}` : null;
  if (isLoginLocked(phoneKey, LOGIN_LIMITS.phone) || (ipKey && isLoginLocked(ipKey, LOGIN_LIMITS.ip))) {
    throw new HttpError(429, '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.');
  }

  const user = getDb()
    .prepare('SELECT user_id, name, password_hash, role_type, session_version FROM users WHERE phone_number = ?')
    .get(phone_number) as
    | { user_id: string; name: string; password_hash: string; role_type: string; session_version: number }
    | undefined;
  const valid = verifyPassword(password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) {
    recordLoginFailure(ipKey ? [phoneKey, ipKey] : [phoneKey]);
    throw new HttpError(400, '전화번호 또는 비밀번호가 올바르지 않습니다.');
  }
  clearLoginFailures(phoneKey);

  const access_token = signSession({ user_id: user.user_id, role_type: user.role_type, ver: user.session_version });
  const res = ok({ access_token, user: { user_id: user.user_id, name: user.name, role_type: user.role_type } });
  setSessionCookie(res, access_token);
  return res;
});
