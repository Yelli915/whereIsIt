import type { RoleType } from '@/types';

export interface ClientSession {
  user_id: string;
  name: string;
  role_type: RoleType;
}

let cached: ClientSession | null | undefined;
let inflight: Promise<ClientSession | null> | null = null;

// 로그인 여부는 서버(/api/users/me)가 판단. 401이면 비로그인
export function fetchSession(): Promise<ClientSession | null> {
  if (cached !== undefined) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetch('/api/users/me')
      .then((r) => (r.ok ? r.json().then((j) => j.data) : null))
      .catch(() => null)
      .then((data) => {
        cached = data;
        inflight = null;
        return data;
      });
  }
  return inflight;
}

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}

// 로그인 후 돌아갈 경로. 외부 URL(//evil.com 등)로의 오픈 리다이렉트 차단
export function safeNextPath(next: string | null, fallback: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : fallback;
}
