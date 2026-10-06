import { Header } from '@/components/layout';

export default function Loading () {
  return (
    <div className="font-dm-sans min-h-screen bg-[#161210] flex flex-col">
      <Header variant="dark" />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2A2520] border-t-[#C8956A] animate-spin" />
        <p className="text-[#8C7E6E] text-sm">Loading…</p>
      </div>
    </div>
  );
}
