import { getDb } from '@/lib/db';
import { route, ok, requireUser, toReservation } from '@/lib/api';

export const GET = route((req) => {
  const { user_id } = requireUser(req);
  const rows = getDb()
    .prepare(
      `SELECT r.*, s.address, s.entry_notes, s.photo_url, e.event_id, e.name AS event_name, e.start_datetime
       FROM reservations r
       JOIN event_parking_spaces s ON s.space_id = r.space_id
       JOIN events e ON e.event_id = s.event_id
       WHERE r.guest_id = ?
       ORDER BY r.created_at DESC`
    )
    .all(user_id);
  return ok(
    rows.map(({ address, entry_notes, photo_url, event_id, event_name, start_datetime, ...r }) => ({
      ...toReservation(r),
      space: { address, entry_notes, photo_url, event_id, event_name, start_datetime },
    }))
  );
});
