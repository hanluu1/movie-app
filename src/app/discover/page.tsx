'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon } from '@heroicons/react/24/outline';
import { AppShell } from '@/components/layout';
import { FeelingPicker } from '@/components/ui/feeling-picker';
import { supabase } from '@/lib/supabase/client';
import { BRAND_COLOR, FEELINGS, getFeeling, getMoodsForFeeling, type FeelingKey } from '@/lib/moods';
import { getMoviesByGenre, getTrendingMovies, getTrendingTV, type TrendingMovie, type TrendingTV } from '@/lib/tmdb/client';

const MOOD_GENRE_MAP: Record<string, number> = {
  'Moved me to tears': 18,
  'Mind-bending': 878,
  'Still thinking about it': 9648,
  'Comforting': 35,
  'Unsettling': 27,
  'Pure joy': 35,
  "Couldn't look away": 28,
  'Broke my heart': 10749,
  'Changed how I see things': 99,
  'Took me back': 36,
  'Had me on the edge': 53,
  'Left me inspired': 36,
  'Genuinely scared me': 27,
};

// A feeling covers several stored mood phrases; its genres are the union of theirs
function getGenreIdsForFeeling (key: FeelingKey): number[] {
  const ids = getMoodsForFeeling(key)
    .map((mood) => MOOD_GENRE_MAP[mood])
    .filter((id): id is number => typeof id === 'number');
  return Array.from(new Set(ids));
}

function mergeMovies (lists: TrendingMovie[][]): TrendingMovie[] {
  const seen = new Set<number>();
  const merged: TrendingMovie[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      const movie = list[i];
      if (movie && !seen.has(movie.id)) {
        seen.add(movie.id);
        merged.push(movie);
      }
    }
  }
  return merged;
}

interface ReactionCount {
  movie_id: number;
  movie_title: string;
  movie_image: string;
  media_type: string;
  count: number;
}

function MovieCard ({ id, title, posterPath, mediaType, reactionCount, glow }: {
  id: number; title: string; posterPath: string | null;
  mediaType: 'movie' | 'tv'; reactionCount?: number; glow?: string;
}) {
  return (
    <Link
      href={`/movie-more-info/${id}?type=${mediaType}`}
      className="press group w-36 shrink-0 snap-start sm:w-44"
    >
      <div
        className="relative mb-2.5 aspect-[2/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
        style={glow ? { boxShadow: `0 10px 30px -12px ${glow}88` } : undefined}
      >
        {posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(min-width: 640px) 176px, 144px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FilmIcon className="h-8 w-8 text-[#B8AA98]" />
          </div>
        )}
        {reactionCount !== undefined && reactionCount > 0 && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-black text-[#F5A623] backdrop-blur-sm">
            {reactionCount} {reactionCount === 1 ? 'yap' : 'yaps'}
          </div>
        )}
      </div>
      <p className="truncate px-1 text-sm font-bold leading-snug text-[#EEEAE2]">{title}</p>
    </Link>
  );
}

function RowSkeleton () {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="w-36 shrink-0 sm:w-44">
          <div className="skeleton aspect-[2/3] w-full rounded-3xl" />
          <div className="skeleton mt-2.5 h-3 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function HorizontalRow ({ children }: { children: React.ReactNode }) {
  return (
    <div className="scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 pt-1 sm:gap-4">
      {children}
    </div>
  );
}

