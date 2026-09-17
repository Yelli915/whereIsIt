'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockStore, SEED_IDS } from '@/lib/mock-store';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getCachedSession } from '@/lib/client-session';
import { ui, badgeTone } from '@/lib/ui';
import Modal from '@/components/common/Modal';
import type { EventParkingSpace, Reservation } from '@/types';

const STATUS_LABEL: Record<Reservation['status'], string> = {
  CONFIRMED: '확정',
  ISSUE_REPORTED: '이슈 접수',
  CANCELLED: '취소',
  COMPLETED: '이용 완료',
};

const STATUS_STYLE: Record<Reservation['status'], string> = {
  CONFIRMED: badgeTone.info,
  ISSUE_REPORTED: badgeTone.danger,
  CANCELLED: badgeTone.neutral,
  COMPLETED: badgeTone.success,
};

// Phase 0 고정값: DB에 저장하지 않는 config성 상수 (행사/공간 무관 공통 비상 연락망)
const EMERGENCY_CONTACTS = [
  { label: '주 담당자', phone: '010-1234-5678' },
  { label: '부 담당자', phone: '010-8765-4321' },
];

const FILTER_OPTIONS: { value: 'ALL' | Reservation['status']; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'CONFIRMED', label: STATUS_LABEL.CONFIRMED },
  { value: 'ISSUE_REPORTED', label: STATUS_LABEL.ISSUE_REPORTED },
  { value: 'COMPLETED', label: STATUS_LABEL.COMPLETED },
  { value: 'CANCELLED', label: STATUS_LABEL.CANCELLED },
];

export default function MyReservationsPage() {
  const router = useRouter();
  const { checked, hasAccess } = useRoleGuard(SEED_IDS.GUEST);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spacesById, setSpacesById] = useState<Record<string, EventParkingSpace>>({});
  const [issueTargetId, setIssueTargetId] = useState<string | null>(null);
  const [issueDetail, setIssueDetail] = useState('');
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | Reservation['status']>('ALL');
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(
    null
  );

  function fetchData() {
    const guestId = getCachedSession()?.user_id ?? '';
    const myReservations = mockStore.getReservationsByGuest(guestId);
    const map: Record<string, EventParkingSpace> = {};
    myReservations.forEach((r) => {
      const space = mockStore.getSpaceById(r.space_id);
      if (space) map[r.space_id] = space;
    });
    setReservations(myReservations);
    setSpacesById(map);
  }

  useEffect(() => {
    if (!hasAccess) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess]);

  function handleCheckIn(reservationId: string) {
    mockStore.checkIn(reservationId);
    fetchData();
  }

  function handleCheckOut(reservationId: string) {
    mockStore.checkOut(reservationId);
    fetchData();
  }

  function openIssueModal(reservationId: string) {
    setIssueTargetId(reservationId);
    setIssueDetail('');
  }

  function submitIssue() {
    if (!issueTargetId || !issueDetail.trim()) return;
    mockStore.reportIssue(issueTargetId, issueDetail.trim());
    setIssueTargetId(null);
    fetchData();
    setHotlineOpen(true);
  }

  if (!checked) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  if (!hasAccess) {
    return <p className={ui.muted}>게스트만 이용할 수 있는 화면입니다.</p>;
  }

  const filteredReservations = reservations.filter(
    (r) => statusFilter === 'ALL' || r.status === statusFilter
  );

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
        <h1 className={ui.pageTitle}>내 이용권</h1>
        <p className={ui.muted}>예약 현황을 확인하고 현장에서 입·출차를 처리하세요.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto text-xs">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 font-medium transition ${
              statusFilter === opt.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredReservations.map((r) => {
          const space = spacesById[r.space_id];
          const canCheckIn = r.status === 'CONFIRMED' && !r.is_checked_in;
          const canCheckOut = r.status === 'CONFIRMED' && r.is_checked_in && !r.is_checked_out;
          const canReportIssue = r.status === 'CONFIRMED';

          return (
            <div key={r.reservation_id} className={ui.card}>
              <span className={ui.badge(STATUS_STYLE[r.status])}>{STATUS_LABEL[r.status]}</span>
              <p className="mt-2 text-sm font-semibold text-slate-900">{space?.address}</p>
              {space?.entry_notes && <p className={ui.hint}>유의사항: {space.entry_notes}</p>}
              <p className="text-sm text-slate-600">차량번호: {r.vehicle_plate_number}</p>

              {r.status === 'ISSUE_REPORTED' && (
                <p className="mt-2 text-sm font-medium text-rose-600">현장 이슈 확인 중입니다</p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!canCheckIn}
                  onClick={() =>
                    setConfirmAction({
                      message: '입차 처리하시겠습니까?',
                      onConfirm: () => handleCheckIn(r.reservation_id),
                    })
                  }
                  className={`${ui.btnPrimary} flex-1 px-3 py-2 text-sm`}
                >
                  입차 확인 (O/X)
                </button>
                <button
                  type="button"
                  disabled={!canCheckOut}
                  onClick={() =>
                    setConfirmAction({
                      message: '출차 처리하시겠습니까?',
                      onConfirm: () => handleCheckOut(r.reservation_id),
                    })
                  }
                  className={`${ui.btnPrimary} flex-1 px-3 py-2 text-sm`}
                >
                  출차 확인 (O/X)
                </button>
              </div>

              {canReportIssue && (
                <button
                  type="button"
                  onClick={() => openIssueModal(r.reservation_id)}
                  className={`${ui.btnDangerGhost} mt-2 w-full`}
                >
                  현장 결함/진입 불가 신고
                </button>
              )}
            </div>
          );
        })}
        {filteredReservations.length === 0 && (
          <p className={ui.muted}>
            {reservations.length === 0 ? '예약 내역이 없습니다.' : '해당 상태의 예약이 없습니다.'}
          </p>
        )}
      </div>

      <Modal
        open={!!issueTargetId}
        title="현장 결함/진입 불가 신고"
        onClose={() => setIssueTargetId(null)}
        footer={null}
      >
        <div className="flex flex-col gap-3">
          <textarea
            value={issueDetail}
            onChange={(e) => setIssueDetail(e.target.value)}
            placeholder="예: 다른 차량이 자리에 주차되어 있습니다."
            className={ui.input}
            rows={4}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIssueTargetId(null)}
              className={`${ui.btnSecondary} flex-1`}
            >
              닫기
            </button>
            <button
              type="button"
              disabled={!issueDetail.trim()}
              onClick={submitIssue}
              className={`${ui.btnDanger} flex-1`}
            >
              신고 제출
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={hotlineOpen} title="비상 유선 연락처" onClose={() => setHotlineOpen(false)}>
        <div className="flex flex-col gap-2">
          {EMERGENCY_CONTACTS.map((contact) => (
            <div key={contact.phone} className="flex items-center justify-between">
              <span>{contact.label}: {contact.phone}</span>
              <a href={`tel:${contact.phone}`} className={`${ui.btnSecondary} rounded-full`}>
                전화 걸기
              </a>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={!!confirmAction}
        title="확인"
        onClose={() => setConfirmAction(null)}
        footer={
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmAction(null)}
              className={`${ui.btnSecondary} flex-1`}
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                confirmAction?.onConfirm();
                setConfirmAction(null);
              }}
              className={`${ui.btnPrimary} flex-1`}
            >
              확인
            </button>
          </div>
        }
      >
        {confirmAction?.message}
      </Modal>
    </div>
  );
}
