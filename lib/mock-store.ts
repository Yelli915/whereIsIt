import type {
  Event,
  EventParkingSpace,
  Reservation,
  User,
} from '@/types';

const DB_KEY = 'naejari:db';

export const SEED_IDS = {
  GUEST: 'user-guest-1',
  GUEST2: 'user-guest-2',
  GUEST3: 'user-guest-3',
  HOST: 'user-host-1',
  ADMIN: 'user-admin-1',
  EVENT_JAMSIL: 'event-jamsil',
  EVENT_SANGAM: 'event-sangam',
  EVENT_GOCHEOK: 'event-gocheok',
  SPACE_ISSUE: 'space-1',
  SPACE_APPROVED: 'space-2',
  SPACE_PENDING: 'space-3',
  SPACE_RESERVED: 'space-4',
  SPACE_JAMSIL_A: 'space-5',
  SPACE_JAMSIL_B: 'space-6',
  SPACE_REJECTED: 'space-7',
  SPACE_CLOSED_A: 'space-8',
  SPACE_CLOSED_B: 'space-9',
  SPACE_PENDING_2: 'space-10',
  SPACE_JAMSIL_C: 'space-11',
  SPACE_JAMSIL_D: 'space-12',
  SPACE_JAMSIL_E: 'space-13',
} as const;

interface DB {
  users: User[];
  events: Event[];
  spaces: EventParkingSpace[];
  reservations: Reservation[];
}

