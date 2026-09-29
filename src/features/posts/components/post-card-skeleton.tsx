export function PostCardSkeleton () {
  return (
    <div className="bg-[#111009] border border-[#1E1B18] rounded-2xl p-5 w-full flex flex-col gap-3">
      {/* User + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#1A1714] flex-shrink-0 animate-pulse" />
          <div className="h-3.5 w-24 bg-[#1A1714] rounded-full animate-pulse" />
        </div>
        <div className="h-3 w-12 bg-[#1A1714] rounded-full animate-pulse" />
      </div>

      {/* Reaction title */}
      <div className="h-4 w-3/4 bg-[#1A1714] rounded-full animate-pulse" />

      {/* Reaction content */}
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full bg-[#1A1714] rounded-full animate-pulse" />
        <div className="h-3 w-5/6 bg-[#1A1714] rounded-full animate-pulse" />
        <div className="h-3 w-2/3 bg-[#1A1714] rounded-full animate-pulse" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#1E1B18]">
        <div className="h-5 w-16 bg-[#1A1714] rounded-full mr-auto animate-pulse" />
        <div className="h-5 w-8 bg-[#1A1714] rounded-full animate-pulse" />
        <div className="h-5 w-8 bg-[#1A1714] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
