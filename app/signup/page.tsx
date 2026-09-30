'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, errorMessage } from '@/lib/api-client';
import { ui } from '@/lib/ui';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/auth/signup', 'POST', {
        name,
        phone_number,
        password,
        vehicle_plate_number: vehiclePlateNumber,
        vehicle_model: vehicleModel,
      });
      // 가입 즉시 로그인됨. 전체 새로고침으로 세션 캐시 초기화
      window.location.href = '/';
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <h1 className={ui.pageTitle}>회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className={ui.input} required />
        <input
          value={phone_number}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          autoComplete="username"
          placeholder="휴대폰 번호 (예: 01012345678)"
          className={ui.input}
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="비밀번호 (8자 이상)"
          className={ui.input}
          required
        />
        <input
          value={vehiclePlateNumber}
          onChange={(e) => setVehiclePlateNumber(e.target.value)}
          placeholder="차량번호 (예: 12가3456, 선택)"
          className={ui.input}
        />
        <input
          value={vehicleModel}
          onChange={(e) => setVehicleModel(e.target.value)}
          placeholder="차종 (예: 아반떼, 선택)"
          className={ui.input}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={submitting} className={ui.btnPrimary}>
          {submitting ? '가입 중...' : '가입하기'}
        </button>
      </form>
      <p className={ui.muted}>
        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-slate-700 underline">로그인</Link>
      </p>
    </div>
  );
}
