import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, body, requireString, HttpError } from '@/lib/api';

export const POST = route(async (req) => {
  const { user_id } = requireAdmin(req);
  const b = await body(req);
  const start = requireString(b.start_datetime, '시작 일시');
  const end = requireString(b.end_datetime, '종료 일시');
  if (!(Date.parse(start) < Date.parse(end))) throw new HttpError(400, '종료 일시는 시작 일시 이후여야 합니다.');

  const event_id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO events (event_id, name, venue_name, address, start_datetime, end_datetime, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      event_id,
      requireString(b.name, '행사명'),
      requireString(b.venue_name, '행사장'),
      requireString(b.address, '주소'),
      start,
      end,
      user_id
    );
  return ok(findOne('SELECT * FROM events WHERE event_id = ?', event_id));
});
