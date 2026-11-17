'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const CTA_GRADIENT = 'linear-gradient(135deg,#A78BFA,#7C3AED 60%,#5B21B6)';

export const SignInPrompt = ({ isOpen, onClose, action }: SignInPromptProps) => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const goToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full overflow-hidden rounded-t-3xl border border-white/10 bg-[#07051A]/95 backdrop-blur-md sm:max-w-md sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#FF4D9D]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#9B6BFF]/20 blur-[100px]" />

        <div className="relative flex items-start justify-between px-6 pt-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">Members only</p>
            <h2 className="font-plus-jakarta text-2xl font-extrabold tracking-tight text-[#F1EEFF]">
              Join the <span className="shimmer-text">yap</span> 🗣️
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#B3A9D6] transition-all hover:text-[#F1EEFF]"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="relative px-6 pb-6 pt-3">
          <p className="mb-6 text-sm leading-relaxed text-[#B3A9D6]">
            Sign in to {action || 'join the conversation'} and tell everyone how it made you feel. You can browse without an account.
          </p>

          <div className="flex flex-row gap-3">
            <button
              onClick={goToLogin}
              className="press w-full rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-[#F1EEFF] backdrop-blur-md transition-all hover:bg-white/[0.08]"
            >
              Sign in
            </button>
            <button
              onClick={goToLogin}
              style={{ background: CTA_GRADIENT }}
              className="press w-full rounded-full py-3 text-sm font-extrabold text-white transition-all hover:brightness-110"
            >
              Join free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
