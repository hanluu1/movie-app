'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilmIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export function MobileNavTabs ({ dark = false }: { dark?: boolean }) {
  const pathname = usePathname();

  return (
    <div className={`sm:hidden flex justify-center py-3 ${dark ? 'bg-[#07051A]' : 'bg-[#FFFDF8]'}`}>
      <div className={`flex items-center gap-1 p-1 rounded-2xl border ${dark ? 'bg-[#110B2B] border-[#110B2B]' : 'bg-[#F1EEFF] border-[#D5CFF0]'}`}>
        <Link
          href="/discover"
          className={`flex items-center justify-center gap-1.5 min-w-[112px] px-3 h-9 rounded-xl text-xs font-semibold transition-all ${
            pathname === '/discover'
              ? 'bg-[#A78BFA] text-[#07051A] shadow-sm'
              : dark ? 'text-[#9A91C2] hover:text-[#F1EEFF]' : 'text-[#6F8C88] hover:text-[#172526]'
          }`}
        >
          <FilmIcon className="w-4 h-4 flex-shrink-0" />
          Discover
        </Link>
        <Link
          href="/community"
          className={`flex items-center justify-center gap-1.5 min-w-[112px] px-3 h-9 rounded-xl text-xs font-semibold transition-all ${
            pathname === '/community'
              ? 'bg-[#A78BFA] text-[#07051A] shadow-sm'
              : dark ? 'text-[#9A91C2] hover:text-[#F1EEFF]' : 'text-[#6F8C88] hover:text-[#172526]'
          }`}
        >
          <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
          Community
        </Link>
      </div>
    </div>
  );
}
