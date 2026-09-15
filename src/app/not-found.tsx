import Link from 'next/link';
import { Header } from '@/components/layout';

export default function NotFound () {
  return (
    <div className="font-dm-sans min-h-screen bg-[#FAF7F1] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-4xl">🎬</p>
        <h2 className="font-plus-jakarta font-extrabold text-xl text-[#172526]">Page not found</h2>
        <p className="text-[#6F8C88] text-sm max-w-sm">We couldn&apos;t find what you were looking for.</p>
        <Link
          href="/discover"
          className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#2A4649] transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
