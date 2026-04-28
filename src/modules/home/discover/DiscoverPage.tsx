'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FireIcon, TvIcon, FilmIcon, StarIcon, PencilSquareIcon, InformationCircleIcon} from '@heroicons/react/24/outline';
import { getTrendingMovies, getTrendingTV, TrendingMovie, TrendingTV } from '@/utils/tmdb';
import { AllPost, CreatePostModal } from '@/modules/user-post';
import { WatchlistButtons } from '@/components/buttons/WatchlistButtons';
import { Header } from '@/layout';


const overlayBtnBase = 'w-full text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1';

function MediaCard ({ id, title, posterPath, year, rating, index, onReview, releaseDate }: {
  id: number;
  title: string;
  posterPath: string | null;
  year: string;
  releaseDate: string;
  rating: number;
  index: number;
  onReview: () => void;
}) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-stone-200">
      <div className="relative w-full" style={{ aspectRatio: '2/3', background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}>
        {posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="flex items-center justify-center h-full opacity-30">
            <FilmIcon className="w-10 h-10 text-stone-400" />
          </div>
        )}
        {index < 3 && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', color: '#78350F' }}>
            #{index + 1}
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
          <StarIcon className="w-2.5 h-2.5" />
          {rating.toFixed(1)}
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 p-2">
          <button onClick={onReview} className={`${overlayBtnBase} bg-white text-stone-900 hover:bg-red-50`}>
            <PencilSquareIcon className="w-3 h-3" /> Review
          </button>
          <WatchlistButtons
            movieId={id}
            title={title}
            posterPath={posterPath}
            releaseDate={releaseDate}
            variant="overlay"
          />
          <Link href={`/movie-more-info/${id}`} className={`${overlayBtnBase} text-white border border-white/30 hover:bg-white/10`}>
            <InformationCircleIcon className="w-3 h-3" /> Detail
          </Link>
        </div>
      </div>
      <div className="p-2">
        <div className="font-bold text-xs truncate text-stone-900">{title}</div>
        <div className="text-[10px] text-stone-500 mt-0.5">{year}</div>
      </div>
    </div>
  );
}

function SectionHeader ({ Icon, title }: { Icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-5 h-5 text-red-600 flex-shrink-0" />
      <h3 className="font-archivo-black text-base tracking-tight">{title}</h3>
    </div>
  );
}

export default function DiscoverPage () {
  const postRef = useRef<{ refetch: () => void } | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [preselectedMovie, setPreselectedMovie] = useState<{ id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string } | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [trending, setTrending] = useState<TrendingMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTV[]>([]);

  useEffect(() => {
    getTrendingMovies().then(setTrending);
    getTrendingTV().then(setTrendingTV);
  }, []);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const openReview = (movie?: { id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string }) => {
    setPreselectedMovie(movie ?? null);
    setShowCreatePostModal(true);
  };

  const sidebar = (
    <aside className="flex flex-col gap-8">

      {/* Trending Movies */}
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
              onReview={() => openReview({ id: movie.id, title: movie.title, name: '', overview: '', poster_path: movie.poster_path ?? '', release_date: movie.release_date })}
            />
          ))}
        </div>
      </section>

      {/* Trending TV Shows */}
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
              onReview={() => openReview({ id: show.id, title: '', name: show.name, overview: '', poster_path: show.poster_path ?? '', release_date: show.first_air_date })}
            />
          ))}
        </div>
      </section>
      
    </aside>
  );

  return (
    <div className="font-dm-sans bg-stone-50 min-h-screen text-stone-900">
      <Header onCreatePost={() => openReview()} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8">

        {/* Banner */}
        {showBanner && (
          <div className="relative rounded-2xl p-8 mb-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-archivo-black text-2xl text-white mb-1">Share Your Movie Thoughts</h2>
                <p className="text-red-100 text-sm">Help others discover great movies through your perspective.</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => openReview()}
                  className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-all"
                >
                  Share What Moves You
                </button>
                <button
                  onClick={dismissBanner}
                  className="text-white/70 hover:text-white transition-colors text-2xl leading-none font-bold"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: reviews left, sidebar right — Mobile: reviews first, sidebar below */}
        <div className="flex flex-col-reverse lg:flex-row gap-8">

          {/* Reviews — main column */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-archivo-black text-2xl sm:text-[1.75rem] tracking-tight">Discover other perspectives</h2>
            </div>
            <AllPost ref={postRef} />
          </main>

          {/* Sidebar — sticky on desktop */}
          <div className="lg:w-[340px] flex-shrink-0 lg:sticky lg:top-[90px] lg:self-start">
            {sidebar}
          </div>

        </div>
      </div>

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onCreated={() => {
          setShowCreatePostModal(false);
          postRef.current?.refetch();
        }}
        preselectedMovie={preselectedMovie ?? undefined}
      />
    </div>
  );
}
