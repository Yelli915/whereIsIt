import { getDb } from '@/lib/db';
import { route, ok, findOne, ownReservation, toReservation, HttpError } from '@/lib/api';

export const POST = route((req, { params }: { params: { reservation_id: string } }) => {
  ownReservation(req, params.reservation_id);
  const { changes } = getDb()
    .prepare(
      `UPDATE reservations SET is_checked_in = 1
       WHERE reservation_id = ? AND status = 'CONFIRMED' AND is_checked_in = 0`
    )
    .run(params.reservation_id);
  if (!changes) throw new HttpError(400, '입차 확인이 불가능한 상태입니다.');
  return ok(toReservation(findOne('SELECT * FROM reservations WHERE reservation_id = ?', params.reservation_id)));
});
