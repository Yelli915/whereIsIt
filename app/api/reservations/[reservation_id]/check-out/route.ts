import { getDb } from '@/lib/db';
import { route, ok, ownReservation, HttpError } from '@/lib/api';

export const POST = route((req, { params }: { params: { reservation_id: string } }) => {
  ownReservation(req, params.reservation_id);
  const { changes } = getDb()
    .prepare(
      `UPDATE reservations SET is_checked_out = 1, status = 'COMPLETED'
       WHERE reservation_id = ? AND status = 'CONFIRMED' AND is_checked_in = 1 AND is_checked_out = 0`
    )
    .run(params.reservation_id);
  if (!changes) throw new HttpError(400, '출차 처리가 불가능한 상태이거나 먼저 입차 확인이 필요합니다.');
  return ok({ reservation_id: params.reservation_id, is_checked_out: true, status: 'COMPLETED' });
});
