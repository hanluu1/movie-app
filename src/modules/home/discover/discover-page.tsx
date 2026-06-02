'use client';

import { useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AllPost, CreatePostModal } from '@/modules/user-post';
import { Header } from '@/components/layout';
import Sidebar from './components/sidebar';

export default function DiscoverPage () {
  const postRef = useRef<{ refetch: () => void } | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [preselectedMovie, setPreselectedMovie] = useState<{ id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string } | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  const openReview = (movie?: { id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string }) => {
    setPreselectedMovie(movie ?? null);
    setShowCreatePostModal(true);
  };

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
                  onClick={() => setShowBanner(false)}
                  className="text-white/70 hover:text-white transition-colors w-5 h-5 cursor-pointer flex-shrink-0"
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop: reviews left, sidebar right — Mobile: sidebar, reviews */}
        <div className="flex flex-col-reverse lg:flex-row gap-8">

          {/* Reviews — main column */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-archivo-black text-2xl sm:text-[1.75rem] tracking-tight">Community Thoughts</h2>
            </div>
            <AllPost ref={postRef} />
          </main>

          {/* Sidebar — sticky on desktop */}
          <div className="lg:w-[450px] flex-shrink-0 lg:sticky lg:top-[90px] lg:self-start">
            <Sidebar onReview={openReview} />
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
