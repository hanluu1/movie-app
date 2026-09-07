'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
  /** What the visitor was trying to do, e.g. 'like this post'. */
  action?: string;
}

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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[420px] overflow-hidden shadow-[0_24px_48px_rgba(28,25,23,0.18)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-10 pb-8 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="font-archivo-black text-[1.5rem] tracking-tight mb-3 text-stone-900">
            Join the conversation
          </h2>
          <p className="text-stone-600 leading-relaxed text-[0.95rem]">
            Sign in to {action || 'join in'} and find people who see films the way you do.
            Browsing stays free — no account needed to read.
          </p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-3">
          <button
            onClick={goToLogin}
            className="w-full py-3.5 text-white font-bold rounded-xl text-[0.95rem] transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-red-600 to-orange-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)]"
          >
            Sign In
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 border-2 border-stone-200 bg-white rounded-xl font-semibold text-[0.9rem] text-stone-600 transition-all duration-300 hover:border-stone-300 hover:bg-stone-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