function seedDB(): DB {
  const users: Omit<User, 'created_at'>[] = [
      {
        user_id: SEED_IDS.GUEST,
        name: '김게스트',
        phone_number: '010-1111-1111',
        vehicle_plate_number: '12가3456',
        vehicle_model: '아반떼',
        role_type: 'USER',
      },
      {
        user_id: SEED_IDS.GUEST2,
        name: '이하나',
        phone_number: '010-3333-3333',
        vehicle_plate_number: '34나5678',
        vehicle_model: '카니발',
        role_type: 'USER',
      },
      {
        user_id: SEED_IDS.GUEST3,
        name: '정하늘',
        phone_number: '010-4444-4444',
        vehicle_plate_number: '56다7890',
        vehicle_model: '쏘렌토',
        role_type: 'USER',
      },
      {
        user_id: SEED_IDS.HOST,
        name: '박호스트',
        phone_number: '010-2222-2222',
        role_type: 'USER',
      },
      {
        user_id: SEED_IDS.ADMIN,
        name: '최운영',
        phone_number: '010-9999-9999',
        role_type: 'ADMIN',
      },
    ];

  const events: Omit<Event, 'created_by' | 'created_at' | 'updated_at'>[] = [
      {
        event_id: SEED_IDS.EVENT_JAMSIL,
        name: '2026 서울세계불꽃축제',
        venue_name: '여의도한강공원',
        address: '서울 영등포구 여의동로 330',
        start_datetime: '2026-10-03T18:00:00',
        end_datetime: '2026-10-03T21:30:00',
        status: 'UPCOMING',
      },
      {
        event_id: SEED_IDS.EVENT_SANGAM,
        name: '2026 한강 가을 페스티벌 (뚝섬)',
        venue_name: '뚝섬한강공원',
        address: '서울 광진구 강변북로 139',
        start_datetime: '2026-09-16T17:00:00',
        end_datetime: '2026-09-16T21:30:00',
        status: 'ONGOING',
      },
      {
        event_id: SEED_IDS.EVENT_GOCHEOK,
        name: '반포 밤도깨비 야시장',
        venue_name: '반포한강공원',
        address: '서울 서초구 신반포로11길 40',
        start_datetime: '2026-08-01T18:00:00',
        end_datetime: '2026-08-01T22:30:00',
        status: 'CLOSED',
      },
    ];

  const spaces: Omit<EventParkingSpace, 'created_at'>[] = [
      {
        space_id: SEED_IDS.SPACE_ISSUE,
        event_id: SEED_IDS.EVENT_SANGAM,
        host_id: SEED_IDS.HOST,
        address: '서울 성동구 성수동1가 685 (상가 주차장)',
        photo_url: 'https://placehold.co/400x300?text=Parking+1',
        walking_minutes: 5,
        entry_notes: 'SUV 진입 불가',
        price: 20000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_APPROVED,
        event_id: SEED_IDS.EVENT_SANGAM,
        host_id: SEED_IDS.HOST,
        address: '서울 광진구 자양동 227',
        photo_url: 'https://placehold.co/400x300?text=Parking+2',
        walking_minutes: 8,
        price: 15000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_PENDING,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 44 (오피스텔 방문주차)',
        photo_url: 'https://placehold.co/400x300?text=Parking+3',
        walking_minutes: 10,
        price: 18000,
        status: 'PENDING',
      },
      {
        space_id: SEED_IDS.SPACE_RESERVED,
        event_id: SEED_IDS.EVENT_SANGAM,
        host_id: SEED_IDS.HOST,
        address: '서울 광진구 구의동 100',
        photo_url: 'https://placehold.co/400x300?text=Parking+4',
        walking_minutes: 3,
        price: 25000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_JAMSIL_A,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 15 (오피스텔 지하주차장)',
        photo_url: 'https://placehold.co/400x300?text=Parking+5',
        walking_minutes: 6,
        entry_notes: '저녁 6시 이후 방문객 주차 가능, 지하 2층 B구역',
        price: 22000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_JAMSIL_B,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 23 (상가 주차장)',
        photo_url: 'https://placehold.co/400x300?text=Parking+6',
        walking_minutes: 12,
        price: 14000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_REJECTED,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 60 (이면도로)',
        photo_url: 'https://placehold.co/400x300?text=Parking+7',
        walking_minutes: 4,
        entry_notes: '불법 주정차 단속 구역으로 확인되어 반려',
        price: 30000,
        status: 'REJECTED',
      },
      {
        space_id: SEED_IDS.SPACE_CLOSED_A,
        event_id: SEED_IDS.EVENT_GOCHEOK,
        host_id: SEED_IDS.HOST,
        address: '서울 서초구 반포동 45',
        photo_url: 'https://placehold.co/400x300?text=Parking+8',
        walking_minutes: 7,
        price: 20000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_CLOSED_B,
        event_id: SEED_IDS.EVENT_GOCHEOK,
        host_id: SEED_IDS.HOST,
        address: '서울 서초구 잠원동 60',
        photo_url: 'https://placehold.co/400x300?text=Parking+9',
        walking_minutes: 9,
        price: 16000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_PENDING_2,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 76 (빌라 전면)',
        photo_url: 'https://placehold.co/400x300?text=Parking+10',
        walking_minutes: 9,
        entry_notes: '경차만 진입 가능',
        price: 17000,
        status: 'PENDING',
      },
      {
        space_id: SEED_IDS.SPACE_JAMSIL_C,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 88 (교회 주차장)',
        photo_url: 'https://placehold.co/400x300?text=Parking+11',
        walking_minutes: 7,
        entry_notes: '평일 저녁·주말만 개방',
        price: 19000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_JAMSIL_D,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 12 (오피스 야외주차장)',
        photo_url: 'https://placehold.co/400x300?text=Parking+12',
        walking_minutes: 4,
        price: 26000,
        status: 'APPROVED',
      },
      {
        space_id: SEED_IDS.SPACE_JAMSIL_E,
        event_id: SEED_IDS.EVENT_JAMSIL,
        host_id: SEED_IDS.HOST,
        address: '서울 영등포구 여의도동 5 (단독주택 마당)',
        photo_url: 'https://placehold.co/400x300?text=Parking+13',
        walking_minutes: 15,
        entry_notes: '대형차 진입 불가',
        price: 12000,
        status: 'APPROVED',
      },
    ];

  const reservations: Omit<Reservation, 'created_at'>[] = [
      {
        reservation_id: 'res-1',
        space_id: SEED_IDS.SPACE_RESERVED,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 25000,
        status: 'CONFIRMED',
        is_checked_in: true,
        is_checked_out: false,
        is_refunded: false,
        is_payout_done: false,
        issue_note: null,
      },
      {
        reservation_id: 'res-2',
        space_id: SEED_IDS.SPACE_ISSUE,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 20000,
        status: 'ISSUE_REPORTED',
        is_checked_in: true,
        is_checked_out: false,
        is_refunded: false,
        is_payout_done: false,
        issue_note: '[GUEST / 2026-09-16 19:20] 다른 차량이 자리에 주차되어 있습니다.',
      },
      {
        reservation_id: 'res-3',
        space_id: SEED_IDS.SPACE_JAMSIL_A,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 22000,
        status: 'CONFIRMED',
        is_checked_in: false,
        is_checked_out: false,
        is_refunded: false,
        is_payout_done: false,
        issue_note: null,
      },
      {
        reservation_id: 'res-4',
        space_id: SEED_IDS.SPACE_CLOSED_A,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 20000,
        status: 'COMPLETED',
        is_checked_in: true,
        is_checked_out: true,
        is_refunded: false,
        is_payout_done: false,
        issue_note: null,
      },
      {
        reservation_id: 'res-5',
        space_id: SEED_IDS.SPACE_CLOSED_B,
        guest_id: SEED_IDS.GUEST2,
        vehicle_plate_number: '34나5678',
        payment_amount: 16000,
        status: 'COMPLETED',
        is_checked_in: true,
        is_checked_out: true,
        is_refunded: false,
        is_payout_done: true,
        issue_note: null,
      },
      {
        reservation_id: 'res-6',
        space_id: SEED_IDS.SPACE_APPROVED,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 15000,
        status: 'CANCELLED',
        is_checked_in: false,
        is_checked_out: false,
        is_refunded: true,
        is_payout_done: false,
        issue_note:
          '[GUEST / 2026-09-15 18:40] 진입로가 사유차량으로 막혀 있어 주차 불가합니다.\n[ADMIN / 2026-09-15 19:05] 현장 확인 후 전액 환불 처리 완료.',
      },
      {
        reservation_id: 'res-7',
        space_id: SEED_IDS.SPACE_JAMSIL_B,
        guest_id: SEED_IDS.GUEST3,
        vehicle_plate_number: '56다7890',
        payment_amount: 14000,
        status: 'CONFIRMED',
        is_checked_in: false,
        is_checked_out: false,
        is_refunded: false,
        is_payout_done: false,
        issue_note: null,
      },
      {
        reservation_id: 'res-8',
        space_id: SEED_IDS.SPACE_APPROVED,
        guest_id: SEED_IDS.GUEST,
        vehicle_plate_number: '12가3456',
        payment_amount: 15000,
        status: 'ISSUE_REPORTED',
        is_checked_in: false,
        is_checked_out: false,
        is_refunded: false,
        is_payout_done: false,
        issue_note: '[GUEST / 2026-09-16 17:40] 예약한 자리 진입로에 이면주차 차량이 있어 도착 전인데 진입이 불가능해 보입니다.',
      },
    ];

  const now = new Date().toISOString();
  return {
    users: users.map((u) => ({ ...u, created_at: now })),
    events: events.map((e) => ({ ...e, created_by: SEED_IDS.ADMIN, created_at: now, updated_at: null })),
    spaces: spaces.map((s) => ({ ...s, created_at: now })),
    reservations: reservations.map((r) => ({ ...r, created_at: now })),
  };
}

