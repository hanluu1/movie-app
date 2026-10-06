import Link from 'next/link';
import { FilmIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout';

export default function NotFound () {
  return (
    <div className="font-dm-sans min-h-screen bg-[#161210] flex flex-col">
      <Header variant="dark" />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <FilmIcon className="w-12 h-12 text-[#3A3530]" />
        <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Page not found</h2>
        <p className="text-[#8C7E6E] text-sm max-w-sm">We couldn&apos;t find what you were looking for.</p>
        <Link
          href="/feed"
          className="mt-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-[#0A0908] bg-[#C8956A] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