function SectionHeading ({ eyebrow, title, subtitle, action }: {
  eyebrow?: string; title: string; subtitle?: string; action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">{eyebrow}</p>
        )}
        <h2 className="font-plus-jakarta text-xl font-extrabold text-[#EEEAE2] sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-[#B8AA98]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default function DiscoverPage () {
  const [activeFeeling, setActiveFeeling] = useState<FeelingKey | null>(null);
  const [mostReacted, setMostReacted] = useState<ReactionCount[]>([]);
  const [feelingMovies, setFeelingMovies] = useState<TrendingMovie[]>([]);
  const [feelingLoading, setFeelingLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Accept a feeling key or a legacy mood phrase in ?mood=
    const moodFromUrl = new URLSearchParams(window.location.search).get('mood');
    if (!moodFromUrl) return;
    if (moodFromUrl in FEELINGS) {
      setActiveFeeling(moodFromUrl as FeelingKey);
      return;
    }
    const feeling = getFeeling(moodFromUrl);
    if (feeling) setActiveFeeling(feeling.key);
  }, []);

  useEffect(() => {
    const init = async () => {
      const [reactionsRes, trendingMoviesRes, trendingTVRes] = await Promise.all([
        supabase
          .from('posts')
          .select('movie_id, movie_title, movie_image, media_type')
          .not('movie_id', 'is', null)
          .order('created_at', { ascending: false }),
        getTrendingMovies(),
        getTrendingTV(),
      ]);

      const counts: Record<number, ReactionCount> = {};
      for (const post of reactionsRes.data ?? []) {
        if (!post.movie_id) continue;
        if (!counts[post.movie_id]) {
          counts[post.movie_id] = {
            movie_id: post.movie_id,
            movie_title: post.movie_title,
            movie_image: post.movie_image,
            media_type: post.media_type,
            count: 0,
          };
        }
        counts[post.movie_id].count++;
      }
      setMostReacted(Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 16));
      setTrendingMovies(trendingMoviesRes as TrendingMovie[]);
      setTrendingTV(trendingTVRes as TrendingTV[]);

      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!activeFeeling) { setFeelingMovies([]); setFeelingLoading(false); return; }
    const genreIds = getGenreIdsForFeeling(activeFeeling);
    if (genreIds.length === 0) { setFeelingMovies([]); return; }
    let cancelled = false;
    setFeelingLoading(true);
    Promise.all(genreIds.map((id) => getMoviesByGenre(id))).then((lists) => {
      if (cancelled) return;
      setFeelingMovies(mergeMovies(lists));
      setFeelingLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeFeeling]);

  const feeling = activeFeeling ? FEELINGS[activeFeeling] : null;

  return (
    <AppShell width="wide" glowColor={feeling ? feeling.color : BRAND_COLOR}>
      <div className="mb-5">
        <h1 className="font-plus-jakarta text-3xl font-extrabold leading-tight sm:text-4xl">
          Find your next <span className="shimmer-text">obsession</span>
        </h1>
        <p className="mt-1 text-sm text-[#B8AA98]">pick a feeling, we&apos;ll find the watch</p>
      </div>

      {/* Feeling picker */}
      <div
        className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] px-4 pb-2 pt-4 backdrop-blur-md transition-shadow duration-300"
        style={feeling ? { boxShadow: `0 0 40px -10px ${feeling.color}66`, borderColor: `${feeling.color}55` } : undefined}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">How are you feeling?</p>
          {feeling && (
            <button
              type="button"
              onClick={() => setActiveFeeling(null)}
              className="press text-xs font-bold text-[#B8AA98] transition-colors hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
        <FeelingPicker active={activeFeeling} onChange={setActiveFeeling} />
      </div>

      {/* Feeling results */}
      {feeling && (
        <section className="mb-10">
          <SectionHeading
            eyebrow={`${feeling.emoji} ${feeling.label}`}
            title={`Watches that hit ${feeling.label.toLowerCase()}`}
          />
          {feelingLoading ? (
            <RowSkeleton />
          ) : feelingMovies.length > 0 ? (
            <HorizontalRow>
              {feelingMovies.map((m) => (
                <MovieCard
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  posterPath={m.poster_path}
                  mediaType="movie"
                  glow={feeling.color}
                />
              ))}
            </HorizontalRow>
          ) : (
            <p className="text-sm text-[#B8AA98]">Nothing matched that feeling yet. Try another one.</p>
          )}
        </section>
      )}

      {/* Popular with the community */}
      {!loading && mostReacted.length > 0 && (
        <section className="mb-10">
          <SectionHeading
            eyebrow="Community"
            title="Everyone's yapping about"
            subtitle="movies and shows people can't stop talking about"
            action={(
              <Link href="/community" className="press mb-1 shrink-0 text-xs font-bold text-[#F5A623] transition-colors hover:text-[#FFD83D]">
                See the feed →
              </Link>
            )}
          />
          <HorizontalRow>
            {mostReacted.map((m) => (
              <MovieCard
                key={m.movie_id}
                id={m.movie_id}
                title={m.movie_title}
                posterPath={m.movie_image ? m.movie_image.replace(/https:\/\/image\.tmdb\.org\/t\/p\/w\d+/, '') : null}
                mediaType={m.media_type as 'movie' | 'tv'}
                reactionCount={m.count}
              />
            ))}
          </HorizontalRow>
        </section>
      )}

      {/* Trending */}
      <section className="mb-10">
        <SectionHeading eyebrow="Trending" title="Movies" subtitle="what's hot right now" />
        {loading ? (
          <RowSkeleton />
        ) : (
          <HorizontalRow>
            {trendingMovies.map((m) => (
              <MovieCard key={m.id} id={m.id} title={m.title} posterPath={m.poster_path} mediaType="movie" />
            ))}
          </HorizontalRow>
        )}
      </section>

      <section className="mb-6">
        <SectionHeading eyebrow="Trending" title="Shows" subtitle="your next binge" />
        {loading ? (
          <RowSkeleton />
        ) : (
          <HorizontalRow>
            {trendingTV.map((m) => (
              <MovieCard key={m.id} id={m.id} title={m.name} posterPath={m.poster_path} mediaType="tv" />
            ))}
          </HorizontalRow>
        )}
      </section>
    </AppShell>
  );
}
