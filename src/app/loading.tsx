export default function Loading () {
  return (
    <div className="font-dm-sans relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-[#0D0A08]">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#F5A623]/15 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />
      <div className="relative flex gap-2" aria-hidden="true">
        {['#FFD83D', '#FF4D9D', '#9B6BFF'].map((c, i) => (
          <span
            key={c}
            className="h-3 w-3 animate-bounce rounded-full motion-reduce:animate-none"
            style={{ backgroundColor: c, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <p className="relative text-sm font-semibold text-[#B8AA98]">Rolling the film…</p>
    </div>
  );
}
