'use client';

import { useState } from 'react';
import { login, clearSessionCache, QUICK_ACCOUNTS } from '@/lib/client-session';
import { ui } from '@/lib/ui';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);

  async function handleQuickLogin(account: (typeof QUICK_ACCOUNTS)[number]) {
    setError('');
    setLoadingLabel(account.label);
    const session = await login(account.phone_number, account.password);
    if (!session) {
      setError('로그인에 실패했습니다.');
      setLoadingLabel(null);
      return;
    }
    clearSessionCache();
    window.location.href = session.role_type === 'ADMIN' ? '/admin' : '/';
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className={ui.pageTitle}>역할 선택</h1>
        <p className={ui.muted}>Phase 0 프로토타입입니다. 역할을 선택하면 바로 로그인됩니다.</p>
      </div>
      <div className="flex flex-col gap-3">
        {QUICK_ACCOUNTS.map((account) => (
          <button
            key={account.user_id}
            type="button"
            onClick={() => handleQuickLogin(account)}
            disabled={loadingLabel !== null}
            className={ui.btnPrimary}
          >
            {loadingLabel === account.label ? '이동 중...' : `${account.label}로 시작하기`}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}
