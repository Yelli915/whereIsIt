import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, toReservation, HttpError } from '@/lib/api';

// 이중 손실 방어: 정상 완료 + 미환불 + 미정산 건만
export const PATCH = route((req, { params }: { params: { reservation_id: string } }) => {
  requireAdmin(req);
  findOne('SELECT 1 FROM reservations WHERE reservation_id = ?', params.reservation_id);
  const { changes } = getDb()
    .prepare(
      `UPDATE reservations SET is_payout_done = 1
       WHERE reservation_id = ? AND status = 'COMPLETED' AND is_refunded = 0 AND is_payout_done = 0`
    )
    .run(params.reservation_id);
  if (!changes) {
    throw new HttpError(400, '정상 완료(COMPLETED)된 건에 대해서만 정산이 가능하며, 이미 환불된 건은 정산할 수 없습니다.');
  }
  return ok(toReservation(findOne('SELECT * FROM reservations WHERE reservation_id = ?', params.reservation_id)));
});
