export const ui = {
  card: 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
  cardInteractive:
    'rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md',
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900',
  label: 'text-sm font-medium text-slate-700',
  hint: 'text-sm text-slate-400',
  muted: 'text-sm text-slate-400',
  pageTitle: 'text-xl font-semibold tracking-tight text-slate-900',
  btnPrimary:
    'rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400',
  btnSecondary:
    'rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40',
  btnDanger:
    'rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400',
  btnDangerGhost:
    'rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50',
  linkText: 'text-sm font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900',
  badge: (className: string) =>
    `inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`,
} as const;

export const badgeTone = {
  info: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  active: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  neutral: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
} as const;
