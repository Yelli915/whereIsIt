import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, body, requireString, noteLine, toReservation, HttpError } from '@/lib/api';

export const PATCH = route(async (req, { params }: { params: { reservation_id: string } }) => {
  requireAdmin(req);
  findOne('SELECT 1 FROM reservations WHERE reservation_id = ?', params.reservation_id);
  const b = await body(req);
  if (b.status !== 'CANCELLED' && b.status !== 'COMPLETED') throw new HttpError(400, 'status는 CANCELLED 또는 COMPLETED만 가능합니다.');
  if (typeof b.is_refunded !== 'boolean') throw new HttpError(400, 'is_refunded를 입력해주세요.');
  const note = requireString(b.note, '처리 메모');

  const { changes } = getDb()
    .prepare(
      `UPDATE reservations SET status = ?, is_refunded = ?, issue_note = COALESCE(issue_note || char(10), '') || ?
       WHERE reservation_id = ? AND status = 'ISSUE_REPORTED'`
    )
    .run(b.status, b.is_refunded ? 1 : 0, noteLine('ADMIN', note), params.reservation_id);
  if (!changes) throw new HttpError(400, '이슈 신고(ISSUE_REPORTED) 상태의 예약만 종결할 수 있습니다.');
  return ok(toReservation(findOne('SELECT * FROM reservations WHERE reservation_id = ?', params.reservation_id)));
});
