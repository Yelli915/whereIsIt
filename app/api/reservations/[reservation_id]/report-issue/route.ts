import { getDb } from '@/lib/db';
import { route, ok, findOne, ownReservation, body, requireString, noteLine, toReservation, HttpError } from '@/lib/api';

export const POST = route(async (req, { params }: { params: { reservation_id: string } }) => {
  ownReservation(req, params.reservation_id);
  const detail = requireString((await body(req)).issue_detail, '신고 내용');
  const { changes } = getDb()
    .prepare(
      `UPDATE reservations SET status = 'ISSUE_REPORTED', issue_note = COALESCE(issue_note || char(10), '') || ?
       WHERE reservation_id = ? AND status = 'CONFIRMED'`
    )
    .run(noteLine('GUEST', detail), params.reservation_id);
  if (!changes) throw new HttpError(400, '진행 중(CONFIRMED)인 예약만 신고할 수 있습니다.');
  return ok(toReservation(findOne('SELECT * FROM reservations WHERE reservation_id = ?', params.reservation_id)));
});
