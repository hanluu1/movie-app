'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { searchMoviesAndTv, Movie } from '@/utils/tmdb';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/auth-js';

export function Header ({ onCreatePost }: {
  onCreatePost?: () => void;
  showSearchIcon?: boolean;
  showSearch?: () => void;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{username: string} | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (profileData) setProfile(profileData);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const data = await searchMoviesAndTv(query);
      setResults(data.slice(0, 6));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setQuery(''); setResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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

  const initials = profile ? getInitials(profile.username) : '??';

  return (
    <header className="font-dm-sans sticky top-0 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-4 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center gap-4">
        <Link href="/">
          <span className="font-archivo-black text-2xl tracking-tight bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
            REELEMOTIONS
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={searchRef} className="relative w-[180px] sm:w-[300px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-3xl text-sm bg-white transition-all duration-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 placeholder:text-stone-400"
            />
            {results.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
                {results.map(movie => (
                  <Link
                    key={movie.id}
                    href={`/movie-more-info/${movie.id}`}
                    onClick={() => { setQuery(''); setResults([]); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                  >
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title || movie.name}
                        width={28}
                        height={42}
                        className="rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-10 rounded flex-shrink-0" style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }} />
                    )}
                    <span className="text-sm font-semibold text-stone-900 line-clamp-1">
                      {movie.title || movie.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Add Review */}
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

          {/* user profile */}
          {user && (
            <button
              onClick={() => router.push('/my-movies')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
              title="Sign out"
            >
              {initials}
            </button>
          )}

          {/* User avatar / sign out */}
          <button
            onClick={handleSignOut}
            className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-red-600 bg-stone-100 hover:bg-red-50 border border-stone-200 hover:border-red-200 rounded-full transition-all duration-300 hover:scale-105"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        
        </div>
      </div>
    </header>
  );
}
