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
    <div className="relative flex items-center justify-between px-4 py-5 text-black bg-[#cfcfcf]">
      <Link
        href="/"
        className="text-3xl font-bold text-gray-600 cursor-pointer z-10"
      >
        ReelEmotions
      </Link>

      <div className="absolute left-1/2 -translate-x-1/2 flex gap-4">
        <Link href="/">
          <HomeIcon className="h-6 w-6 cursor-pointer text-gray-500" />
        </Link>
        <Link href="/create-post">
          <PlusIcon className="h-7 w-7 cursor-pointer text-gray-500" />
        </Link>
        {showSearchIcon && (
          <MagnifyingGlassIcon
            className="h-6 w-6 cursor-pointer text-gray-500"
            onClick={showSearch}
          />
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="z-10 text-gray-600 hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
