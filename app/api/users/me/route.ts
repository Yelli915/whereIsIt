import { getDb } from '@/lib/db';
import { route, ok, requireUser, body, findOne } from '@/lib/api';

const SELECT_ME =
  'SELECT user_id, name, phone_number, vehicle_plate_number, vehicle_model, role_type, created_at FROM users WHERE user_id = ?';

export const GET = route((req) => ok(findOne(SELECT_ME, requireUser(req).user_id)));

// 전달된 필드만 수정, 빈 문자열은 삭제(null)로 처리
export const PATCH = route(async (req) => {
  const { user_id } = requireUser(req);
  const b = await body(req);
  for (const field of ['vehicle_plate_number', 'vehicle_model'] as const) {
    if (typeof b[field] !== 'string') continue;
    getDb().prepare(`UPDATE users SET ${field} = ? WHERE user_id = ?`).run(b[field].trim() || null, user_id);
  }
  return ok(findOne(SELECT_ME, user_id));
});
