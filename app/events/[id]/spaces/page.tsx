'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockStore, SEED_IDS } from '@/lib/mock-store';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { getCachedSession } from '@/lib/client-session';
import { ui, badgeTone } from '@/lib/ui';
import Modal from '@/components/common/Modal';
import type { Event, EventParkingSpace } from '@/types';

const AGREEMENT_TEXT =
  '본 상품은 행사 한정 단기 대여 공간으로 예약 확정 후 단순 변심에 의한 취소 및 환불이 전면 불가합니다. 단, 현장 무단 점유나 진입 불가 등 현장 결함 시 관리자 유선 확인을 통해 100% 전액 환불됩니다.';

export default function EventSpacesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { checked, hasAccess } = useRoleGuard(SEED_IDS.GUEST);
  const [event, setEvent] = useState<Event | null>(null);
  const [spaces, setSpaces] = useState<EventParkingSpace[]>([]);
  const [reservedSpaceIds, setReservedSpaceIds] = useState<Set<string>>(new Set());
  const [selectedSpace, setSelectedSpace] = useState<EventParkingSpace | null>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [confirmPay, setConfirmPay] = useState(false);

  function fetchData() {
    const ev = mockStore.getEventById(params.id) ?? null;
    const approvedSpaces = mockStore.getApprovedSpacesByEvent(params.id);
    setEvent(ev);
    setSpaces(approvedSpaces);
    setReservedSpaceIds(
      new Set(
        approvedSpaces
          .filter((s) => mockStore.getActiveReservationBySpace(s.space_id))
          .map((s) => s.space_id)
      )
    );
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const reservationOpenForEvent = event?.status === 'UPCOMING';

  function openSpace(space: EventParkingSpace) {
    if (!reservationOpenForEvent || reservedSpaceIds.has(space.space_id)) return;
    setSelectedSpace(space);
    setPlateNumber(mockStore.getUserById(getCachedSession()?.user_id ?? '')?.vehicle_plate_number ?? '');
    setAgreed(false);
    setError('');
  }

  function closeModal() {
    setSelectedSpace(null);
    setConfirmPay(false);
  }

  function handlePay() {
    if (!selectedSpace) return;
    if (!plateNumber.trim()) {
      setError('차량번호를 입력해주세요.');
      return;
    }
    try {
      mockStore.createReservation({
        space_id: selectedSpace.space_id,
        guest_id: getCachedSession()?.user_id ?? '',
        vehicle_plate_number: plateNumber.trim(),
      });
      closeModal();
      router.push('/reservations/mine');
    } catch (e) {
      setError(e instanceof Error ? e.message : '예약에 실패했습니다.');
    }
  }

  if (!checked) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  if (!hasAccess) {
    return <p className={ui.muted}>게스트만 이용할 수 있는 화면입니다.</p>;
  }

  if (!event) {
    return <p className={ui.muted}>존재하지 않는 행사입니다.</p>;
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
        <h1 className={ui.pageTitle}>{event.name}</h1>
        <p className={ui.muted}>도보 시간이 짧은 순서로 정렬된 승인 공간 목록입니다.</p>
      </div>

      {!reservationOpenForEvent && (
        <div className={`${ui.badge(badgeTone.danger)} px-3 py-2 text-sm`}>
          신규 예약이 마감된 행사입니다.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {spaces.map((space) => {
          const closed = reservedSpaceIds.has(space.space_id);
          const disabled = !reservationOpenForEvent || closed;
          return (
            <button
              key={space.space_id}
              type="button"
              disabled={disabled}
              onClick={() => openSpace(space)}
              className={`${ui.cardInteractive} flex gap-3 ${disabled ? 'cursor-not-allowed opacity-50 hover:border-slate-200 hover:shadow-sm' : ''}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.photo_url}
                alt="현장 사진"
                className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className={ui.badge(badgeTone.info)}>도보 {space.walking_minutes}분</span>
                  {closed && <span className={ui.badge(badgeTone.neutral)}>예약 마감</span>}
                </div>
                <span className="text-sm font-semibold text-slate-900">{space.address}</span>
                <span className="text-sm text-slate-500">{space.price.toLocaleString()}원</span>
                {space.entry_notes && (
                  <span className={ui.hint}>유의사항: {space.entry_notes}</span>
                )}
              </div>
            </button>
          );
        })}
        {spaces.length === 0 && <p className={ui.muted}>현재 노출 가능한 공간이 없습니다.</p>}
      </div>

      <Modal open={!!selectedSpace} title="예약 및 결제" onClose={closeModal} footer={null}>
        {selectedSpace && (
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedSpace.photo_url}
              alt="현장 사진"
              className="h-32 w-full rounded-lg border border-slate-200 object-cover"
            />
            <p className="text-sm text-slate-700">도보 {selectedSpace.walking_minutes}분</p>
            <p className="text-sm text-slate-700">{selectedSpace.address}</p>
            {selectedSpace.entry_notes && (
              <p className={ui.hint}>유의사항: {selectedSpace.entry_notes}</p>
            )}
            <p className="text-base font-semibold text-slate-900">
              {selectedSpace.price.toLocaleString()}원
            </p>

            <label className="flex flex-col gap-1">
              <span className={ui.label}>차량번호</span>
              <input
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="예: 12가3456"
                className={ui.input}
              />
            </label>

            <label className="flex items-start gap-2 text-sm text-slate-500">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="leading-relaxed">{AGREEMENT_TEXT}</span>
            </label>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex gap-2">
              <button type="button" onClick={closeModal} className={`${ui.btnSecondary} flex-1`}>
                닫기
              </button>
              <button
                type="button"
                disabled={!agreed}
                onClick={() => setConfirmPay(true)}
                className={`${ui.btnPrimary} flex-1`}
              >
                {selectedSpace.price.toLocaleString()}원 결제하기
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={confirmPay}
        title="결제 확인"
        onClose={() => setConfirmPay(false)}
        footer={
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmPay(false)}
              className={`${ui.btnSecondary} flex-1`}
            >
              취소
            </button>
            <button type="button" onClick={handlePay} className={`${ui.btnPrimary} flex-1`}>
              결제하기
            </button>
          </div>
        }
      >
        {selectedSpace && `${selectedSpace.price.toLocaleString()}원을 결제하시겠습니까? 결제 후 단순 변심 취소·환불은 불가합니다.`}
      </Modal>
    </div>
  );
}
