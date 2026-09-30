import { getDb } from '@/lib/db';
import { route, ok, requireUser } from '@/lib/api';

// 활성 예약 = CONFIRMED / ISSUE_REPORTED. 공간당 최대 1건 (uq_active_space_reservation)
export const GET = route((req) => {
  const { user_id } = requireUser(req);
  const rows = getDb()
    .prepare(
      `SELECT s.*, e.name AS event_name, e.status AS event_status,
         r.reservation_id, r.vehicle_plate_number, r.status AS reservation_status, r.is_checked_in, r.is_checked_out
       FROM event_parking_spaces s
       JOIN events e ON e.event_id = s.event_id
       LEFT JOIN reservations r ON r.space_id = s.space_id AND r.status IN ('CONFIRMED', 'ISSUE_REPORTED')
       WHERE s.host_id = ?
       ORDER BY s.created_at DESC`
    )
    .all(user_id);

  return ok(
    rows.map(({ reservation_id, vehicle_plate_number, reservation_status, is_checked_in, is_checked_out, ...space }) => ({
      ...space,
      active_reservation: reservation_id
        ? {
            reservation_id,
            vehicle_plate_number,
            status: reservation_status,
            is_checked_in: Boolean(is_checked_in),
            is_checked_out: Boolean(is_checked_out),
          }
        : null,
    }))
  );
});
