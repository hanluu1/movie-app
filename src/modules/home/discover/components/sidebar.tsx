'use client';

import { useState, useEffect } from 'react';
import { FireIcon, TvIcon } from '@heroicons/react/24/outline';
import { getTrendingMovies, getTrendingTV, TrendingMovie, TrendingTV } from '@/utils/tmdb';
import MediaCard from './media-card';

function SectionHeader ({ Icon, title }: { Icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-red-600 flex-shrink-0" />
      <h3 className="font-archivo-black text-base tracking-tight">{title}</h3>
    </div>
  );
}

export default function Sidebar ({ onReview }: {
  onReview: (movie?: { id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string }) => void;
}) {
  const [trending, setTrending] = useState<TrendingMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTV[]>([]);

  useEffect(() => {
    getTrendingMovies().then(setTrending);
    getTrendingTV().then(setTrendingTV);
  }, []);

  return (
    <aside className="flex flex-col gap-8">

      <section>
        <SectionHeader Icon={FireIcon} title="Trending Movies" />
        <div className="grid grid-cols-3 gap-2">
          {trending.slice(0, 6).map((movie, i) => (
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

      <section>
        <SectionHeader Icon={TvIcon} title="Trending TV Shows" />
        <div className="grid grid-cols-3 gap-2">
          {trendingTV.slice(0, 6).map((show, i) => (
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

    </aside>
  );
}
