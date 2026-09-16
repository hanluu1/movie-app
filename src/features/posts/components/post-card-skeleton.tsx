export function PostCardSkeleton () {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 w-full animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-stone-200 flex-shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-24 bg-stone-200 rounded-full" />
          <div className="h-3 w-16 bg-stone-100 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 w-20 bg-stone-200 rounded-full" />
          <div className="h-4 w-3/4 bg-stone-200 rounded-full" />
          <div className="h-3 w-full bg-stone-100 rounded-full" />
          <div className="h-3 w-5/6 bg-stone-100 rounded-full" />
        </div>
        <div className="w-14 h-20 rounded-lg bg-stone-200 flex-shrink-0" />
      </div>
    </div>
  );
}
