'use client';

import Link from 'next/link';

export default function Error ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="font-dm-sans relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#0D0A08] px-5 text-center">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#FF5A36]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#9B6BFF]/20 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />
      <div className="relative flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
        <p className="text-6xl" aria-hidden="true">🫠</p>
        <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight text-[#EEEAE2]">
          Well, that <span className="shimmer-text">broke</span>
        </h2>
        <p className="text-sm text-[#B8AA98]">
          Something glitched on our end. Not you, promise. Try again?
        </p>
        <button
          onClick={reset}
          style={{ background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)' }}
          className="press rounded-full px-7 py-3 text-sm font-extrabold text-[#0D0A08] transition hover:brightness-110"
        >
          Try again
        </button>
        <Link href="/" className="text-sm font-semibold text-[#B8AA98] underline-offset-4 hover:text-[#EEEAE2] hover:underline">
          Take me home
        </Link>
      </div>
    </div>
  );
}
