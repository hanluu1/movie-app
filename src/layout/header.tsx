'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MovieSearch } from '@/components/ui/MovieSearch';
import Link from 'next/link';
import type { User } from '@supabase/auth-js';

export function Header ({ onCreatePost }: {
  onCreatePost?: () => void;
  showSearchIcon?: boolean;
  showSearch?: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{username: string} | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem('profile_username');
    if (cached) setProfile({ username: cached });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (profileData) {
          setProfile(profileData);
          localStorage.setItem('profile_username', profileData.username);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('profile_username');
    router.push('/login');
  };

  const getInitials = (username: string) => {
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else {
      return username.slice(0, 2).toUpperCase();
    }
  };

  const initials = profile ? getInitials(profile.username) : '';

  return (
    <header className="font-dm-sans sticky top-0 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-4 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-4">
        <Link href="/">
          <span className="font-archivo-black text-2xl tracking-tight bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
            REELEMOTIONS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Search - desktop only */}
          <MovieSearch
            variant="floating"
            excludeRef={menuRef}
            className="hidden sm:block w-[180px] sm:w-[300px]"
          />

          {/* Add Review - desktop only */}
          {onCreatePost && (
            <button
              onClick={onCreatePost}
              className="hidden sm:flex items-center gap-1.5 text-white px-5 py-2 rounded-3xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}
            >
              <span className="text-lg leading-none">+</span>
              <span>Share Your Taste</span>
            </button>
          )}

          {/* Profile avatar - desktop only */}
          {user && (
            <button
              onClick={() => router.push('/my-profiles')}
              className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
              title="my-profiles"
            >
              {initials}
            </button>
          )}

          {/* Sign out - desktop only */}
          <button
            onClick={handleSignOut}
            className="hidden sm:flex w-10 h-10 items-center justify-center text-stone-600 hover:text-red-600 bg-stone-100 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-full transition-all duration-300 hover:scale-105"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>

          {/* Search icon - mobile only */}
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-1 text-stone-600 hover:text-red-600 transition-colors"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>

          {/* Mobile menu */}
          <div className="relative sm:hidden" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-1 text-stone-600 hover:text-red-600 transition-colors"
            >
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-stone-200 rounded-2xl shadow-lg overflow-hidden z-50 py-1">

                {user && (
                  <button
                    onClick={() => { router.push('/my-profiles'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
                    >
                      {initials}
                    </div>
                    <span className="text-sm font-semibold text-stone-900 truncate">{profile?.username}</span>
                  </button>
                )}

                {onCreatePost && (
                  <button
                    onClick={() => { onCreatePost(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left text-sm font-semibold text-stone-700"
                  >
                    <span className="text-lg leading-none text-red-600">+</span>
                    Share Your Taste
                  </button>
                )}

                <div className="border-t border-stone-100" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-sm font-semibold text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col sm:hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 text-stone-600 hover:text-red-600 transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-stone-600">Search movies</span>
          </div>
          <MovieSearch
            variant="inline"
            onSelect={() => setSearchOpen(false)}
            autoFocus
            className="flex-1 overflow-hidden flex flex-col px-4 pt-3"
            resultsClassName="flex-1 overflow-y-auto mt-1"
          />
        </div>
      )}
    </header>
  );
}
