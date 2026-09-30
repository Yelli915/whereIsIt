// 클라이언트 → /api 호출. 세션 쿠키로 인증되며, 실패 시 서버 message로 Error를 던짐
export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.message ?? '요청에 실패했습니다.');
  return json.data;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : '요청에 실패했습니다.');
