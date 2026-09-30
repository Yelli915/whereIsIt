import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { route, ok, findOne, requireUser, body, requireString, toReservation, HttpError } from '@/lib/api';

// 즉시 확정. 중복 선점은 uq_active_space_reservation 유니크 인덱스가 최종 방어
export const POST = route(async (req) => {
  const { user_id } = requireUser(req);
  const b = await body(req);
  const space_id = requireString(b.space_id, '공간 ID');
  const plate = requireString(b.vehicle_plate_number, '차량번호');

  const space = findOne(
    `SELECT s.status, s.price, s.host_id, e.status AS event_status
     FROM event_parking_spaces s JOIN events e ON e.event_id = s.event_id WHERE s.space_id = ?`,
    space_id
  );
  if (space.event_status !== 'UPCOMING') throw new HttpError(400, '신규 예약이 마감된 행사입니다.');
  if (space.status !== 'APPROVED') throw new HttpError(400, '예약할 수 없는 공간입니다.');
  if (space.host_id === user_id) throw new HttpError(400, '본인이 등록한 공간은 예약할 수 없습니다.');

  const reservation_id = randomUUID();
  try {
    getDb()
      .prepare(
        `INSERT INTO reservations (reservation_id, space_id, guest_id, vehicle_plate_number, payment_amount)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(reservation_id, space_id, user_id, plate, space.price);
  } catch (e) {
    if (String(e).includes('UNIQUE constraint failed')) throw new HttpError(400, '이미 예약이 마감된 공간입니다.');
    throw e;
  }
  return ok(toReservation(findOne('SELECT * FROM reservations WHERE reservation_id = ?', reservation_id)));
});
