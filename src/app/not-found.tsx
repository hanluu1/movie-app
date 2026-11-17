import Link from 'next/link';

export default function NotFound () {
  return (
    <div className="font-dm-sans relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#07051A] px-5 text-center">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#3D8BFF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#FF4D9D]/20 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />
      <div className="relative flex max-w-sm flex-col items-center gap-4">
        <p className="font-plus-jakarta text-[7rem] font-extrabold leading-none tracking-tighter shimmer-text">404</p>
        <h2 className="font-plus-jakarta text-2xl font-extrabold tracking-tight text-[#F1EEFF]">
          This scene got cut 🎬
        </h2>
        <p className="text-sm text-[#B3A9D6]">We looked everywhere. The page ghosted us.</p>
        <Link
          href="/community"
          style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED 60%,#5B21B6)' }}
          className="press mt-2 rounded-full px-7 py-3 text-sm font-extrabold text-white transition hover:brightness-110"
        >
          Back to the feed
        </Link>
      </div>
    </div>
  );
}
