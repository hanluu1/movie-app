export function PostCardSkeleton () {
  return (
    <div
      aria-hidden
      className="flex min-h-[240px] w-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"
    >
      {/* User + feeling chip */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <div className="skeleton h-3 w-24 rounded-full" />
            <div className="skeleton h-2.5 w-10 rounded-full" />
          </div>
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>

      {/* Show pill */}
      <div className="skeleton h-8 w-40 rounded-full" />

      {/* Yap text */}
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="skeleton h-5 w-full rounded-full" />
        <div className="skeleton h-5 w-5/6 rounded-full" />
        <div className="skeleton h-5 w-2/3 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="flex gap-1.5">
          <div className="skeleton h-8 w-14 rounded-full" />
          <div className="skeleton h-8 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}