function loadDB(): DB {
  if (typeof window === 'undefined') return seedDB();
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const fresh = seedDB();
    localStorage.setItem(DB_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return JSON.parse(raw) as DB;
}

function saveDB(db: DB) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const mockStore = {
  resetDB() {
    saveDB(seedDB());
  },

  // --- getters ---
  getUsers(): User[] {
    return loadDB().users;
  },
  getUserById(userId: string): User | undefined {
    return loadDB().users.find((u) => u.user_id === userId);
  },
  getEvents(): Event[] {
    return loadDB().events;
  },
  getEventById(eventId: string): Event | undefined {
    return loadDB().events.find((e) => e.event_id === eventId);
  },
  getSpaces(): EventParkingSpace[] {
    return loadDB().spaces;
  },
  getSpaceById(spaceId: string): EventParkingSpace | undefined {
    return loadDB().spaces.find((s) => s.space_id === spaceId);
  },
  getSpacesByHost(hostId: string): EventParkingSpace[] {
    return loadDB().spaces.filter((s) => s.host_id === hostId);
  },
  getApprovedSpacesByEvent(eventId: string): EventParkingSpace[] {
    return loadDB()
      .spaces.filter((s) => s.event_id === eventId && s.status === 'APPROVED')
      .sort((a, b) => a.walking_minutes - b.walking_minutes);
  },
  getReservations(): Reservation[] {
    return loadDB().reservations;
  },
  getReservationsBySpace(spaceId: string): Reservation[] {
    return loadDB().reservations.filter((r) => r.space_id === spaceId);
  },
  getReservationsByGuest(guestId: string): Reservation[] {
    return loadDB().reservations.filter((r) => r.guest_id === guestId);
  },
  getActiveReservationBySpace(spaceId: string): Reservation | undefined {
    return loadDB().reservations.find(
      (r) => r.space_id === spaceId && r.status !== 'CANCELLED' && r.status !== 'COMPLETED'
    );
  },

  // --- mutations ---
  // POST /events/{event_id}/spaces — event_id는 경로, host_id는 세션에서 오며 body에 포함되지 않음
  createSpace(
    eventId: string,
    hostId: string,
    body: {
      address: string;
      photo_url: string;
      walking_minutes: number;
      entry_notes?: string;
      price: number;
    }
  ): EventParkingSpace {
    const db = loadDB();
    const event = db.events.find((e) => e.event_id === eventId);
    if (!event || event.status !== 'UPCOMING') {
      throw new Error('예정(UPCOMING) 행사에만 신규 공간을 등록할 수 있습니다.');
    }
    const space: EventParkingSpace = {
      space_id: crypto.randomUUID(),
      event_id: eventId,
      host_id: hostId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      ...body,
    };
    db.spaces.push(space);
    saveDB(db);
    return space;
  },

  createReservation(input: {
    space_id: string;
    guest_id: string;
    vehicle_plate_number: string;
  }): Reservation {
    const db = loadDB();
    const space = db.spaces.find((s) => s.space_id === input.space_id);
    if (!space) throw new Error('존재하지 않는 공간입니다.');
    const event = db.events.find((e) => e.event_id === space.event_id);
    if (!event || event.status !== 'UPCOMING') {
      throw new Error('신규 예약이 마감된 행사입니다.');
    }
    const alreadyReserved = db.reservations.some(
      (r) => r.space_id === input.space_id && r.status !== 'CANCELLED' && r.status !== 'COMPLETED'
    );
    if (alreadyReserved) throw new Error('이미 예약이 마감된 공간입니다.');

    const reservation: Reservation = {
      reservation_id: crypto.randomUUID(),
      space_id: input.space_id,
      guest_id: input.guest_id,
      vehicle_plate_number: input.vehicle_plate_number,
      payment_amount: space.price,
      status: 'CONFIRMED',
      is_checked_in: false,
      is_checked_out: false,
      is_refunded: false,
      is_payout_done: false,
      issue_note: null,
      created_at: new Date().toISOString(),
    };
    db.reservations.push(reservation);
    saveDB(db);
    return reservation;
  },

  checkIn(reservationId: string) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation || reservation.status !== 'CONFIRMED' || reservation.is_checked_in) return;
    reservation.is_checked_in = true;
    saveDB(db);
  },

  checkOut(reservationId: string) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation || !reservation.is_checked_in || reservation.is_checked_out) return;
    reservation.is_checked_out = true;
    reservation.status = 'COMPLETED';
    saveDB(db);
  },

  reportIssue(reservationId: string, issueDetail: string) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation || reservation.status !== 'CONFIRMED') return;
    reservation.status = 'ISSUE_REPORTED';
    saveDB(db);
    this.appendIssueNote(reservationId, 'GUEST', issueDetail);
  },

  deleteSpace(spaceId: string) {
    const db = loadDB();
    const hasReservationHistory = db.reservations.some((r) => r.space_id === spaceId);
    if (hasReservationHistory) {
      throw new Error(
        '예약 이력이 존재하는 주차공간은 삭제할 수 없습니다. 관리자에게 문의하세요.'
      );
    }
    db.spaces = db.spaces.filter((s) => s.space_id !== spaceId);
    saveDB(db);
  },

  appendIssueNote(reservationId: string, authorRole: 'USER' | 'ADMIN' | string, note: string) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation) return;
    const line = `[${authorRole} / ${formatTimestamp(new Date())}] ${note}`;
    reservation.issue_note = reservation.issue_note ? `${reservation.issue_note}\n${line}` : line;
    saveDB(db);
  },

  blockEventReservations(eventId: string) {
    const db = loadDB();
    const event = db.events.find((e) => e.event_id === eventId);
    if (!event) return;
    event.status = 'ONGOING';
    saveDB(db);
  },

  closeEvent(eventId: string): number {
    const db = loadDB();
    const event = db.events.find((e) => e.event_id === eventId);
    if (!event) return 0;
    event.status = 'CLOSED';
    const spaceIds = new Set(
      db.spaces.filter((s) => s.event_id === eventId).map((s) => s.space_id)
    );
    let changed = 0;
    db.reservations.forEach((r) => {
      if (spaceIds.has(r.space_id) && r.status === 'CONFIRMED' && !r.is_checked_out) {
        r.status = 'COMPLETED';
        changed += 1;
      }
    });
    saveDB(db);
    return changed;
  },

  createEvent(input: {
    name: string;
    venue_name: string;
    address: string;
    start_datetime: string;
    end_datetime: string;
    created_by: string;
  }): Event {
    const db = loadDB();
    const event: Event = {
      event_id: crypto.randomUUID(),
      status: 'UPCOMING',
      created_at: new Date().toISOString(),
      updated_at: null,
      ...input,
    };
    db.events.push(event);
    saveDB(db);
    return event;
  },

  // PATCH /admin/events/{event_id} — 명칭/장소/일시만 수정 가능, status는 변경 불가
  updateEvent(
    eventId: string,
    input: {
      name: string;
      venue_name: string;
      address: string;
      start_datetime: string;
      end_datetime: string;
    }
  ): Event {
    const db = loadDB();
    const event = db.events.find((e) => e.event_id === eventId);
    if (!event) throw new Error('존재하지 않는 행사입니다.');
    Object.assign(event, input);
    event.updated_at = new Date().toISOString();
    saveDB(db);
    return event;
  },

  approveSpace(spaceId: string) {
    const db = loadDB();
    const space = db.spaces.find((s) => s.space_id === spaceId);
    if (!space) return;
    space.status = 'APPROVED';
    saveDB(db);
  },

  rejectSpace(spaceId: string) {
    const db = loadDB();
    const space = db.spaces.find((s) => s.space_id === spaceId);
    if (!space) return;
    space.status = 'REJECTED';
    saveDB(db);
  },

  resolveReservation(
    reservationId: string,
    input: {
      status: 'CANCELLED' | 'COMPLETED';
      is_refunded: boolean;
      adminNote?: string;
    }
  ) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (!reservation || reservation.status !== 'ISSUE_REPORTED') return;
    reservation.status = input.status;
    reservation.is_refunded = input.is_refunded;
    saveDB(db);
    if (input.adminNote?.trim()) {
      this.appendIssueNote(reservationId, 'ADMIN', input.adminNote.trim());
    }
  },

  confirmPayout(reservationId: string) {
    const db = loadDB();
    const reservation = db.reservations.find((r) => r.reservation_id === reservationId);
    if (
      !reservation ||
      reservation.status !== 'COMPLETED' ||
      reservation.is_refunded ||
      reservation.is_payout_done
    ) {
      return;
    }
    reservation.is_payout_done = true;
    saveDB(db);
  },
};
