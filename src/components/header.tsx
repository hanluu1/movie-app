'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { MagnifyingGlassIcon,  } from '@heroicons/react/24/outline';
import { HomeIcon, PlusIcon, Squares2X2Icon } from '@heroicons/react/16/solid';

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
    <div className="relative flex items-center justify-between px-6 py-5 bg-gray-900 border-b border-gray-700 shadow-md">
      <div
        className="font-logo text-4xl tracking-tight text-white leading-none"
      >
        ReelEmotions
      </div>
      <div className='flex flex-row gap-4 items-center'> 
        {showSearchIcon && (
          <MagnifyingGlassIcon
            className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition"
            onClick={showSearch}
          />
        )}
        <button
          onClick={handleSignOut}
          className="z-10 text-gray-300 hover:text-blue-400 transition"
        >
        Sign out
        </button>
      </div>
    </div>
  );
}
