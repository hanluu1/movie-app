'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilmIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function MobileNavTabs ({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={`sm:hidden flex justify-center py-3 ${dark ? 'bg-[#0A0908]' : 'bg-[#FFFDF8]'}`}>
      <div className={`flex items-center p-1 rounded-full border ${dark ? 'bg-[#1A1612] border-[#2A2520]' : 'bg-[#EEEAE2] border-[#D8D4CC]'}`}>
        <Link
          href="/discover"
          className={`flex items-center justify-center w-10 h-8 rounded-full transition-all ${
            pathname === '/discover'
              ? 'bg-[#C8956A] text-[#0A0908] shadow-sm'
              : dark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:text-[#172526]'
          }`}
        >
          <FilmIcon className="w-4 h-4" />
        </Link>
        <Link
          href="/feed"
          className={`flex items-center justify-center w-10 h-8 rounded-full transition-all ${
            pathname === '/feed'
              ? 'bg-[#C8956A] text-[#0A0908] shadow-sm'
              : dark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:text-[#172526]'
          }`}
        >
          <GlobeAltIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
