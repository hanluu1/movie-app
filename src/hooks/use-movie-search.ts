'use client';

import { useEffect, useState } from 'react';
import { searchMoviesAndTv, type Movie } from '@/lib/tmdb/client';

// Debounced TMDB search that drops out-of-order responses
export function useMovieSearch (query: string, delay = 300) {
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const found = await searchMoviesAndTv(term);
      if (cancelled) return;
      setResults(found);
      setLoading(false);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, delay]);

  return { results, loading };
}
