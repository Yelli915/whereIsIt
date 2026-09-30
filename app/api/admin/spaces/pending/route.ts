import { getDb } from '@/lib/db';
import { route, ok, requireAdmin } from '@/lib/api';

export const GET = route((req) => {
  requireAdmin(req);
  const rows = getDb()
    .prepare(
      `SELECT s.*, e.name AS event_name, u.name AS host_name, u.phone_number AS host_phone
       FROM event_parking_spaces s
       JOIN events e ON e.event_id = s.event_id
       JOIN users u ON u.user_id = s.host_id
       WHERE s.status = 'PENDING'
       ORDER BY s.created_at`
    )
    .all();
  return ok(rows);
});
