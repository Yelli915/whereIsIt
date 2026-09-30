import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, transaction, HttpError } from '@/lib/api';

// 행사 종료 + 잔여 CONFIRMED 예약을 COMPLETED로 일괄 종결 (ISSUE_REPORTED는 관리자 수동 처리 대상이라 제외)
export const POST = route((req, { params }: { params: { event_id: string } }) => {
  requireAdmin(req);
  const event = findOne('SELECT status FROM events WHERE event_id = ?', params.event_id);
  if (event.status === 'CLOSED') throw new HttpError(400, '이미 종료된 행사입니다.');

  const count = transaction(() => {
    const db = getDb();
    db.prepare(`UPDATE events SET status = 'CLOSED', updated_at = datetime('now') WHERE event_id = ?`).run(params.event_id);
    return db
      .prepare(
        `UPDATE reservations SET status = 'COMPLETED'
         WHERE status = 'CONFIRMED' AND space_id IN (SELECT space_id FROM event_parking_spaces WHERE event_id = ?)`
      )
      .run(params.event_id).changes;
  });
  return ok({ event_id: params.event_id, status: 'CLOSED', auto_completed_reservations_count: Number(count) });
});
