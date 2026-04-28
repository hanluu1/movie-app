'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, PlayIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  variant?: 'default' | 'overlay';
}

const BUTTONS = [
  { status: 'watched',  label: 'Watched',  Icon: CheckIcon   },
  { status: 'watching', label: 'Watching', Icon: PlayIcon     },
  { status: 'to-watch', label: 'To Watch', Icon: BookmarkIcon },
] as const;

type Status = 'watched' | 'watching' | 'to-watch';

export function WatchlistButtons ({ movieId, title, posterPath, releaseDate, variant = 'default' }: Props) {
  const [adding, setAdding] = useState<Status | null>(null);
  const [active, setActive] = useState<Status | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('track_movies')
        .select('status')
        .eq('user_id', user.id)
        .eq('movie_id', movieId.toString())
        .limit(1)
        .maybeSingle();
      if (data?.status) setActive(data.status as Status);
    };
    fetchStatus();
  }, [movieId]);

  const handleClick = async (status: Status) => {
    setAdding(status);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAdding(null); return; }

    const movieIdStr = movieId.toString();

    if (active === status) {
      // Undo — delete the row
      await supabase
        .from('track_movies')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieIdStr);
      setActive(null);
    } else if (active) {
      // Switch status — update the existing row
      await supabase
        .from('track_movies')
        .update({ status })
        .eq('user_id', user.id)
        .eq('movie_id', movieIdStr);
      setActive(status);
    } else {
      // First time — insert
      const { error } = await supabase.from('track_movies').insert({
        user_id: user.id,
        movie_id: movieIdStr,
        movie_title: title,
        poster_url: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : '',
        movie_release: releaseDate,
        status,
      });
      if (!error) setActive(status);
    }

    setAdding(null);
  };

  if (variant === 'overlay') {
    return (
      <div className="flex gap-1 w-full">
        {BUTTONS.map(({ status, label, Icon }) => {
          const isActive = active === status;
          const isLoading = adding === status;
          return (
            <button
              key={status}
              title={label}
              onClick={() => handleClick(status)}
              disabled={!!adding}
              className={`flex-1 py-1.5 rounded-lg border transition-colors flex flex-col items-center gap-0.5 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-white/20 border-white text-white'
                  : 'border-white/30 text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="text-[8px] font-bold leading-none">
                {isLoading ? '' : label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-5">
      {BUTTONS.map(({ status, label, Icon }) => {
        const isActive = active === status;
        const isLoading = adding === status;
        return (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={!!adding}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 ${
              isActive
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-white border-stone-200 text-stone-700 hover:border-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Icon className="w-4 h-4" />
            {isLoading ? '' : label}
          </button>
        );
      })}
    </div>
  );
}
