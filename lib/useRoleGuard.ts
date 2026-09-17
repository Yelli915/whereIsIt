'use client';

import { useEffect, useState } from 'react';
import { fetchSession } from './client-session';

/**
 * 현재 로그인한 사용자가 requiredUserId인지 여부만 반환한다.
 * 페이지 이동(리다이렉트) 없이, 호출한 컴포넌트가 이 값에 따라
 * 보여줄 내용을 직접 갈라서 렌더링한다.
 */
export function useRoleGuard(requiredUserId: string): { checked: boolean; hasAccess: boolean } {
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSession().then((session) => {
      if (!alive) return;
      setHasAccess(session?.user_id === requiredUserId);
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, [requiredUserId]);

  return { checked, hasAccess };
}
