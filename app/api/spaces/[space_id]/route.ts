import { getDb } from '@/lib/db';
import { route, ok, findOne, requireUser, HttpError } from '@/lib/api';

export const DELETE = route((req, { params }: { params: { space_id: string } }) => {
  const { user_id } = requireUser(req);
  const space = findOne('SELECT host_id FROM event_parking_spaces WHERE space_id = ?', params.space_id);
  if (space.host_id !== user_id) throw new HttpError(403, '접근 권한이 없습니다.');
  if (getDb().prepare('SELECT 1 FROM reservations WHERE space_id = ?').get(params.space_id)) {
    throw new HttpError(400, '예약 이력이 존재하는 주차공간은 삭제할 수 없습니다. 관리자에게 문의하세요.');
  }
  getDb().prepare('DELETE FROM event_parking_spaces WHERE space_id = ?').run(params.space_id);
  return ok({ space_id: params.space_id });
});
