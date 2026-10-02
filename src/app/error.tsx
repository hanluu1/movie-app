'use client';

import { Header } from '@/components/layout';

export default function Error ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="font-dm-sans min-h-screen bg-[#161210] flex flex-col">
      <Header variant="dark" />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">⚠️</p>
        <h2 className="font-plus-jakarta font-extrabold text-xl text-[#F2EDE4]">Something went wrong</h2>
        <p className="text-[#6A5E50] text-sm max-w-sm">
          An unexpected error occurred. You can try again, or head back to the feed.
        </p>
        <button
          onClick={reset}
          className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-[#0A0908] bg-[#C8956A] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
