import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { route, ok, body, requireString, HttpError } from '@/lib/api';
import { hashPassword, signSession, setSessionCookie, normalizePhone } from '@/lib/auth';

const MIN_PASSWORD_LENGTH = 8;

// role_type은 항상 USER. ADMIN은 시드 스크립트로만 생성 (api.yaml)
export const POST = route(async (req) => {
  const b = await body(req);
  const name = requireString(b.name, '이름');
  const phone_number = normalizePhone(b.phone_number);
  if (!phone_number) throw new HttpError(400, '올바른 휴대폰 번호를 입력해주세요.');
  if (typeof b.password !== 'string' || b.password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.`);
  }
  const optional = (v: unknown) => (typeof v === 'string' && v.trim()) || null;

  const user_id = randomUUID();
  try {
    getDb()
      .prepare(
        `INSERT INTO users (user_id, name, phone_number, password_hash, vehicle_plate_number, vehicle_model, role_type)
         VALUES (?, ?, ?, ?, ?, ?, 'USER')`
      )
      .run(user_id, name, phone_number, hashPassword(b.password), optional(b.vehicle_plate_number), optional(b.vehicle_model));
  } catch (e) {
    if (String(e).includes('UNIQUE constraint failed')) throw new HttpError(400, '이미 가입된 전화번호입니다.');
    throw e;
  }

  const access_token = signSession({ user_id, role_type: 'USER', ver: 0 });
  const res = ok({ access_token, user: { user_id, name, role_type: 'USER' } });
  setSessionCookie(res, access_token);
  return res;
});
