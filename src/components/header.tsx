'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import type { User } from '@supabase/auth-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function Header ({
  showSearchIcon = true,
  showSearch,
}: {
  showSearchIcon?: boolean;
  showSearch?: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);
  return (
    <div className="relative flex items-center justify-between px-6 py-5 bg-gray-900 border-b border-gray-700 shadow-md">
      <Link href='/'>
        <div
          className="font-logo text-4xl tracking-tight text-white leading-none"
        >
          ReelEmotions
        </div>
      </Link>
      <div className='flex flex-row gap-4 items-center'> 
        {showSearchIcon && (
          <MagnifyingGlassIcon
            className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition"
            onClick={showSearch}
          />
        )}
        {user ? (
          <button
            onClick={handleSignOut}
            className="z-10 text-gray-300 hover:text-blue-400 transition"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="z-10 text-gray-300 hover:text-blue-400 transition"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
