'use client';

import { useState, useEffect } from 'react';
import { FireIcon, TvIcon } from '@heroicons/react/24/outline';
import { getTrendingMovies, getTrendingTV, TrendingMovie, TrendingTV } from '@/utils/tmdb';
import MediaCard from './media-card';

export default function TrendingView ({
  onReview,
}: {
  onReview: (movie?: { id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string }) => void;
}) {
  const [movies, setMovies] = useState<TrendingMovie[]>([]);
  const [shows, setShows] = useState<TrendingTV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrendingMovies(), getTrendingTV()]).then(([m, s]) => {
      setMovies(m);
      setShows(s);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="rounded-xl bg-[#EEF2ED] aspect-[2/3] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-10">

      {/* Trending Movies */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FireIcon className="w-4 h-4 text-[#2A4649]" />
          <h3 className="font-plus-jakarta font-extrabold text-base text-[#172526]">Trending Movies</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {movies.slice(0, 12).map((movie, i) => (
            <MediaCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              year={movie.release_date?.slice(0, 4) ?? ''}
              rating={movie.vote_average}
              index={i}
              releaseDate={movie.release_date ?? ''}
              onReview={() => onReview({ id: movie.id, title: movie.title, name: '', overview: '', poster_path: movie.poster_path ?? '', release_date: movie.release_date })}
            />
          ))}
        </div>
      </section>

      {/* Trending TV */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TvIcon className="w-4 h-4 text-[#2A4649]" />
          <h3 className="font-plus-jakarta font-extrabold text-base text-[#172526]">Trending TV Shows</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {shows.slice(0, 12).map((show, i) => (
            <MediaCard
              key={show.id}
              id={show.id}
              title={show.name}
              posterPath={show.poster_path}
              year={show.first_air_date?.slice(0, 4) ?? ''}
              rating={show.vote_average}
              index={i}
              releaseDate={show.first_air_date ?? ''}
              onReview={() => onReview({ id: show.id, title: '', name: show.name, overview: '', poster_path: show.poster_path ?? '', release_date: show.first_air_date })}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
