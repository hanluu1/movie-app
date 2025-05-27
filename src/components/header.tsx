'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HomeIcon, PlusIcon } from '@heroicons/react/16/solid';

export function Header ({
  showSearchIcon = true,
  showSearch,
}: {
  showSearchIcon?: boolean;
  showSearch?: () => void;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-5 bg-gray-900 border-b border-gray-700 shadow-md">
      <div
        className="text-3xl font-bold text-white z-10"
      >
        ReelEmotions
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex gap-6">
        <Link href="/">
          <HomeIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
        </Link>
        <Link href="/create-post">
          <PlusIcon className="h-7 w-7 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
        </Link>
        {showSearchIcon && (
          <MagnifyingGlassIcon
            className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition"
            onClick={showSearch}
          />
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="z-10 text-gray-300 hover:text-red-400 transition"
      >
        Sign out
      </button>
    </header>
  );
}
