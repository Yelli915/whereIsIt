'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { ui, badgeTone } from '@/lib/ui';
import type { Event } from '@/types';

const STATUS_BADGE: Record<Event['status'], string> = {
  UPCOMING: '예정',
  ONGOING: '진행중',
  CLOSED: '종료',
};

const STATUS_STYLE: Record<Event['status'], string> = {
  UPCOMING: badgeTone.info,
  ONGOING: badgeTone.active,
  CLOSED: badgeTone.neutral,
};

function formatEventPeriod(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString('ko-KR');
  const time = (d: Date) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const sameDay = date === end.toLocaleDateString('ko-KR');
  return sameDay
    ? `${date} ${time(start)} ~ ${time(end)}`
    : `${date} ${time(start)} ~ ${end.toLocaleDateString('ko-KR')} ${time(end)}`;
}

export default function EventsPage() {
  const router = useRouter();
  const { checked, hasAccess } = useRoleGuard('USER');
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    api<Event[]>('/events').then(setEvents, () => setEvents([]));
  }, []);

  if (!checked) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  if (!hasAccess) {
    return <p className={ui.muted}>일반 회원 전용 화면입니다. (관리자 계정 이용 불가)</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="self-start text-sm text-slate-500 transition hover:text-slate-900"
        >
          ← 뒤로 가기
        </button>
        <h1 className={ui.pageTitle}>행사 탐색</h1>
        <p className={ui.muted}>예정되거나 진행 중인 행사를 선택해 주변 주차공간을 확인하세요.</p>
      </div>
      {events.length === 0 && <p className={ui.muted}>현재 탐색 가능한 행사가 없습니다.</p>}
      <div className="grid grid-cols-2 gap-3">
        {events.map((event) => (
          <Link key={event.event_id} href={`/events/${event.event_id}/spaces`} className={ui.cardInteractive}>
            <span className={ui.badge(STATUS_STYLE[event.status])}>{STATUS_BADGE[event.status]}</span>
            <p className="mt-2 text-sm font-semibold text-slate-900">{event.name}</p>
            <p className="text-sm text-slate-500">{event.venue_name}</p>
            <p className="text-sm text-slate-400">{event.address}</p>
            <p className="mt-1 text-sm text-slate-400">
              {formatEventPeriod(event.start_datetime, event.end_datetime)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
