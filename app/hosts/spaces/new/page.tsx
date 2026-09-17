'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockStore, SEED_IDS } from '@/lib/mock-store';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getCachedSession } from '@/lib/client-session';
import { ui } from '@/lib/ui';
import type { Event } from '@/types';

const EVENT_STATUS_LABEL: Record<Event['status'], string> = {
  UPCOMING: '예정',
  ONGOING: '진행중 (선택 불가)',
  CLOSED: '종료 (선택 불가)',
};

export default function NewSpacePage() {
  const router = useRouter();
  const { checked, hasAccess } = useRoleGuard(SEED_IDS.HOST);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState('');
  const [address, setAddress] = useState('');
  const [walkingMinutes, setWalkingMinutes] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setEvents(mockStore.getEvents());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const event = events.find((ev) => ev.event_id === eventId);
    if (!event || event.status !== 'UPCOMING') {
      setError('공간을 등록할 수 있는 예정(UPCOMING) 행사를 선택해주세요.');
      return;
    }
    if (!address.trim() || !photoUrl.trim()) {
      setError('상세 주소와 현장 사진 URL을 입력해주세요.');
      return;
    }
    const minutes = Number(walkingMinutes);
    const priceValue = Number(price);
    if (!Number.isInteger(minutes) || minutes < 0) {
      setError('예상 도보 소요 시간은 0 이상의 정수로 입력해주세요.');
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError('패키지 대여 요금을 올바르게 입력해주세요.');
      return;
    }

    try {
      mockStore.createSpace(eventId, getCachedSession()?.user_id ?? '', {
        address: address.trim(),
        photo_url: photoUrl.trim(),
        walking_minutes: minutes,
        entry_notes: entryNotes.trim() || undefined,
        price: priceValue,
      });
      router.push('/hosts/spaces');
    } catch (err) {
      setError(err instanceof Error ? err.message : '공간 등록에 실패했습니다.');
    }
  }

  if (!checked) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  if (!hasAccess) {
    return <p className={ui.muted}>호스트만 이용할 수 있는 화면입니다.</p>;
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
        <h1 className={ui.pageTitle}>주차공간 등록</h1>
        <p className={ui.muted}>행사 정보를 확인하고 대여할 공간 정보를 입력하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${ui.card} flex flex-col gap-4`}>
        <label className="flex flex-col gap-1">
          <span className={ui.label}>행사 선택</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            required
            className={ui.input}
          >
            <option value="" disabled>
              행사를 선택하세요
            </option>
            {events.map((ev) => (
              <option key={ev.event_id} value={ev.event_id} disabled={ev.status !== 'UPCOMING'}>
                {ev.name} ({EVENT_STATUS_LABEL[ev.status]})
              </option>
            ))}
          </select>
          <span className={ui.hint}>신규 공간은 예정(UPCOMING) 행사에만 등록할 수 있습니다.</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className={ui.label}>상세 주소</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="예: 서울 마포구 성산동 123-4"
            className={ui.input}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={ui.label}>예상 도보 소요 시간(분)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={walkingMinutes}
            onChange={(e) => setWalkingMinutes(e.target.value)}
            required
            className={ui.input}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={ui.label}>진입 유의사항 (선택)</span>
          <textarea
            value={entryNotes}
            onChange={(e) => setEntryNotes(e.target.value)}
            placeholder="예: SUV 진입 불가, 막다른 골목 끝"
            className={ui.input}
            rows={3}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={ui.label}>패키지 대여 요금(원)</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className={ui.input}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={ui.label}>현장 사진 URL</span>
          <input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            required
            placeholder="https://..."
            className={ui.input}
          />
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button type="submit" className={ui.btnPrimary}>
          등록 신청 (심사대기)
        </button>
      </form>
    </div>
  );
}
