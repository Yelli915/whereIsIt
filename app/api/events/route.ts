import { getDb } from '@/lib/db';
import { route, ok } from '@/lib/api';

const STATUSES = ['UPCOMING', 'ONGOING', 'CLOSED'];

export const GET = route((req) => {
  const statuses = (req.nextUrl.searchParams.get('status') ?? 'UPCOMING,ONGOING')
    .split(',')
    .filter((s) => STATUSES.includes(s));
  const rows = getDb()
    .prepare(`SELECT * FROM events WHERE status IN (${statuses.map(() => '?').join(',')}) ORDER BY start_datetime`)
    .all(...statuses);
  return ok(rows);
});
