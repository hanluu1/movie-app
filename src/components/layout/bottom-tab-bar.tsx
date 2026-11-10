'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon, FilmIcon, PlusIcon, FaceSmileIcon, UserIcon,
} from '@heroicons/react/24/outline';

interface BottomTabBarProps {
  onYap: () => void;
  // When provided, the Mood tab runs this (e.g. opens a feeling sheet) instead of linking away
  onMood?: () => void;
  moodActive?: boolean;
}

const tabBase = 'press flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold';

export function BottomTabBar ({ onYap, onMood, moodActive = false }: BottomTabBarProps) {
  const pathname = usePathname();
  const tone = (active: boolean) => (active ? 'text-[#F5A623]' : 'text-[#B8AA98]');

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0D0A08]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-end px-2">
        <Link href="/community" className={`${tabBase} ${tone(pathname === '/community')}`}>
          <HomeIcon className="h-6 w-6" />
          Home
        </Link>
        <Link href="/discover" className={`${tabBase} ${tone(pathname === '/discover')}`}>
          <FilmIcon className="h-6 w-6" />
          Discover
        </Link>

        <button type="button" onClick={onYap} aria-label="New yap" className="press flex flex-1 justify-center pb-2">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#0D0A08]"
            style={{
              background: 'linear-gradient(135deg, #FFD83D, #F5A623 60%, #FF5A36)',
              boxShadow: '0 0 20px rgba(245,166,35,0.55)',
            }}
          >
            <PlusIcon className="h-7 w-7" strokeWidth={2.5} />
          </span>
        </button>

        {onMood ? (
          <button type="button" onClick={onMood} aria-pressed={moodActive} className={`${tabBase} ${tone(moodActive)}`}>
            <FaceSmileIcon className="h-6 w-6" />
            Mood
          </button>
        ) : (
          <Link href="/discover" className={`${tabBase} ${tone(false)}`}>
            <FaceSmileIcon className="h-6 w-6" />
            Mood
          </Link>
        )}

        <Link href="/my-profiles" className={`${tabBase} ${tone(pathname === '/my-profiles')}`}>
          <UserIcon className="h-6 w-6" />
          Profile
        </Link>
      </div>
    </nav>
  );
}
