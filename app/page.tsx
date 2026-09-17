'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SEED_IDS } from '@/lib/mock-store';
import { fetchSession } from '@/lib/client-session';
import { useMounted } from '@/lib/useMounted';
import { ui } from '@/lib/ui';

const ROLE_LINKS: Record<string, { href: string; label: string; description: string }[]> = {
  [SEED_IDS.GUEST]: [
    { href: '/events', label: '행사 탐색', description: '진행 예정/중인 행사와 주변 주차공간을 둘러봅니다.' },
    { href: '/reservations/mine', label: '내 이용권', description: '예약 현황을 확인하고 입·출차를 처리합니다.' },
  ],
  [SEED_IDS.HOST]: [
    { href: '/hosts/spaces', label: '내 공간 목록', description: '등록한 공간의 심사 상태와 예약 현황을 관리합니다.' },
    { href: '/hosts/spaces/new', label: '공간 등록', description: '새 행사에 대여할 주차공간을 신청합니다.' },
  ],
  [SEED_IDS.ADMIN]: [
    { href: '/admin', label: '관리자 대시보드', description: '행사 생애주기, 공간 심사, 예약 관제를 처리합니다.' },
  ],
};

export default function Home() {
  const router = useRouter();
  const mounted = useMounted();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchSession().then((session) => {
      if (!session) {
        router.replace('/login');
        return;
      }
      setCurrentUserId(session.user_id);
    });
  }, [router]);

  if (!mounted || currentUserId === null) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  const links = ROLE_LINKS[currentUserId] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={ui.cardInteractive}>
            <p className="text-sm font-semibold text-slate-900">{link.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
