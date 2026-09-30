'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, errorMessage } from '@/lib/api-client';
import { safeNextPath } from '@/lib/client-session';
import { ui } from '@/lib/ui';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { user } = await api('/auth/login', 'POST', { phone_number: phoneNumber, password });
      const next = new URLSearchParams(window.location.search).get('next');
      // 전체 새로고침으로 헤더 등 세션 캐시를 초기화
      window.location.href = safeNextPath(next, user.role_type === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <h1 className={ui.pageTitle}>로그인</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
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
          autoComplete="current-password"
          placeholder="비밀번호"
          className={ui.input}
          required
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={submitting} className={ui.btnPrimary}>
          {submitting ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <p className={ui.muted}>
        계정이 없으신가요? <Link href="/signup" className="font-medium text-slate-700 underline">회원가입</Link>
      </p>
    </div>
  );
}
