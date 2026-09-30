'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { RoleType } from '@/types';
import { fetchSession } from './client-session';

/**
 * 비로그인이면 로그인 화면으로 보내고(로그인 후 복귀), 로그인 상태면 역할 일치 여부를 반환한다.
 * 화면 가드는 UX용일 뿐이며 실제 권한 검사는 API가 한다.
 */
export function useRoleGuard(requiredRole: RoleType): { checked: boolean; hasAccess: boolean } {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchSession().then((session) => {
      if (!alive) return;
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setHasAccess(session.role_type === requiredRole);
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, [requiredRole, router, pathname]);

  return { checked, hasAccess };
}
