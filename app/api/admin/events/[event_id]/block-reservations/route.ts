import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, HttpError } from '@/lib/api';

// UPCOMING -> ONGOING: 신규 예약/공간 등록만 차단, 기존 예약 입출차는 유지
export const POST = route((req, { params }: { params: { event_id: string } }) => {
  requireAdmin(req);
  const event = findOne('SELECT status FROM events WHERE event_id = ?', params.event_id);
  if (event.status !== 'UPCOMING') throw new HttpError(400, '예정(UPCOMING) 상태의 행사만 예약 마감할 수 있습니다.');
  getDb()
    .prepare(`UPDATE events SET status = 'ONGOING', updated_at = datetime('now') WHERE event_id = ?`)
    .run(params.event_id);
  return ok({ event_id: params.event_id, status: 'ONGOING' });
});
