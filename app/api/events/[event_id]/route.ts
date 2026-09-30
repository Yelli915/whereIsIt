import { route, ok, findOne } from '@/lib/api';

export const GET = route((_req, { params }: { params: { event_id: string } }) =>
  ok(findOne('SELECT * FROM events WHERE event_id = ?', params.event_id))
);
