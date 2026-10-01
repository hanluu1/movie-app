'use client';

import { useRef, useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import { searchMoviesAndTv, type Movie } from '@/lib/tmdb/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostResult {
  id: string;
  title: string;
  movie_title: string | null;
  username: string | null;
}

interface UserResult {
  id: string;
  username: string;
}

interface Props {
  variant?: 'floating' | 'inline';
  dark?: boolean;
  onSelect?: () => void;
  excludeRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  resultsClassName?: string;
  autoFocus?: boolean;
}

export function AppSearch ({ variant = 'floating', dark = false, onSelect, excludeRef, className, resultsClassName, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) { setPosts([]); setUsers([]); setMovies([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      const term = `%${query.trim()}%`;
      const [postsRes, usersRes, movieRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, movie_title, profiles(username)')
          .or(`title.ilike.${term},movie_title.ilike.${term}`)
          .limit(4),
        supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', term)
          .limit(3),
        searchMoviesAndTv(query.trim()),
      ]);
      const rawPosts = (postsRes.data ?? []) as { id: string; title: string; movie_title: string | null; profiles: { username: string } | { username: string }[] | null }[];
      setPosts(rawPosts.map(p => ({
        id: p.id,
        title: p.title,
        movie_title: p.movie_title,
        username: Array.isArray(p.profiles) ? (p.profiles[0]?.username ?? null) : (p.profiles?.username ?? null),
      })));
      setUsers((usersRes.data as UserResult[]) ?? []);
      setMovies(movieRes.slice(0, 4));
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (variant !== 'floating') return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !excludeRef?.current?.contains(e.target as Node)
      ) {
        setQuery(''); setPosts([]); setUsers([]); setMovies([]); setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [variant, excludeRef]);

  const clear = () => {
    setQuery(''); setPosts([]); setUsers([]); setMovies([]); setOpen(false);
    onSelect?.();
  };

  const hasResults = posts.length > 0 || users.length > 0 || movies.length > 0;

  const dropdownClass = variant === 'floating'
    ? `absolute top-full mt-2 left-0 right-0 rounded-2xl shadow-lg overflow-hidden z-50 border ${dark ? 'bg-[#1A1714] border-[#3A3530]' : 'bg-[#FFFDF8] border-[#E8EEEA]'}`
    : `mt-2 rounded-2xl shadow-lg overflow-hidden border ${dark ? 'bg-[#1A1714] border-[#3A3530]' : 'bg-[#FFFDF8] border-[#E8EEEA]'} ${resultsClassName ?? ''}`;

  const sectionLabel = `px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`;
  const divider = `border-t ${dark ? 'border-[#272320]' : 'border-[#E8EEEA]'}`;
  const rowHover = dark ? 'hover:bg-[#272320]' : 'hover:bg-[#EEF2ED]';
  const primaryText = dark ? 'text-[#F2EDE4]' : 'text-[#172526]';
  const secondaryText = dark ? 'text-[#6A5E50]' : 'text-[#6F8C88]';

  const inputClass = dark
    ? 'w-full pl-9 pr-4 py-2 border border-[#2A2520] rounded-full text-sm text-[#F2EDE4] bg-[#1A1714] transition-all focus:outline-none focus:border-[#C8956A]/50 placeholder:text-[#887a6e]'
    : variant === 'floating'
      ? 'w-full pl-9 pr-4 py-2 border border-[#E8EEEA] rounded-full text-sm text-[#172526] bg-white transition-all focus:outline-none focus:border-[#2A4649] focus:ring-2 focus:ring-[#2A4649]/10 placeholder:text-[#6F8C88]'
      : 'w-full pl-9 pr-4 py-2.5 border border-[#E8EEEA] rounded-full text-sm text-[#172526] bg-[#F9F6EF] transition-all focus:outline-none focus:border-[#2A4649] focus:ring-2 focus:ring-[#2A4649]/10 placeholder:text-[#6F8C88]';

  return (
    <div ref={containerRef} className={`${className ?? ''}`}>
      <div className="relative">
        <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dark ? 'text-[#887a6e]' : 'text-[#6F8C88]'}`} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies, feelings, people..."
          autoFocus={autoFocus}
          className={inputClass}
          onKeyDown={e => {
            if (e.key === 'Escape') clear();
            if (e.key === 'Enter' && query.trim()) {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              clear();
            }
          }}
        />
      </div>

      {open && hasResults && (
        <div className={dropdownClass}>

          {/* Movies & Shows */}
          {movies.length > 0 && (
            <div>
              <p className={sectionLabel}>Movies &amp; Shows</p>
              {movies.map(movie => {
                const isTV = !movie.title;
                const displayTitle = movie.title || movie.name;
                const year = (movie.release_date || (movie as any).first_air_date || '').slice(0, 4);
                const href = `/movie-more-info/${movie.id}?type=${isTV ? 'tv' : 'movie'}`;
                return (
                  <Link
                    key={movie.id}
                    href={href}
                    onClick={clear}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${rowHover}`}
                  >
                    <div className="w-8 h-12 rounded flex-shrink-0 overflow-hidden bg-[#272320] relative">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={displayTitle}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#4A4038]">🎬</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${primaryText}`}>{displayTitle}</p>
                      <p className={`text-xs mt-0.5 ${secondaryText}`}>
                        {year && <span>{year}</span>}
                        {isTV && <span>{year ? ' · ' : ''}TV Show</span>}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Reactions */}
          {posts.length > 0 && (
            <div className={movies.length > 0 ? divider : ''}>
              <p className={sectionLabel}>Reactions</p>
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  onClick={clear}
                  className={`flex flex-col px-4 py-2.5 transition-colors ${rowHover}`}
                >
                  <span className={`text-sm font-semibold line-clamp-1 ${primaryText}`}>{post.title}</span>
                  <span className={`text-xs mt-0.5 ${secondaryText}`}>
                    {post.username && `by ${post.username}`}
                    {post.movie_title && ` · ${post.movie_title}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* People */}
          {users.length > 0 && (
            <div className={(movies.length > 0 || posts.length > 0) ? divider : ''}>
              <p className={sectionLabel}>People</p>
              {users.map(user => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={clear}
                  className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${rowHover}`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#272320] flex items-center justify-center text-[#F2EDE4] text-[10px] font-bold flex-shrink-0">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm font-semibold ${primaryText}`}>@{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          <div className={`px-4 py-2.5 ${divider}`}>
            <button
              onClick={() => { router.push(`/search?q=${encodeURIComponent(query.trim())}`); clear(); }}
              className={`text-xs font-semibold hover:opacity-70 transition-opacity ${dark ? 'text-[#C8956A]' : 'text-[#2A4649]'}`}
            >
              See all results for &ldquo;{query}&rdquo; →
            </button>
          </div>

        </div>
      )}

      {open && !hasResults && query.trim() && (
        <div className={variant === 'floating'
          ? `absolute top-full mt-2 left-0 right-0 rounded-2xl shadow-lg z-50 px-4 py-4 border ${dark ? 'bg-[#1A1714] border-[#3A3530]' : 'bg-[#FFFDF8] border-[#E8EEEA]'}`
          : `mt-2 rounded-2xl shadow-lg px-4 py-4 border ${dark ? 'bg-[#1A1714] border-[#3A3530]' : 'bg-[#FFFDF8] border-[#E8EEEA]'} ${resultsClassName ?? ''}`
        }>
          <p className={`text-sm ${secondaryText}`}>No results for &ldquo;{query}&rdquo;.</p>
        </div>
      )}
    </div>
  );
}
