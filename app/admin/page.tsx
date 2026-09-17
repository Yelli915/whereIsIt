'use client';

import { useEffect, useMemo, useState } from 'react';
import { mockStore, SEED_IDS } from '@/lib/mock-store';
import { useRoleGuard } from '@/lib/useRoleGuard';
import { ui, badgeTone } from '@/lib/ui';
import Modal from '@/components/common/Modal';
import type { Event, EventParkingSpace, Reservation, ReservationStatus } from '@/types';

type Tab = 'events' | 'spaces' | 'reservations';

const EVENT_STATUS_LABEL: Record<Event['status'], string> = {
  UPCOMING: '예정',
  ONGOING: '진행중',
  CLOSED: '종료',
};

const EVENT_STATUS_STYLE: Record<Event['status'], string> = {
  UPCOMING: badgeTone.info,
  ONGOING: badgeTone.active,
  CLOSED: badgeTone.neutral,
};

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  CONFIRMED: '확정',
  ISSUE_REPORTED: '이슈 접수',
  CANCELLED: '취소',
  COMPLETED: '이용 완료',
};

const RESERVATION_STATUS_STYLE: Record<ReservationStatus, string> = {
  CONFIRMED: badgeTone.info,
  ISSUE_REPORTED: badgeTone.danger,
  CANCELLED: badgeTone.neutral,
  COMPLETED: badgeTone.success,
};

const FILTER_OPTIONS: { value: 'ALL' | ReservationStatus; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'CONFIRMED', label: 'CONFIRMED' },
  { value: 'ISSUE_REPORTED', label: 'ISSUE_REPORTED' },
  { value: 'CANCELLED', label: 'CANCELLED' },
  { value: 'COMPLETED', label: 'COMPLETED' },
];

const TABS: { key: Tab; label: string }[] = [
  { key: 'events', label: '행사 관리' },
  { key: 'spaces', label: '공간 승인' },
  { key: 'reservations', label: '예약 현황' },
];

