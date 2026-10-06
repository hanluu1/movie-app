'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Bars3Icon, XMarkIcon, MagnifyingGlassIcon,
  UserCircleIcon, ArrowRightStartOnRectangleIcon,
  FilmIcon, GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { AppSearch } from '@/components/search/app-search';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/auth-js';

export function Header ({ onCreatePost, showSearch = true, variant = 'light' }: {
  onCreatePost?: () => void;
  showSearch?: boolean;
  variant?: 'light' | 'dark';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string; avatar_url?: string | null } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cached = localStorage.getItem('profile_username');
    if (cached) setProfile({ username: cached });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', u.id)
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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
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
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : username.slice(0, 2).toUpperCase();
  };

  const initials = profile ? getInitials(profile.username) : '';
  const loginHref = `/login?redirect=${encodeURIComponent(pathname)}`;
  const isDark = variant === 'dark';

  return (
    <header className={`font-sans sticky top-0 w-full px-4 sm:px-10 py-3.5 flex justify-between items-center backdrop-blur-md border-b z-50 ${
      isDark
        ? 'bg-[#0A0908]/98 border-[#3A2510]'
        : 'bg-[#FFFDF8]/90 border-[#E8EEEA]'
    }`}>

      {/* Logo + nav */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        <span className={`font-plus-jakarta font-extrabold text-xl tracking-tight ${isDark ? 'text-[#EEEAE2]' : 'text-[#172526]'}`}>
            ReelEmotion
        </span>
       

        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/discover"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              pathname === '/discover'
                ? isDark ? 'text-[#EEEAE2] bg-[#272320]' : 'text-[#172526] bg-[#EEF2ED]'
                : isDark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:text-[#172526]'
            }`}
          >
            <FilmIcon className="w-4 h-4" />
            Discover
          </Link>
          <Link
            href="/feed"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              pathname === '/feed'
                ? isDark ? 'text-[#EEEAE2] bg-[#272320]' : 'text-[#172526] bg-[#EEF2ED]'
                : isDark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:text-[#172526]'
            }`}
          >
            <GlobeAltIcon className="w-4 h-4" />
            Feed
          </Link>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Search icon — all screen sizes */}
        {showSearch && (
          <button
            onClick={() => setSearchOpen(true)}
            className={`p-2 rounded-full transition-colors ${isDark ? 'text-[#8C7E6E] hover:text-[#EEEAE2] hover:bg-[#1A1714]' : 'text-[#6F8C88] hover:text-[#172526] hover:bg-[#EEF2ED]'}`}
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        )}

        {user ? (
          <>

            {/* Avatar + dropdown — desktop */}
            <div className="relative hidden sm:block" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(o => !o)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all hover:scale-105 bg-[#2A4649] overflow-hidden relative ring-2 ring-transparent hover:ring-[#C8956A]/50"
                title="Account"
              >
                {profile?.avatar_url
                  ? <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" sizes="36px" />
                  : initials}
              </button>

              {profileMenuOpen && (
                <div className={`absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl overflow-hidden z-50 border ${
                  isDark ? 'bg-[#0D0B09] border-[#1A1410]/80' : 'bg-[#FFFDF8] border-[#E8EEEA]'
                }`}>
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-[#1A1410]/80' : 'border-[#E8EEEA]'}`}>
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-[#EEEAE2]' : 'text-[#172526]'}`}>
                      @{profile?.username}
                    </p>
                  </div>
                  <button
                    onClick={() => { router.push('/my-profiles'); setProfileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isDark ? 'text-[#C8B8A2] hover:bg-[#1E1B18] hover:text-[#EEEAE2]' : 'text-[#172526] hover:bg-[#EEF2ED]'
                    }`}
                  >
                    <UserCircleIcon className="w-4 h-4 flex-shrink-0" />
                    My Profile
                  </button>
                  <div className={`border-t ${isDark ? 'border-[#1A1410]/80' : 'border-[#E8EEEA]'}`} />
                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isDark ? 'text-[#8C7E6E] hover:bg-[#1E1B18] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:bg-[#EEF2ED] hover:text-[#172526]'
                    }`}
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Sign In — ghost */}
            <Link href={loginHref} className="hidden sm:block">
              <button className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                isDark
                  ? 'text-[#EEEAE2] hover:text-[#EEEAE2]'
                  : 'text-[#2A4649] hover:text-[#172526]'
              }`}>
                Sign In
              </button>
            </Link>
            {/* Join Free — filled CTA */}
            <Link href={loginHref} className="hidden sm:block">
              <button className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                isDark
                  ? 'bg-[#C8956A] text-[#0A0908] hover:bg-[#D4A870]'
                  : 'bg-[#2A4649] text-white hover:bg-[#1E3436]'
              }`}>
                Join Free
              </button>
            </Link>
          </>
        )}

        {/* Mobile hamburger menu */}
        <div className="relative sm:hidden" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className={`p-1 transition-colors ${isDark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#2A4649]'}`}
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>

          {menuOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-xl overflow-hidden z-50 border ${
              isDark ? 'bg-[#0D0B09] border-[#1A1410]/80' : 'bg-[#FFFDF8] border-[#E8EEEA]'
            }`}>

              {user ? (
                <>
                  <button
                    onClick={() => { router.push('/my-profiles'); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                      isDark ? 'hover:bg-[#1E1B18]' : 'hover:bg-[#EEF2ED]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-[#2A4649] overflow-hidden relative">
                      {profile?.avatar_url
                        ? <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" sizes="32px" />
                        : initials}
                    </div>
                    <span className={`text-sm font-semibold truncate ${isDark ? 'text-[#EEEAE2]' : 'text-[#172526]'}`}>
                      @{profile?.username}
                    </span>
                  </button>

                  <div className={`border-t ${isDark ? 'border-[#1A1410]/80' : 'border-[#E8EEEA]'}`} />

                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left text-sm font-medium ${
                      isDark ? 'hover:bg-[#1E1B18] text-[#8C7E6E] hover:text-[#EEEAE2]' : 'hover:bg-[#EEF2ED] text-[#6F8C88]'
                    }`}
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { router.push(loginHref); setMenuOpen(false); }}
                    className={`w-full px-4 py-3 transition-colors text-left text-sm font-semibold ${
                      isDark ? 'hover:bg-[#1E1B18] text-[#EEEAE2]' : 'hover:bg-[#EEF2ED] text-[#172526]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { router.push(loginHref); setMenuOpen(false); }}
                    className={`w-full px-4 py-3 transition-colors text-left text-sm font-semibold ${
                      isDark ? 'hover:bg-[#1E1B18] text-[#C8956A]' : 'hover:bg-[#EEF2ED] text-[#2A4649]'
                    }`}
                  >
                    Join Free
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Search modal */}
      <AppSearch open={searchOpen} onClose={() => setSearchOpen(false)} dark={isDark} />

    </header>
  );
}
