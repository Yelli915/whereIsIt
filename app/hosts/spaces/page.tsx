'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockStore, SEED_IDS } from '@/lib/mock-store';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getCachedSession } from '@/lib/client-session';
import { ui, badgeTone } from '@/lib/ui';
import Modal from '@/components/common/Modal';
import type { EventParkingSpace, Reservation } from '@/types';

const SPACE_STATUS_BADGE: Record<EventParkingSpace['status'], string> = {
  PENDING: '심사대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

const SPACE_STATUS_STYLE: Record<EventParkingSpace['status'], string> = {
  PENDING: badgeTone.pending,
  APPROVED: badgeTone.success,
  REJECTED: badgeTone.danger,
};

const POLL_INTERVAL_MS = 30000;

export default function HostSpacesPage() {
  const router = useRouter();
  const { checked, hasAccess } = useRoleGuard(SEED_IDS.HOST);
  const [spaces, setSpaces] = useState<EventParkingSpace[]>([]);
  const [reservationsBySpace, setReservationsBySpace] = useState<Record<string, Reservation>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [hotlineOpen, setHotlineOpen] = useState(false);

  const fetchData = useCallback(() => {
    const hostId = getCachedSession()?.user_id ?? '';
    const mySpaces = mockStore.getSpacesByHost(hostId);
    const map: Record<string, Reservation> = {};
    mySpaces.forEach((space) => {
      const reservation = mockStore.getActiveReservationBySpace(space.space_id);
      if (reservation) map[space.space_id] = reservation;
    });
    setSpaces(mySpaces);
    setReservationsBySpace(map);
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    if (!hasAccess) return;
    fetchData();
    const timer = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchData, hasAccess]);

  function handleDelete(spaceId: string) {
    try {
      mockStore.deleteSpace(spaceId);
      fetchData();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '삭제 중 오류가 발생했습니다.');
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            className="self-start text-sm text-slate-500 transition hover:text-slate-900"
          >
            ← 뒤로 가기
          </button>
          <h1 className={ui.pageTitle}>내 공간 목록</h1>
          <p className={ui.muted}>등록한 공간의 심사 상태와 현장 이용 현황을 확인하세요.</p>
        </div>
        <Link href="/hosts/spaces/new" className={ui.btnSecondary}>
          + 공간 등록
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
        <span>
          30초 주기로 상태가 자동 갱신됩니다.
          {lastUpdated && ` (마지막 갱신: ${lastUpdated.toLocaleTimeString('ko-KR')})`}
        </span>
        <button type="button" onClick={fetchData} className={ui.btnSecondary}>
          새로고침
        </button>
      </div>

      {spaces.length === 0 && <p className={ui.muted}>등록된 공간이 없습니다.</p>}

      <div className="grid grid-cols-2 gap-3">
        {spaces.map((space) => {
          const reservation = reservationsBySpace[space.space_id];
          const hasAnomaly = reservation?.status === 'ISSUE_REPORTED';
          return (
            <div key={space.space_id} className={ui.card}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className={ui.badge(SPACE_STATUS_STYLE[space.status])}>
                    {SPACE_STATUS_BADGE[space.status]}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{space.address}</span>
                  <span className="text-sm text-slate-500">
                    도보 {space.walking_minutes}분 · {space.price.toLocaleString()}원
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(space.space_id)}
                  className="shrink-0 text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  삭제
                </button>
              </div>

              {reservation && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className={ui.hint}>게스트 차량번호</span>
                  <p className="text-2xl font-bold tracking-wide text-slate-900">
                    {reservation.vehicle_plate_number}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span
                      className={ui.badge(
                        reservation.is_checked_in ? badgeTone.success : badgeTone.neutral
                      )}
                    >
                      {reservation.is_checked_in ? '입차완료' : '미입차'}
                    </span>
                    <span
                      className={ui.badge(
                        reservation.is_checked_out ? badgeTone.neutral : badgeTone.active
                      )}
                    >
                      {reservation.is_checked_out ? '출차완료' : '이용중'}
                    </span>
                  </div>

                  {hasAnomaly && (
                    <button
                      type="button"
                      onClick={() => setHotlineOpen(true)}
                      className={`${ui.btnDanger} mt-3 w-full`}
                    >
                      관리자 직통 유선 연결
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!deleteError} title="삭제 불가" onClose={() => setDeleteError('')}>
        {deleteError}
      </Modal>

      <Modal open={hotlineOpen} title="관리자 비상 연락처" onClose={() => setHotlineOpen(false)}>
        <div className="flex flex-col gap-1">
          <span>정운영자: 010-9999-9999</span>
          <span>부운영자: 010-8888-8888</span>
        </div>
      </Modal>
    </div>
  );
}
