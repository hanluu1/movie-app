'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { MovieSearch } from '@/components/movies/search-movie';
import Link from 'next/link';
import type { User } from '@supabase/auth-js';

export function Header ({ onCreatePost, showSearch = true }: {
  onCreatePost?: () => void;
  showSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <header className="font-sans sticky top-0 w-full px-6 sm:px-8 py-4 flex justify-between items-center backdrop-blur-md border-b border-[#E8EEEA] z-50 bg-[#FFFDF8]/90">

      {/* Logo */}
      <Link href="/discover">
        <span className="font-serif font-bold text-xl tracking-tight text-[#172526]">
          ReelEmotions
        </span>
      </Link>

      <div className="flex items-center gap-4">

        {/* Search - desktop only */}
        {showSearch && (
          <MovieSearch
            variant="floating"
            excludeRef={menuRef}
            className="hidden sm:block w-[180px] sm:w-[260px]"
          />
        )}

        {/* Discover nav - desktop only */}
        <nav className="hidden sm:flex items-center gap-5 text-sm font-semibold text-[#2A4649]">
          <Link href="/discover" className="transition-opacity hover:opacity-70">Discover</Link>
        </nav>

        {/* Add Review - desktop only */}
        {onCreatePost && (
          <button
            onClick={onCreatePost}
            className="hidden sm:flex items-center gap-1.5 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap bg-[#2A4649]"
          >
            <span className="text-lg leading-none">+</span>
            <span>Share Your Taste</span>
          </button>
        )}

        {/* Profile avatar - desktop only */}
        {user && (
          <button
            onClick={() => router.push('/my-profiles')}
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all hover:scale-105 bg-[#2A4649]"
            title="My profile"
          >
            {initials}
          </button>
        )}

        {/* Sign out / Sign in - desktop only */}
        {user ? (
          <button
            onClick={handleSignOut}
            className="hidden sm:flex w-9 h-9 items-center justify-center text-[#2A4649] hover:text-white bg-[#E8EEEA] hover:bg-[#2A4649] rounded-full transition-all hover:scale-105"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        ) : (
          <Link href={loginHref} className="hidden sm:block">
            <button className="bg-[#2A4649] text-white px-5 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all hover:-translate-y-0.5 hover:shadow-md">
              Sign In
            </button>
          </Link>
        )}

        {/* Search icon - mobile only */}
        {showSearch && (
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-1 text-[#2A4649] transition-colors"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
          </button>
        )}

        {/* Mobile menu */}
        <div className="relative sm:hidden" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="p-1 text-[#2A4649] transition-colors"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFDF8] border border-[#E8EEEA] rounded-2xl shadow-lg overflow-hidden z-50 py-1">

              {user && (
                <button
                  onClick={() => { router.push('/my-profiles'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2ED] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-[#2A4649]">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-[#172526] truncate">{profile?.username}</span>
                </button>
              )}

              <Link
                href="/discover"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2ED] transition-colors text-sm font-semibold text-[#2A4649]"
              >
                Discover
              </Link>

              {onCreatePost && (
                <button
                  onClick={() => { onCreatePost(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2ED] transition-colors text-left text-sm font-semibold text-[#172526]"
                >
                  <span className="text-lg leading-none text-[#2A4649]">+</span>
                  Share Your Taste
                </button>
              )}

              <div className="border-t border-[#E8EEEA]" />

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2ED] transition-colors text-left text-sm font-semibold text-[#2A4649]"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => { router.push(loginHref); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#EEF2ED] transition-colors text-left text-sm font-semibold text-[#172526]"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Sign in
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="fixed inset-x-0 top-0 h-dvh bg-[#FFFDF8] z-[100] flex flex-col sm:hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E8EEEA] flex-shrink-0">
            <button
              onClick={() => setSearchOpen(false)}
              className="p-1 text-[#2A4649] transition-colors flex-shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-[#6F8C88]">Search movies</span>
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
