import { Header } from '@/components/layout';

export default function Loading () {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-10 h-10 rounded-full border-4 border-stone-200 border-t-red-600 animate-spin" />
        <p className="text-stone-400 text-sm">Loading…</p>
      </div>
    </div>
  );
}
