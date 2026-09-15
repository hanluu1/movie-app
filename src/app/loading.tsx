import { Header } from '@/components/layout';

export default function Loading () {
  return (
    <div className="font-dm-sans min-h-screen bg-[#FAF7F1] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8EEEA] border-t-[#2A4649] animate-spin" />
        <p className="text-[#6F8C88] text-sm">Loading…</p>
      </div>
    </div>
  );
}
