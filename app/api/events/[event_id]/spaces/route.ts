import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { route, ok, findOne, requireUser, body, requireString, requireInt, HttpError } from '@/lib/api';

type Ctx = { params: { event_id: string } };

// 게스트용: 승인된 공간을 도보 시간 오름차순으로. is_reserved는 프론트 "마감" 표시용
export const GET = route((_req, { params }: Ctx) => {
  const event = findOne('SELECT status FROM events WHERE event_id = ?', params.event_id);
  if (event.status !== 'UPCOMING') throw new HttpError(400, '예약이 마감되었거나 종료된 행사입니다.');
  const rows = getDb()
    .prepare(
      `SELECT s.space_id, s.address, s.photo_url, s.walking_minutes, s.entry_notes, s.price,
         EXISTS (SELECT 1 FROM reservations r WHERE r.space_id = s.space_id AND r.status != 'CANCELLED') AS is_reserved
       FROM event_parking_spaces s
       WHERE s.event_id = ? AND s.status = 'APPROVED'
       ORDER BY s.walking_minutes`
    )
    .all(params.event_id);
  return ok(rows.map((r) => ({ ...r, is_reserved: Boolean(r.is_reserved) })));
});

// 호스트용: UPCOMING 행사에만 등록, 항상 PENDING으로 시작
export const POST = route(async (req, { params }: Ctx) => {
  const { user_id } = requireUser(req);
  const event = findOne('SELECT status FROM events WHERE event_id = ?', params.event_id);
  if (event.status !== 'UPCOMING') throw new HttpError(400, '예정(UPCOMING) 행사에만 신규 공간을 등록할 수 있습니다.');

  const b = await body(req);
  const space_id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO event_parking_spaces (space_id, event_id, host_id, address, photo_url, walking_minutes, entry_notes, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      space_id,
      params.event_id,
      user_id,
      requireString(b.address, '주소'),
      requireString(b.photo_url, '사진 URL'),
      requireInt(b.walking_minutes, '도보 시간'),
      typeof b.entry_notes === 'string' ? b.entry_notes.trim() || null : null,
      requireInt(b.price, '요금')
    );
  return ok(findOne('SELECT * FROM event_parking_spaces WHERE space_id = ?', space_id));
});
