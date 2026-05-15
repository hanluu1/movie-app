'use client';

import { useRef, useState, useEffect } from 'react';
import { FireIcon, TvIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getTrendingMovies, getTrendingTV, TrendingMovie, TrendingTV } from '@/utils/tmdb';
import { AllPost, CreatePostModal } from '@/modules/user-post';
import { Header } from '@/components/layout';
import MediaCard from './components/media-card';

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
          <div className="relative rounded-2xl p-8 mb-8 overflow-hidden bg-gradient-to-br from-red-600 to-orange-600">
            <div className="absolute inset-0 opacity-10 bg-[image:radial-gradient(circle,white_1px,transparent_1px)] bg-[length:28px_28px]" />
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
                <XMarkIcon
                  onClick={dismissBanner}
                  className="text-white/70 hover:text-white transition-colors w-5 h-5 cursor-pointer flex-shrink-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop: reviews left, sidebar right — Mobile: reviews first, sidebar below */}
        <div className="flex flex-col-reverse lg:flex-row gap-8">

          {/* Reviews — main column */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-archivo-black text-2xl sm:text-[1.75rem] tracking-tight">Community Thoughts</h2>
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
