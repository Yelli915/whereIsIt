export type RoleType = 'USER' | 'ADMIN';

export interface User {
  user_id: string;
  name: string;
  phone_number: string;
  vehicle_plate_number?: string;
  vehicle_model?: string;
  role_type: RoleType;
  created_at: string;
}

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'CLOSED';

export interface Event {
  event_id: string;
  name: string;
  venue_name: string;
  address: string;
  start_datetime: string;
  end_datetime: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export type SpaceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EventParkingSpace {
  space_id: string;
  event_id: string;
  host_id: string;
  address: string;
  photo_url: string;
  walking_minutes: number;
  entry_notes?: string;
  price: number;
  status: SpaceStatus;
  created_at: string;
}

// 주의: 단순 변심 취소 정책이 없으므로 CANCEL_REQUESTED 상태는 존재하지 않음
export type ReservationStatus = 'CONFIRMED' | 'ISSUE_REPORTED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  reservation_id: string;
  space_id: string;
  guest_id: string;
  vehicle_plate_number: string;
  payment_amount: number;
  status: ReservationStatus;
  is_checked_in: boolean;
  is_checked_out: boolean;
  is_refunded: boolean;
  is_payout_done: boolean;
  issue_note: string | null;
  created_at: string;
}
