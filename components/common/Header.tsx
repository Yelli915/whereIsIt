'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSession, clearSessionCache, type ClientSession } from '@/lib/client-session';
import { useMounted } from '@/lib/useMounted';

export default function Header() {
  const mounted = useMounted();
  const [session, setSession] = useState<ClientSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchSession().then((s) => {
      setSession(s);
      setChecked(true);
    });
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    clearSessionCache();
    window.location.href = '/login';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900">내자리 어딨냐</span>
        </div>

        <div className="flex items-center gap-3">
          {mounted && checked && session && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">
                {session.name}
                {session.role_type === 'ADMIN' && ' (관리자)'}
              </span>
              <button type="button" onClick={logout} className="text-xs font-medium text-slate-400 hover:text-slate-700">
                로그아웃
              </button>
            </div>
          )}

          {mounted && checked && !session && (
            <div className="flex items-center gap-2 text-sm">
              <Link href="/login" className="font-medium text-slate-700 hover:text-slate-900">
                로그인
              </Link>
              <Link href="/signup" className="font-medium text-slate-400 hover:text-slate-700">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
