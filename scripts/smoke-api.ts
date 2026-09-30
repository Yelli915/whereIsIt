// API 시나리오 점검. 실행 중인 서버 + 방금 시딩한 DB 기준 (DB를 변경함)
//   rm data/app.db && npm run db:seed && npm run dev
//   BASE=http://localhost:3000 npx tsx scripts/smoke-api.ts
import assert from 'node:assert/strict';

const BASE = process.env.BASE ?? 'http://localhost:3000';

async function call(method: string, path: string, token?: string, body?: unknown) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

async function login(phone_number: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, password }),
  });
  const cookie = res.headers.get('set-cookie') ?? '';
  return cookie.match(/naejari_session=([^;]+)/)![1];
}

async function main() {
  const guest = await login('010-1111-1111', 'guest1234');
  const guest3 = await login('010-4444-4444', 'guest1234');
  const host = await login('010-2222-2222', 'host1234');
  const admin = await login('010-9999-9999', 'admin1234');

  // 로그인/회원가입
  assert.equal((await call('POST', '/auth/login', undefined, { phone_number: '01011111111', password: 'wrong' })).status, 400);
  assert.equal((await call('POST', '/auth/login', undefined, { phone_number: '01000000000', password: 'x' })).status, 400);
  const byDigits = await call('POST', '/auth/login', undefined, { phone_number: '01011111111', password: 'guest1234' });
  assert.equal(byDigits.json.data.user.role_type, 'USER');
  assert.equal((await call('GET', '/users/me', byDigits.json.data.access_token)).json.data.name, '김게스트');
  assert.equal((await call('POST', '/auth/signup', undefined, { name: 'a', phone_number: '01055556666', password: 'short' })).status, 400);
  assert.equal((await call('POST', '/auth/signup', undefined, { name: 'a', phone_number: '12345', password: 'longenough' })).status, 400);
  assert.equal((await call('POST', '/auth/signup', undefined, { name: 'a', phone_number: '010-1111-1111', password: 'longenough' })).status, 400);
  const signup = await call('POST', '/auth/signup', undefined, { name: '신규', phone_number: '010-5555-6666', password: 'newuser123' });
  assert.equal(signup.json.data.user.role_type, 'USER');
  assert.equal((await call('GET', '/users/me', signup.json.data.access_token)).json.data.phone_number, '01055556666');
  assert.equal((await call('GET', '/users/me', 'garbage')).status, 401);

  // 로그아웃 → 이전 토큰 무효화
  const oldToken = signup.json.data.access_token;
  assert.equal((await call('POST', '/auth/logout', oldToken)).status, 200);
  assert.equal((await call('GET', '/users/me', oldToken)).status, 401);
  const relogin = await call('POST', '/auth/login', undefined, { phone_number: '01055556666', password: 'newuser123' });
  assert.equal((await call('GET', '/users/me', relogin.json.data.access_token)).status, 200);

  // 번호당 5회 실패 → 올바른 비밀번호도 429
  for (let i = 0; i < 5; i++) {
    assert.equal((await call('POST', '/auth/login', undefined, { phone_number: '01033333333', password: 'wrong' })).status, 400);
  }
  assert.equal((await call('POST', '/auth/login', undefined, { phone_number: '01033333333', password: 'guest1234' })).status, 429);

  // 인증/인가
  assert.equal((await call('GET', '/users/me')).status, 401);
  assert.equal((await call('GET', '/admin/spaces/pending', guest)).status, 403);
  assert.equal((await call('PATCH', '/users/me', guest, { vehicle_model: '쏘나타' })).json.data.vehicle_model, '쏘나타');

  // 행사
  assert.equal((await call('GET', '/events')).json.data.length, 2);
  assert.equal((await call('GET', '/events?status=CLOSED')).json.data.length, 1);
  assert.equal((await call('GET', '/events/nope')).status, 404);
  assert.equal((await call('GET', '/events/event-sangam/spaces')).status, 400); // ONGOING

  // 공간 등록 → 승인 → 예약 → 중복 예약 차단
  const created = await call('POST', '/events/event-jamsil/spaces', host, {
    address: '테스트 주소', photo_url: 'https://x/y.jpg', walking_minutes: 3, price: 10000,
  });
  const spaceId = created.json.data.space_id;
  assert.equal(created.json.data.status, 'PENDING');
  assert.equal((await call('POST', '/reservations', guest, { space_id: spaceId, vehicle_plate_number: '12가3456' })).status, 400);
  assert.equal((await call('PATCH', `/admin/spaces/${spaceId}/approve`, admin)).json.data.status, 'APPROVED');
  assert.equal((await call('PATCH', `/admin/spaces/${spaceId}/reject`, admin)).status, 400);
  assert.equal((await call('POST', '/reservations', host, { space_id: spaceId, vehicle_plate_number: '1' })).status, 400);
  const booked = await call('POST', '/reservations', guest, { space_id: spaceId, vehicle_plate_number: '12가3456' });
  assert.equal(booked.json.data.payment_amount, 10000);
  assert.equal(booked.json.data.is_checked_in, false);
  assert.equal((await call('POST', '/reservations', guest3, { space_id: spaceId, vehicle_plate_number: '56다7890' })).status, 400);
  const listed = (await call('GET', '/events/event-jamsil/spaces')).json.data;
  assert.equal(listed[0].space_id, spaceId); // 도보 3분 최상단
  assert.equal(listed[0].is_reserved, true);
  assert.equal((await call('DELETE', `/spaces/${spaceId}`, host)).status, 400);

  // 입출차 흐름 + 소유권
  const rid = booked.json.data.reservation_id;
  assert.equal((await call('POST', `/reservations/${rid}/check-in`, guest3)).status, 403);
  assert.equal((await call('POST', `/reservations/${rid}/check-out`, guest)).status, 400);
  assert.equal((await call('POST', `/reservations/${rid}/check-in`, guest)).json.data.is_checked_in, true);
  assert.equal((await call('POST', `/reservations/${rid}/check-in`, guest)).status, 400);
  assert.equal((await call('POST', `/reservations/${rid}/check-out`, guest)).json.data.status, 'COMPLETED');
  assert.equal((await call('PATCH', `/admin/reservations/${rid}/confirm-payout`, admin)).json.data.is_payout_done, true);
  assert.equal((await call('PATCH', `/admin/reservations/${rid}/confirm-payout`, admin)).status, 400);

  // 이슈 신고 → 관리자 환불 종결 → 정산 차단
  const reported = await call('POST', '/reservations/res-3/report-issue', guest, { issue_detail: '진입 불가' });
  assert.equal(reported.json.data.status, 'ISSUE_REPORTED');
  const resolved = await call('PATCH', '/admin/reservations/res-3/resolve', admin, { status: 'CANCELLED', is_refunded: true, note: '환불 완료' });
  assert.match(resolved.json.data.issue_note, /\[GUEST \/ .+\] 진입 불가\n\[ADMIN \/ .+\] 환불 완료/);
  assert.equal((await call('PATCH', '/admin/reservations/res-3/confirm-payout', admin)).status, 400);

  // 호스트 현황
  const mine = (await call('GET', '/spaces/mine', host)).json.data;
  assert.equal(mine.find((s: any) => s.space_id === 'space-4').active_reservation.is_checked_in, true);
  assert.equal((await call('GET', '/reservations/mine', guest)).json.data[0].space.address !== undefined, true);

  // 행사 마감/종료
  assert.equal((await call('POST', '/admin/events/event-jamsil/block-reservations', admin)).json.data.status, 'ONGOING');
  assert.equal((await call('POST', '/events/event-jamsil/spaces', host, { address: 'a', photo_url: 'b', walking_minutes: 1, price: 1 })).status, 400);
  const closed = await call('POST', '/admin/events/event-jamsil/close', admin);
  assert.equal(closed.json.data.auto_completed_reservations_count, 1); // res-7
  assert.equal((await call('GET', '/admin/events/event-jamsil/reservations?status=COMPLETED', admin)).json.data.length, 2);

  // 행사 등록/수정
  const ev = await call('POST', '/admin/events', admin, {
    name: '테스트 행사', venue_name: '장소', address: '주소', start_datetime: '2026-12-01T18:00:00', end_datetime: '2026-12-01T22:00:00',
  });
  assert.equal(ev.json.data.status, 'UPCOMING');
  assert.equal((await call('PATCH', `/admin/events/${ev.json.data.event_id}`, admin, { end_datetime: '2026-11-01T00:00:00' })).status, 400);
  assert.equal((await call('PATCH', `/admin/events/${ev.json.data.event_id}`, admin, { name: '수정됨' })).json.data.name, '수정됨');

  console.log('all API checks passed');
}

main();