export default function AdminPage() {
  const { checked, hasAccess } = useRoleGuard(SEED_IDS.ADMIN);
  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [spaces, setSpaces] = useState<EventParkingSpace[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [toastMessage, setToastMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ message: string; onConfirm: () => void } | null>(
    null
  );
  // 탭 1: 신규 행사 등록 폼
  const [name, setName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');

  // 탭 1: 행사 메타정보 수정 모달
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editVenueName, setEditVenueName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStartDatetime, setEditStartDatetime] = useState('');
  const [editEndDatetime, setEditEndDatetime] = useState('');

  // 탭 3: 필터 및 종결 모달
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('ALL');
  const [eventFilter, setEventFilter] = useState<'ALL' | string>('ALL');
  const [detailTargetId, setDetailTargetId] = useState<string | null>(null);
  const [resolveStatus, setResolveStatus] = useState<'CANCELLED' | 'COMPLETED'>('COMPLETED');
  const [isRefunded, setIsRefunded] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  function fetchAll() {
    setEvents(mockStore.getEvents());
    setSpaces(mockStore.getSpaces());
    setReservations(mockStore.getReservations());
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const pendingSpaces = useMemo(() => spaces.filter((s) => s.status === 'PENDING'), [spaces]);

  const reservationRows = useMemo(() => {
    return reservations
      .map((r) => {
        const space = spaces.find((s) => s.space_id === r.space_id);
        const event = space ? events.find((e) => e.event_id === space.event_id) : undefined;
        return { reservation: r, space, event };
      })
      .filter((row) => statusFilter === 'ALL' || row.reservation.status === statusFilter)
      .filter((row) => eventFilter === 'ALL' || row.event?.event_id === eventFilter);
  }, [reservations, spaces, events, statusFilter, eventFilter]);

  function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !venueName.trim() || !address.trim() || !startDatetime || !endDatetime) return;
    mockStore.createEvent({
      name: name.trim(),
      venue_name: venueName.trim(),
      address: address.trim(),
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      created_by: SEED_IDS.ADMIN,
    });
    setName('');
    setVenueName('');
    setAddress('');
    setStartDatetime('');
    setEndDatetime('');
    fetchAll();
  }

  function openEditModal(ev: Event) {
    setEditTargetId(ev.event_id);
    setEditName(ev.name);
    setEditVenueName(ev.venue_name);
    setEditAddress(ev.address);
    setEditStartDatetime(ev.start_datetime);
    setEditEndDatetime(ev.end_datetime);
  }

  function submitEditEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!editTargetId) return;
    if (!editName.trim() || !editVenueName.trim() || !editAddress.trim() || !editStartDatetime || !editEndDatetime) {
      return;
    }
    mockStore.updateEvent(editTargetId, {
      name: editName.trim(),
      venue_name: editVenueName.trim(),
      address: editAddress.trim(),
      start_datetime: editStartDatetime,
      end_datetime: editEndDatetime,
    });
    setEditTargetId(null);
    fetchAll();
  }

  function handleBlockReservations(eventId: string) {
    mockStore.blockEventReservations(eventId);
    fetchAll();
  }

  function handleCloseEvent(eventId: string) {
    const changed = mockStore.closeEvent(eventId);
    fetchAll();
    setToastMessage(`행사가 종료되었습니다. 미출차 ${changed}건이 이용완료로 일괄 전환되었습니다.`);
  }

  function handleApproveSpace(spaceId: string) {
    mockStore.approveSpace(spaceId);
    fetchAll();
  }

  function handleRejectSpace(spaceId: string) {
    mockStore.rejectSpace(spaceId);
    fetchAll();
  }

  function openDetailModal(r: Reservation) {
    setDetailTargetId(r.reservation_id);
    if (r.status === 'ISSUE_REPORTED') {
      setResolveStatus('COMPLETED');
      setIsRefunded(r.is_refunded);
      setAdminNote('');
    }
  }

  function submitResolve() {
    if (!detailTargetId) return;
    mockStore.resolveReservation(detailTargetId, {
      status: resolveStatus,
      is_refunded: isRefunded,
      adminNote,
    });
    setDetailTargetId(null);
    fetchAll();
  }

  function handleConfirmPayout(reservationId: string) {
    mockStore.confirmPayout(reservationId);
    fetchAll();
  }

  if (!checked) {
    return <p className={ui.muted}>불러오는 중...</p>;
  }

  if (!hasAccess) {
    return <p className={ui.muted}>관리자만 이용할 수 있는 화면입니다.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className={ui.pageTitle}>관리자 대시보드</h1>

      <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-all ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="flex flex-col gap-4">
          <form onSubmit={handleCreateEvent} className={`${ui.card} flex flex-col gap-3`}>
            <span className="text-sm font-semibold text-slate-900">신규 행사 등록</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="행사명"
              className={ui.input}
            />
            <input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="행사장 명칭"
              className={ui.input}
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="행사장 주소"
              className={ui.input}
            />
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className={ui.hint}>시작 일시</span>
                <input
                  type="datetime-local"
                  value={startDatetime}
                  onChange={(e) => setStartDatetime(e.target.value)}
                  className={ui.input}
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className={ui.hint}>종료 일시</span>
                <input
                  type="datetime-local"
                  value={endDatetime}
                  onChange={(e) => setEndDatetime(e.target.value)}
                  className={ui.input}
                />
              </label>
            </div>
            <button type="submit" className={ui.btnPrimary}>
              등록 (UPCOMING)
            </button>
          </form>

          <div className="grid grid-cols-2 gap-3">
            {events.map((ev) => (
              <div key={ev.event_id} className={ui.card}>
                <div className="flex items-start justify-between gap-2">
                  <span className={ui.badge(EVENT_STATUS_STYLE[ev.status])}>
                    {EVENT_STATUS_LABEL[ev.status]}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(ev)}
                    className="shrink-0 text-sm font-medium text-slate-500 hover:text-slate-900"
                  >
                    수정
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{ev.name}</p>
                <p className={ui.hint}>{ev.venue_name}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={ev.status !== 'UPCOMING'}
                    onClick={() =>
                      setConfirmAction({
                        message: '신규 예약을 마감하시겠습니까?',
                        onConfirm: () => handleBlockReservations(ev.event_id),
                      })
                    }
                    className={`${ui.btnSecondary} flex-1 py-2`}
                  >
                    신규 예약 마감
                  </button>
                  <button
                    type="button"
                    disabled={ev.status !== 'ONGOING'}
                    onClick={() =>
                      setConfirmAction({
                        message: '행사를 공식 종료하시겠습니까?',
                        onConfirm: () => handleCloseEvent(ev.event_id),
                      })
                    }
                    className={`${ui.btnDanger} flex-1 px-3 py-2 text-sm`}
                  >
                    행사 공식 종료
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'spaces' && (
        <div className="grid grid-cols-2 gap-3">
          {pendingSpaces.length === 0 && <p className={ui.muted}>심사 대기 중인 공간이 없습니다.</p>}
          {pendingSpaces.map((space) => (
            <div key={space.space_id} className={ui.card}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.photo_url}
                alt="현장 사진"
                className="h-32 w-full rounded-lg border border-slate-200 object-cover"
              />
              <p className="mt-3 text-sm font-semibold text-slate-900">{space.address}</p>
              <p className="text-sm text-slate-500">
                도보 {space.walking_minutes}분 · {space.price.toLocaleString()}원
              </p>
              {space.entry_notes && <p className={ui.hint}>유의사항: {space.entry_notes}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      message: '이 공간을 승인하시겠습니까?',
                      onConfirm: () => handleApproveSpace(space.space_id),
                    })
                  }
                  className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  승인
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      message: '이 공간을 반려하시겠습니까?',
                      onConfirm: () => handleRejectSpace(space.space_id),
                    })
                  }
                  className={`${ui.btnSecondary} flex-1 py-2`}
                >
                  반려
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reservations' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
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
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className={`${ui.input} w-auto shrink-0`}
            >
              <option value="ALL">전체 행사</option>
              {events.map((ev) => (
                <option key={ev.event_id} value={ev.event_id}>
                  {ev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-10">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[8%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                  <col className="w-[8%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[6%]" />
                  <col className="w-[12%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-2.5 font-medium">예약ID</th>
                    <th className="px-4 py-2.5 font-medium">행사명</th>
                    <th className="px-4 py-2.5 font-medium">차량번호</th>
                    <th className="px-4 py-2.5 font-medium">주소</th>
                    <th className="px-4 py-2.5 font-medium">금액</th>
                    <th className="px-4 py-2.5 text-center font-medium">상태</th>
                    <th className="px-4 py-2.5 text-center font-medium">입차</th>
                    <th className="px-4 py-2.5 text-center font-medium">출차</th>
                    <th className="px-4 py-2.5 text-center font-medium">환불</th>
                    <th className="px-4 py-2.5 font-medium">정산</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationRows.map(({ reservation: r, space, event }) => {
                    const resolvable = r.status === 'ISSUE_REPORTED';
                    return (
                      <tr
                        key={r.reservation_id}
                        onClick={() => openDetailModal(r)}
                        className={`h-14 cursor-pointer border-b border-slate-100 text-slate-700 transition last:border-0 ${
                          resolvable ? 'bg-rose-50 hover:bg-rose-100' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="truncate px-4 py-2.5 font-mono text-sm text-slate-400">
                          {r.reservation_id.slice(0, 8)}
                        </td>
                        <td className="truncate px-4 py-2.5">{event?.name ?? '-'}</td>
                        <td className="truncate px-4 py-2.5">{r.vehicle_plate_number}</td>
                        <td className="truncate px-4 py-2.5">{space?.address ?? '-'}</td>
                        <td className="truncate px-4 py-2.5">{r.payment_amount.toLocaleString()}</td>
                        <td className="truncate px-4 py-2.5 text-center">
                          <span className={ui.badge(RESERVATION_STATUS_STYLE[r.status])}>
                            {RESERVATION_STATUS_LABEL[r.status]}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">{r.is_checked_in ? 'O' : 'X'}</td>
                        <td className="px-4 py-2.5 text-center">{r.is_checked_out ? 'O' : 'X'}</td>
                        <td className="px-4 py-2.5 text-center">{r.is_refunded ? 'O' : 'X'}</td>
                        <td className="px-4 py-2.5">{r.is_payout_done ? 'O' : 'X'}</td>
                      </tr>
                    );
                  })}
                  {reservationRows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-6 text-center text-slate-400">
                        해당 조건의 예약이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!detailTargetId}
        title="예약 상세 정보"
        onClose={() => setDetailTargetId(null)}
        footer={null}
        maxWidthClassName="max-w-2xl"
      >
        {(() => {
          const row = reservationRows.find((r) => r.reservation.reservation_id === detailTargetId);
          if (!row) return null;
          const { reservation: r, space, event } = row;
          const needsResolve = r.status === 'ISSUE_REPORTED';
          const payoutReady = r.status === 'COMPLETED' && !r.is_refunded && !r.is_payout_done;
          const section = (label: string, rows: [string, React.ReactNode][]) => (
            <div className="rounded-lg bg-slate-50 p-3">
              <span className="text-xs font-semibold text-slate-400">{label}</span>
              <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {rows.map(([dt, dd]) => (
                  <div key={dt} className="contents">
                    <dt className="text-slate-400">{dt}</dt>
                    <dd className="break-all text-slate-900">{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
          return (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {section('기본 정보', [
                  ['예약 ID', r.reservation_id],
                  ['행사명', event?.name ?? '-'],
                  [
                    '상태',
                    <span className={ui.badge(RESERVATION_STATUS_STYLE[r.status])}>
                      {RESERVATION_STATUS_LABEL[r.status]}
                    </span>,
                  ],
                ])}
                {section('차량 · 공간', [
                  ['차량번호', r.vehicle_plate_number],
                  ['주소', space?.address ?? '-'],
                ])}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {section('결제', [['결제 금액', `${r.payment_amount.toLocaleString()}원`]])}
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-xs font-semibold text-slate-400">처리 현황</span>
                  <div className="mt-1.5 grid grid-cols-4 gap-2 text-center">
                    {[
                      ['입차', r.is_checked_in],
                      ['출차', r.is_checked_out],
                      ['환불', r.is_refunded],
                      ['정산', r.is_payout_done],
                    ].map(([label, done]) => (
                      <div key={label as string} className="flex flex-col gap-0.5">
                        <span className="text-slate-400">{label}</span>
                        <span className={done ? 'font-semibold text-slate-900' : 'text-slate-300'}>
                          {done ? 'O' : 'X'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {r.issue_note && (
                <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {r.issue_note}
                </pre>
              )}

              {needsResolve && (
                <div className="flex flex-col gap-3 border-t border-slate-200 pt-3">
                  <span className="text-sm font-semibold text-slate-900">관리자 수동 종결</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={resolveStatus === 'COMPLETED'}
                        onChange={() => setResolveStatus('COMPLETED')}
                        className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      COMPLETED
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-slate-700">
                      <input
                        type="radio"
                        checked={resolveStatus === 'CANCELLED'}
                        onChange={() => setResolveStatus('CANCELLED')}
                        className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      CANCELLED
                    </label>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={isRefunded}
                      onChange={(e) => setIsRefunded(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    환불 완료 처리
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="관리자 조치 메모"
                    className={ui.input}
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDetailTargetId(null)}
                  className={`${ui.btnSecondary} flex-1`}
                >
                  닫기
                </button>
                {payoutReady && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmAction({
                        message: '정산을 완료 처리하시겠습니까?',
                        onConfirm: () => handleConfirmPayout(r.reservation_id),
                      })
                    }
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    정산 이체 완료 처리
                  </button>
                )}
                {needsResolve && (
                  <button type="button" onClick={submitResolve} className={`${ui.btnPrimary} flex-1`}>
                    종결 처리
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!editTargetId} title="행사 정보 수정" onClose={() => setEditTargetId(null)} footer={null}>
        <form onSubmit={submitEditEvent} className="flex flex-col gap-3">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="행사명"
            className={ui.input}
          />
          <input
            value={editVenueName}
            onChange={(e) => setEditVenueName(e.target.value)}
            placeholder="행사장 명칭"
            className={ui.input}
          />
          <input
            value={editAddress}
            onChange={(e) => setEditAddress(e.target.value)}
            placeholder="행사장 주소"
            className={ui.input}
          />
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className={ui.hint}>시작 일시</span>
              <input
                type="datetime-local"
                value={editStartDatetime}
                onChange={(e) => setEditStartDatetime(e.target.value)}
                className={ui.input}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className={ui.hint}>종료 일시</span>
              <input
                type="datetime-local"
                value={editEndDatetime}
                onChange={(e) => setEditEndDatetime(e.target.value)}
                className={ui.input}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditTargetId(null)}
              className={`${ui.btnSecondary} flex-1`}
            >
              취소
            </button>
            <button type="submit" className={`${ui.btnPrimary} flex-1`}>
              저장
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!toastMessage} title="처리 완료" onClose={() => setToastMessage('')}>
        {toastMessage}
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
