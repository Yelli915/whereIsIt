import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, toReservation } from '@/lib/api';

export const GET = route((req, { params }: { params: { event_id: string } }) => {
  requireAdmin(req);
  findOne('SELECT 1 FROM events WHERE event_id = ?', params.event_id);
  const status = req.nextUrl.searchParams.get('status');
  const rows = getDb()
    .prepare(
      `SELECT r.*, s.address AS space_address,
         g.name AS guest_name, g.phone_number AS guest_phone,
         h.user_id AS host_id, h.name AS host_name, h.phone_number AS host_phone
       FROM reservations r
       JOIN event_parking_spaces s ON s.space_id = r.space_id
       JOIN users g ON g.user_id = r.guest_id
       JOIN users h ON h.user_id = s.host_id
       WHERE s.event_id = ? AND (? IS NULL OR r.status = ?)
       ORDER BY r.created_at`
    )
    .all(params.event_id, status, status);
  return ok(rows.map(toReservation));
});
