'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clearSessionCache } from '@/lib/client-session';
import { ui } from '@/lib/ui';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone_number,
        password,
        vehicle_plate_number: vehiclePlateNumber,
        vehicle_model: vehicleModel,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? '회원가입에 실패했습니다.');
      return;
    }
    clearSessionCache();
    router.push('/');
    router.refresh();
    window.location.reload();
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <h1 className={ui.pageTitle}>회원가입</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className={ui.input} required />
        <input
          value={phone_number}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호"
          className={ui.input}
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호 (4자 이상)"
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
        <button type="submit" className={ui.btnPrimary}>
          가입하기
        </button>
      </form>
      <p className={ui.muted}>
        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-slate-700 underline">로그인</Link>
      </p>
    </div>
  );
}
