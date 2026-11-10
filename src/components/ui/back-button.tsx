'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function BackButton () {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="press mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] py-2 pl-3 pr-4 text-sm font-bold text-[#EEEAE2] backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Back
    </button>
  );
}
