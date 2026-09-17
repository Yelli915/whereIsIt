import { SEED_IDS } from './mock-store';

export interface ClientSession {
  user_id: string;
  name: string;
  role_type: string;
}

// ponytail: 실제 인증(PASS 등) 없이 시드 계정으로 즉시 전환하는 Phase 0 임시 로그인. 실제 배포 전 제거.
export const QUICK_ACCOUNTS = [
  { label: '게스트', user_id: SEED_IDS.GUEST, phone_number: '010-1111-1111', password: 'guest1234' },
  { label: '호스트', user_id: SEED_IDS.HOST, phone_number: '010-2222-2222', password: 'host1234' },
  { label: '관리자', user_id: SEED_IDS.ADMIN, phone_number: '010-9999-9999', password: 'admin1234' },
] as const;

let cached: ClientSession | null | undefined;
let inflight: Promise<ClientSession | null> | null = null;

export async function login(phone_number: string, password: string): Promise<ClientSession | null> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number, password }),
  });
  return res.ok ? res.json() : null;
}

export function fetchSession(): Promise<ClientSession | null> {
  if (cached !== undefined) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cached = data;
        inflight = null;
        return data;
      });
  }
  return inflight;
}

export function getCachedSession(): ClientSession | null {
  return cached ?? null;
}

export function clearSessionCache() {
  cached = undefined;
  inflight = null;
}
