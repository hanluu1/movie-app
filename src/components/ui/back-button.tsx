'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function BackButton () {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7E6E] hover:text-[#EEEAE2] transition-colors mb-6"
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Back
    </button>
  );
}
