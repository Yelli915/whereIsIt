'use client';

import { useEffect, useRef } from 'react';
import { ui } from '@/lib/ui';

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClassName = 'max-w-sm',
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`w-[90vw] ${maxWidthClassName} rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/30 backdrop:backdrop-blur-sm`}
    >
      <div className="flex flex-col gap-3 p-6">
        <span className="text-base font-semibold tracking-tight text-slate-900">{title}</span>
        <div className="text-sm leading-relaxed text-slate-600">{children}</div>
        {footer !== undefined ? (
          footer
        ) : (
          <button type="button" onClick={onClose} className={`${ui.btnPrimary} mt-2 w-full`}>
            확인
          </button>
        )}
      </div>
    </dialog>
  );
}
