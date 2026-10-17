'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SignInPromptProps {
  isOpen: boolean;
  onClose: () => void;
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0D0B09] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden border border-[#1A1410]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 flex items-start justify-between border-b border-[#1A1410]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-0.5">Members only</p>
            <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Join the conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C7E6E] hover:text-[#EEEAE2] hover:bg-[#1E1B18] transition-all"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-3">
          <p className="text-sm text-[#C8B8A2] leading-relaxed mb-6">
            Sign in to {action || 'join the conversation'} and connect with people who love films the way you do.
          You can browse without an account.
          </p>

          <div className="flex flex-row gap-3">
            <button
              onClick={goToLogin}
              className="w-full py-3 rounded-xl font-semibold text-sm text-[#C8B8A2] bg-[#1A1714] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5"
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold text-sm text-[#0A0908] bg-[#C8956A] border border-[#2A2520] hover:bg-[#1E1B18] transition-all"
            >
              Join Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
