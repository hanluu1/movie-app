'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon } from '@heroicons/react/24/outline';
import { Header, MobileNavTabs } from '@/components/layout';
import { supabase } from '@/lib/supabase/client';
import { getMoviesByGenre, getTrendingMovies, getTrendingTV, type TrendingMovie, type TrendingTV } from '@/lib/tmdb/client';
import { MOODS } from '@/lib/moods';

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

const MOOD_SECTIONS: { mood: string; heading: string }[] = [
  { mood: 'Genuinely scared me',  heading: 'Films that will genuinely scare you' },
  { mood: 'Moved me to tears',    heading: 'Films that will move you to tears' },
  { mood: 'Mind-bending',         heading: 'Films that will bend your mind' },
  { mood: 'Pure joy',             heading: 'Films that will fill you with joy' },
  { mood: 'Had me on the edge',   heading: 'Films that will keep you on the edge' },
];

interface ReactionCount {
  movie_id: number;
  movie_title: string;
  movie_image: string;
  media_type: string;
  count: number;
}

function MovieCard ({ id, title, posterPath, mediaType, reactionCount }: {
  id: number; title: string; posterPath: string | null;
  mediaType: 'movie' | 'tv'; reactionCount?: number;
}) {
  return (
    <Link href={`/movie-more-info/${id}?type=${mediaType}`} className="flex-shrink-0 w-32 sm:w-36 group">
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#272320] mb-2">
        {posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w300${posterPath}`}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="144px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><FilmIcon className="w-8 h-8 text-[#3A3530]" /></div>
        )}
        {reactionCount !== undefined && reactionCount > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#C8956A]">
            {reactionCount} {reactionCount === 1 ? 'reaction' : 'reactions'}
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-[#EEEAE2] truncate leading-snug">{title}</p>
    </Link>
  );
}

function RowSkeleton () {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-32 sm:w-36">
          <div className="w-full aspect-[2/3] rounded-xl bg-[#1E1B18] animate-pulse" />
          <div className="h-3 mt-2 bg-[#1E1B18] rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  );
}

function HorizontalRow ({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{children}</div>;
}

export default function DiscoverPage () {
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [moodDropdownOpen, setMoodDropdownOpen] = useState(false);
  const moodDropdownRef = useRef<HTMLDivElement>(null);
  const [mostReacted, setMostReacted] = useState<ReactionCount[]>([]);
  const [moodMovies, setMoodMovies] = useState<TrendingMovie[]>([]);
  const [moodSections, setMoodSections] = useState<Record<string, TrendingMovie[]>>({});
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [reactionsRes, trendingMoviesRes, trendingTVRes, ...sectionResults] = await Promise.all([
        supabase
          .from('posts')
          .select('movie_id, movie_title, movie_image, media_type')
          .not('movie_id', 'is', null)
          .order('created_at', { ascending: false }),
        getTrendingMovies(),
        getTrendingTV(),
        ...MOOD_SECTIONS.map(s => getMoviesByGenre(MOOD_GENRE_MAP[s.mood])),
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

      const sections: Record<string, TrendingMovie[]> = {};
      MOOD_SECTIONS.forEach((s, i) => { sections[s.mood] = sectionResults[i] as TrendingMovie[]; });
      setMoodSections(sections);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(e.target as Node)) {
        setMoodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!activeMood) { setMoodMovies([]); return; }
    const genreId = MOOD_GENRE_MAP[activeMood];
    if (!genreId) { setMoodMovies([]); return; }
    getMoviesByGenre(genreId).then(setMoodMovies);
  }, [activeMood]);

  return (
    <div className="font-dm-sans bg-[#161210] min-h-screen text-[#EEEAE2]">
      <Header variant="dark" />
      <MobileNavTabs dark />

      <div className="mx-auto w-full 2xl:max-w-7xl px-6 lg:px-10 sm:pt-8 pb-16">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-plus-jakarta font-extrabold text-3xl text-[#EEEAE2]">Films and Series for Every Mood</h1>
          <p className="text-sm text-[#8C7E6E] mt-1">Find your next watch based on how you want to feel.</p>
        </div>

        {/* Mood filter */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E] mb-3">Filter by mood</p>

          {/* Dropdown — mobile only */}
          <div className="sm:hidden relative" ref={moodDropdownRef}>
            <button
              onClick={() => setMoodDropdownOpen(o => !o)}
              className={`flex items-center justify-between w-full border rounded-full text-xs font-semibold px-3 py-1.5 transition-all ${
                activeMood
                  ? 'bg-[#C8956A] text-[#0A0908] border-[#C8956A]'
                  : 'bg-transparent border-[#2A2520] text-[#8C7E6E]'
              }`}
            >
              <span>{activeMood ?? 'Pick your mood'}</span>
              <span className="ml-2 text-[10px]">▾</span>
            </button>

            {moodDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-full bg-[#0D0B09] border border-[#2A2520] rounded-2xl overflow-hidden z-20 shadow-xl max-h-64 overflow-y-auto">
                <button
                  onClick={() => { setActiveMood(null); setMoodDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                    !activeMood ? 'text-[#C8956A]' : 'text-[#8C7E6E] hover:text-[#EEEAE2] hover:bg-[#1E1B18]'
                  }`}
                >
                  All moods
                </button>
                {MOODS.map(mood => (
                  <button
                    key={mood}
                    onClick={() => { setActiveMood(mood); setMoodDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                      activeMood === mood
                        ? 'text-[#C8956A]'
                        : 'text-[#8C7E6E] hover:text-[#EEEAE2] hover:bg-[#1E1B18]'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pills — sm and above */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {MOODS.map(mood => (
              <button
                key={mood}
                onClick={() => setActiveMood(activeMood === mood ? null : mood)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeMood === mood
                    ? 'bg-[#C8956A] text-[#0A0908] border-[#C8956A]'
                    : 'border-[#2A2520] text-[#8C7E6E] hover:border-[#C8956A]/50 hover:text-[#C8956A]'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Active mood results */}
        {activeMood && moodMovies.length > 0 && (
          <section className="mb-12">
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-1">Mood match</p>
              <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">{`Feels like "${activeMood}"`}</h2>
              <p className="text-xs text-[#8C7E6E] mt-1">Curated by mood — not ranked by popularity</p>
            </div>
            <HorizontalRow>
              {moodMovies.map(m => (
                <MovieCard key={m.id} id={m.id} title={m.title} posterPath={m.poster_path} mediaType="movie" />
              ))}
            </HorizontalRow>
          </section>
        )}

        {/* Recent Talked About */}
        {!loading && mostReacted.length > 0 && (
          <section className="mb-12">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-1">Community</p>
                <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Recent Talked About</h2>
                <p className="text-xs text-[#8C7E6E] mt-1">Ranked by reactions from our community</p>
              </div>
              <Link href="/feed" className="text-xs font-semibold text-[#C8956A] hover:text-[#E8A870] transition-colors flex-shrink-0 mb-1">
                Browse the feed →
              </Link>
            </div>
            <HorizontalRow>
              {mostReacted.map(m => (
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

        {/* Trending Films */}
        <section className="mb-12">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-1">Worldwide</p>
            <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Trending Films</h2>
            <p className="text-xs text-[#8C7E6E] mt-1">Popular this week</p>
          </div>
          {loading ? <RowSkeleton /> : (
            <HorizontalRow>
              {trendingMovies.map(m => (
                <MovieCard key={m.id} id={m.id} title={m.title} posterPath={m.poster_path} mediaType="movie" />
              ))}
            </HorizontalRow>
          )}
        </section>

        {/* Trending Series */}
        <section className="mb-12">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-1">Worldwide</p>
            <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Trending Series</h2>
            <p className="text-xs text-[#8C7E6E] mt-1">Popular this week</p>
          </div>
          {loading ? <RowSkeleton /> : (
            <HorizontalRow>
              {trendingTV.map(m => (
                <MovieCard key={m.id} id={m.id} title={m.name} posterPath={m.poster_path} mediaType="tv" />
              ))}
            </HorizontalRow>
          )}
        </section>

      </div>
    </div>
  );
}
