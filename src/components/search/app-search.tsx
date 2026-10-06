'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, FilmIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

interface Props {
  open: boolean;
  onClose: () => void;
  dark?: boolean;
}

export function AppSearch ({ open, onClose, dark = false }: Props) {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');
      setPosts([]);
      setMovies([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setPosts([]); setMovies([]); return; }
    const t = setTimeout(async () => {
      const term = `%${query.trim()}%`;
      const [postsRes, movieRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, movie_title, profiles(username)')
          .or(`title.ilike.${term},movie_title.ilike.${term}`)
          .limit(4),
        searchMoviesAndTv(query.trim()),
      ]);
      const rawPosts = (postsRes.data ?? []) as { id: string; title: string; movie_title: string | null; profiles: { username: string } | { username: string }[] | null }[];
      setPosts(rawPosts.map(p => ({
        id: p.id,
        title: p.title,
        movie_title: p.movie_title,
        username: Array.isArray(p.profiles) ? (p.profiles[0]?.username ?? null) : (p.profiles?.username ?? null),
      })));
      setMovies(movieRes.slice(0, 5));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const close = () => { onClose(); setQuery(''); setPosts([]); setMovies([]); };

  const hasResults = movies.length > 0 || posts.length > 0;

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center pt-16 sm:pt-28 px-4">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Modal panel */}
      <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
        dark ? 'bg-[#0D0B09] border-[#2A2520]' : 'bg-[#FFFDF8] border-[#E8EEEA]'
      }`}>

        {/* Input row */}
        <div className={`flex items-center gap-3 px-4 py-3.5 border-b ${dark ? 'border-[#2A2520]' : 'border-[#E8EEEA]'}`}>
          <MagnifyingGlassIcon className={`w-5 h-5 flex-shrink-0 ${dark ? 'text-[#8C7E6E]' : 'text-[#6F8C88]'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies & shows..."
            className={`flex-1 bg-transparent text-base focus:outline-none ${dark ? 'text-[#EEEAE2] placeholder:text-[#4A4038]' : 'text-[#172526] placeholder:text-[#6F8C88]'}`}
            onKeyDown={e => {
              if (e.key === 'Escape') close();
              if (e.key === 'Enter' && query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                close();
              }
            }}
          />
          <button onClick={close} className={`p-1 rounded-lg transition-colors ${dark ? 'text-[#8C7E6E] hover:text-[#EEEAE2]' : 'text-[#6F8C88] hover:text-[#172526]'}`}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        {hasResults && (
          <div className="max-h-[60vh] overflow-y-auto">

            {posts.length > 0 && (
              <div>
                <p className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`}>
                  People&apos;s Reactions
                </p>
                {posts.map(post => (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}`}
                    onClick={close}
                    className={`flex flex-col px-4 py-2.5 transition-colors ${dark ? 'hover:bg-[#1A1714]' : 'hover:bg-[#EEF2ED]'}`}
                  >
                    <span className={`text-sm font-semibold line-clamp-1 ${dark ? 'text-[#EEEAE2]' : 'text-[#172526]'}`}>{post.title}</span>
                    <span className={`text-xs mt-0.5 ${dark ? 'text-[#8C7E6E]' : 'text-[#6F8C88]'}`}>
                      {post.username && `by ${post.username}`}{post.movie_title && ` · ${post.movie_title}`}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {movies.length > 0 && (
              <div className={posts.length > 0 ? `border-t ${dark ? 'border-[#272320]' : 'border-[#E8EEEA]'}` : ''}>
                <p className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`}>
                  Movies &amp; Shows
                </p>
                {movies.map(movie => {
                  const isTV = !movie.title;
                  const displayTitle = movie.title || movie.name;
                  const year = (movie.release_date || (movie as any).first_air_date || '').slice(0, 4);
                  return (
                    <Link
                      key={movie.id}
                      href={`/movie-more-info/${movie.id}?type=${isTV ? 'tv' : 'movie'}`}
                      onClick={close}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${dark ? 'hover:bg-[#1A1714]' : 'hover:bg-[#EEF2ED]'}`}
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
                          <div className="w-full h-full flex items-center justify-center">
                            <FilmIcon className="w-4 h-4 text-[#3A3530]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${dark ? 'text-[#EEEAE2]' : 'text-[#172526]'}`}>{displayTitle}</p>
                        <p className={`text-xs mt-0.5 ${dark ? 'text-[#8C7E6E]' : 'text-[#6F8C88]'}`}>
                          {year}{isTV ? `${year ? ' · ' : ''}TV Show` : ''}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {!hasResults && query.trim() && (
          <p className={`px-4 py-5 text-sm ${dark ? 'text-[#8C7E6E]' : 'text-[#6F8C88]'}`}>
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}

        {!query.trim() && (
          <p className={`px-4 py-5 text-sm ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`}>
            Type to search people&apos;s reaction, movies or shows
          </p>
        )}

      </div>
    </div>,
    document.body
  );
}
