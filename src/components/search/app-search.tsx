'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MagnifyingGlassIcon, FilmIcon, XMarkIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import { useMovieSearch } from '@/hooks/use-movie-search';
import { getFeeling } from '@/lib/moods';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface PostResult {
  id: string;
  content: string | null;
  movie_title: string | null;
  mood: string[] | null;
  username: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  dark?: boolean;
}

interface ResultItem {
  key: string;
  href: string;
}

const THEMES = {
  dark: {
    panel: 'bg-[#17120E]/95 border-white/10 backdrop-blur-xl',
    text: 'text-[#EEEAE2]',
    muted: 'text-[#B8AA98]',
    divider: 'border-white/10',
    active: 'bg-white/10',
    chip: 'bg-white/10 text-[#EEEAE2]',
    poster: 'bg-white/10',
  },
  light: {
    panel: 'bg-[#FFFDF8] border-[#E8EEEA]',
    text: 'text-[#172526]',
    muted: 'text-[#5B7370]',
    divider: 'border-[#E8EEEA]',
    active: 'bg-[#EEF2ED]',
    chip: 'bg-[#EEF2ED] text-[#172526]',
    poster: 'bg-[#EEF2ED]',
  },
} as const;

// PostgREST .or() filters break on these characters
const sanitizeTerm = (q: string) => q.replace(/[,%()*\\]/g, ' ').trim();

export function AppSearch ({ open, onClose, dark = false }: Props) {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = THEMES[dark ? 'dark' : 'light'];
  const { results: movieResults, loading: moviesLoading } = useMovieSearch(query);
  const movies = movieResults.slice(0, 6);

  useEffect(() => {
    if (open) {
      setQuery('');
      setPosts([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const term = sanitizeTerm(query);
    if (!term) { setPosts([]); setPostsLoading(false); return; }

    let cancelled = false;
    setPostsLoading(true);
    const timer = setTimeout(async () => {
      const like = `%${term}%`;
      const { data } = await supabase
        .from('posts')
        .select('id, content, movie_title, mood, profiles(username)')
        .or(`content.ilike.${like},movie_title.ilike.${like}`)
        .order('created_at', { ascending: false })
        .limit(4);
      if (cancelled) return;

      const raw = (data ?? []) as unknown as (Omit<PostResult, 'username'> & {
        profiles: { username: string } | { username: string }[] | null;
      })[];
      setPosts(raw.map(({ profiles, ...p }) => ({
        ...p,
        username: Array.isArray(profiles) ? (profiles[0]?.username ?? null) : (profiles?.username ?? null),
      })));
      setPostsLoading(false);
    }, 300);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  // Movies first (the main thing people look for), then yaps; one list drives keyboard nav
  const items: ResultItem[] = [
    ...movies.map((m) => ({ key: `m-${m.title ? 'm' : 't'}-${m.id}`, href: `/movie-more-info/${m.id}?type=${m.title ? 'movie' : 'tv'}` })),
    ...posts.map((p) => ({ key: `p-${p.id}`, href: `/post/${p.id}` })),
  ];

  useEffect(() => { setActiveIndex(0); }, [movieResults, posts]);

  useEffect(() => {
    document.getElementById(`search-opt-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const close = () => { onClose(); setQuery(''); setPosts([]); };

  const go = (href: string) => { router.push(href); close(); };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (items.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % items.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i - 1 + items.length) % items.length); }
    if (e.key === 'Enter') { e.preventDefault(); go(items[activeIndex].href); }
  };

  const hasQuery = query.trim().length > 0;
  const loading = moviesLoading || postsLoading;
  const hasResults = items.length > 0;

  if (!open || typeof document === 'undefined') return null;

  const rowClass = (index: number) =>
    `flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIndex === index ? t.active : ''}`;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col items-center px-3 pt-3 sm:px-4 sm:pt-24">

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className={`relative w-full max-w-xl overflow-hidden rounded-3xl border shadow-2xl ${t.panel}`}
      >
        {/* Input */}
        <div className={`flex items-center gap-3 px-4 py-3.5 ${hasQuery ? `border-b ${t.divider}` : ''}`}>
          <MagnifyingGlassIcon className={`h-5 w-5 shrink-0 ${t.muted}`} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={hasResults}
            aria-controls="search-results"
            aria-activedescendant={hasResults ? `search-opt-${activeIndex}` : undefined}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search a movie, show or yap…"
            className={`flex-1 bg-transparent text-base outline-none ${t.text} ${dark ? 'placeholder:text-[#B8AA98]' : 'placeholder:text-[#5B7370]'}`}
          />
          {loading && (
            <span aria-label="Searching" className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${t.muted}`} />
          )}
          {hasQuery ? (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              className={`rounded-full p-1 transition-colors hover:opacity-70 ${t.muted}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={close} className={`rounded-lg px-2 py-1 text-xs font-bold ${t.chip}`}>
              Esc
            </button>
          )}
        </div>

        {/* Results */}
        {hasResults && (
          <div id="search-results" role="listbox" className="max-h-[65vh] overflow-y-auto pb-2">
            {movies.length > 0 && (
              <div>
                <p className={`px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-widest ${t.muted}`}>
                  Movies &amp; shows
                </p>
                {movies.map((movie, i) => {
                  const isTV = !movie.title;
                  const title = movie.title || movie.name;
                  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
                  return (
                    <button
                      key={items[i].key}
                      id={`search-opt-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(items[i].href)}
                      className={rowClass(i)}
                    >
                      <div className={`relative h-12 w-8 shrink-0 overflow-hidden rounded ${t.poster}`}>
                        {movie.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FilmIcon className={`h-4 w-4 ${t.muted}`} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-bold ${t.text}`}>{title}</p>
                        <p className={`mt-0.5 text-xs ${t.muted}`}>
                          {[year, isTV ? 'TV show' : 'Movie'].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {posts.length > 0 && (
              <div className={movies.length > 0 ? `mt-1 border-t ${t.divider}` : ''}>
                <p className={`px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-widest ${t.muted}`}>
                  Yaps
                </p>
                {posts.map((post, j) => {
                  const i = movies.length + j;
                  const feeling = getFeeling(post.mood?.[0]);
                  return (
                    <button
                      key={items[i].key}
                      id={`search-opt-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(items[i].href)}
                      className={rowClass(i)}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                        style={{ background: feeling ? `${feeling.color}26` : undefined }}
                      >
                        {feeling ? feeling.emoji : <ChatBubbleLeftEllipsisIcon className={`h-4 w-4 ${t.muted}`} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`line-clamp-2 text-sm font-semibold ${t.text}`}>{post.content || 'Untitled yap'}</p>
                        <p className={`mt-0.5 truncate text-xs ${t.muted}`}>
                          {[post.username && `@${post.username}`, post.movie_title].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty states */}
        {hasQuery && !hasResults && !loading && (
          <p className={`px-4 py-6 text-center text-sm ${t.muted}`}>
            Nothing found for &ldquo;{query.trim()}&rdquo;. Check the spelling or try fewer words.
          </p>
        )}

        {!hasQuery && (
          <div className={`border-t px-4 py-4 text-sm ${t.divider} ${t.muted}`}>
            <p>Find a movie or show, or search what people have yapped about.</p>
            <p className="mt-1.5 text-xs">Tip: add a year to narrow it down, like &ldquo;Dune 2021&rdquo;.</p>
          </div>
        )}

        {hasResults && (
          <div className={`hidden items-center gap-4 border-t px-4 py-2 text-[11px] sm:flex ${t.divider} ${t.muted}`}>
            <span>↑↓ to move</span>
            <span>Enter to open</span>
            <span>Esc to close</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
