import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, body, HttpError } from '@/lib/api';

// status는 수정 불가 (block-reservations / close 전용). start_datetime은 프론트 수정 폼 때문에 허용
const EDITABLE = ['name', 'venue_name', 'address', 'start_datetime', 'end_datetime'] as const;

export const PATCH = route(async (req, { params }: { params: { event_id: string } }) => {
  requireAdmin(req);
  const event = findOne('SELECT * FROM events WHERE event_id = ?', params.event_id);
  const b = await body(req);
  const next = { ...event };
  for (const f of EDITABLE) if (typeof b[f] === 'string' && b[f].trim()) next[f] = b[f].trim();
  if (!(Date.parse(next.start_datetime) < Date.parse(next.end_datetime))) {
    throw new HttpError(400, '종료 일시는 시작 일시 이후여야 합니다.');
  }

  getDb()
    .prepare(
      `UPDATE events SET name = ?, venue_name = ?, address = ?, start_datetime = ?, end_datetime = ?, updated_at = datetime('now')
       WHERE event_id = ?`
    )
    .run(next.name, next.venue_name, next.address, next.start_datetime, next.end_datetime, params.event_id);
  return ok(findOne('SELECT * FROM events WHERE event_id = ?', params.event_id));
});
