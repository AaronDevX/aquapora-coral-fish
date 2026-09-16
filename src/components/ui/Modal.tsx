'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Modal({ open, onClose, titleId, children, className }: {
  open: boolean; onClose: () => void; titleId: string; children: ReactNode; className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    className={cn('fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-inherit backdrop:bg-black/60 backdrop:backdrop-blur-sm', className)}>
    {open && children}
  </dialog>;
}
