'use client';

import { useRef, useState, useEffect } from 'react';
import { searchMoviesAndTv, Movie } from '@/utils/tmdb';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

const SearchIcon = ({ size }: { size: number }) => (
  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

interface Props {
  variant?: 'floating' | 'inline';
  onSelect?: () => void;
  excludeRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  resultsClassName?: string;
  autoFocus?: boolean;
}

export function MovieSearch ({ variant = 'floating', onSelect, excludeRef, className, resultsClassName, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      const data = await searchMoviesAndTv(query);
      setResults(data.slice(0, 6));
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
        setQuery(''); setResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [variant, excludeRef]);

  const clear = () => { setQuery(''); setResults([]); onSelect?.(); };

  const Poster = ({ movie }: { movie: Movie }) =>
    movie.poster_path ? (
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title || movie.name}
        width={variant === 'floating' ? 28 : 24}
        height={variant === 'floating' ? 42 : 36}
        className="rounded object-cover flex-shrink-0"
      />
    ) : (
      <div
        className={variant === 'floating' ? 'w-7 h-10 rounded flex-shrink-0' : 'w-6 h-9 rounded flex-shrink-0'}
        style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
      />
    );

  if (variant === 'floating') {
    return (
      <div ref={containerRef} className={`relative ${className ?? ''}`}>
        <SearchIcon size={15} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies..."
          autoFocus={autoFocus}
          className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-3xl text-sm bg-white transition-all duration-300 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 placeholder:text-stone-400"
        />
        {results.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-72 overflow-y-auto">
            {results.map(movie => (
              <Link
                key={movie.id}
                href={`/movie-more-info/${movie.id}`}
                onClick={clear}
                className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
              >
                <Poster movie={movie} />
                <span className="text-sm font-semibold text-stone-900 line-clamp-1">{movie.title || movie.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        <MagnifyingGlassIcon />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies..."
          autoFocus={autoFocus}
          className="w-full pl-8 pr-3 py-2 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/10 placeholder:text-stone-400"
        />
      </div>
      {results.length > 0 && (
        <div className={resultsClassName ?? 'mt-1 max-h-56 overflow-y-auto'}>
          {results.map(movie => (
            <Link
              key={movie.id}
              href={`/movie-more-info/${movie.id}`}
              onClick={clear}
              className="flex items-center gap-3 px-2 py-2 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <Poster movie={movie} />
              <span className="text-sm font-semibold text-stone-900 line-clamp-1">{movie.title || movie.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
