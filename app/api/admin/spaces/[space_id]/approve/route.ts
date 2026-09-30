import { getDb } from '@/lib/db';
import { route, ok, findOne, requireAdmin, HttpError } from '@/lib/api';

export const PATCH = route((req, { params }: { params: { space_id: string } }) => {
  requireAdmin(req);
  findOne('SELECT 1 FROM event_parking_spaces WHERE space_id = ?', params.space_id);
  const { changes } = getDb()
    .prepare(`UPDATE event_parking_spaces SET status = 'APPROVED' WHERE space_id = ? AND status = 'PENDING'`)
    .run(params.space_id);
  if (!changes) throw new HttpError(400, '심사 대기(PENDING) 중인 공간만 처리할 수 있습니다.');
  return ok(findOne('SELECT * FROM event_parking_spaces WHERE space_id = ?', params.space_id));
});
