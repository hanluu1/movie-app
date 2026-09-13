'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AllPost, CreatePostModal } from '@/modules/user-post';
import { Header } from '@/components/layout';
import { SignInPrompt } from '@/components/ui/sign-in-prompt';
import { useAuthUser } from '@/hooks/use-auth-user';
import TrendingView from './components/trending-view';

type View = 'feed' | 'trending';
type Filter = 'all' | 'movies' | 'tv';
type Sort = 'created_at' | 'upvotes';

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movies' },
  { label: 'TV Shows', value: 'tv' },
];

const SORTS: { label: string; value: Sort }[] = [
  { label: 'Recent', value: 'created_at' },
  { label: 'Popular', value: 'upvotes' },
];

export default function DiscoverPage () {
  const postRef = useRef<{ refetch: () => void } | null>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [preselectedMovie, setPreselectedMovie] = useState<{ id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string } | null>(null);
  const [authPromptAction, setAuthPromptAction] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('feed');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [activeSort, setActiveSort] = useState<Sort>('created_at');
  const { user } = useAuthUser();

  const requireAuth = (action: string) => {
    if (user) return true;
    setAuthPromptAction(action);
    return false;
  };

  const openReview = (movie?: { id: number; title: string; name: string; overview: string; poster_path: string; release_date?: string }) => {
    if (!requireAuth('share your take')) return;
    setPreselectedMovie(movie ?? null);
    setShowCreatePostModal(true);
  };

  return (
    <div className="font-dm-sans bg-[#FAF7F1] min-h-screen text-[#172526]">
      <Header onCreatePost={() => openReview()} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Page heading */}
        <div className="mb-2">
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-[#2A4649]">Discover</p>
          <h1 className="font-plus-jakarta font-extrabold text-[clamp(1.75rem,4vw,2.25rem)] tracking-tight text-[#172526]">
            {activeView === 'feed' ? 'What people are feeling' : 'Trending right now'}
          </h1>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-6 border-b border-[#E8EEEA] pb-0">
          {(['feed', 'trending'] as View[]).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`pb-3 px-1 text-sm font-semibold transition-all border-b-2 -mb-px capitalize ${
                activeView === view
                  ? 'border-[#2A4649] text-[#172526]'
                  : 'border-transparent text-[#6F8C88] hover:text-[#172526]'
              }`}
            >
              {view === 'feed' ? 'Feed' : 'Trending'}
            </button>
          ))}
        </div>

        {/* Feed view */}
        {activeView === 'feed' && (
          <>
            {/* Filter + Sort row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {FILTERS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setActiveFilter(value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      activeFilter === value
                        ? 'bg-[#2A4649] text-white'
                        : 'bg-[#FFFDF8] border border-[#E8EEEA] text-[#2A4649] hover:border-[#2A4649]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {SORTS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setActiveSort(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeSort === value
                        ? 'bg-[#EEF2ED] text-[#2A4649]'
                        : 'text-[#6F8C88] hover:text-[#2A4649]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt card — non-authed */}
            {!user && (
              <div className="mb-6 p-4 rounded-2xl border border-[#E8EEEA] bg-[#FFFDF8] flex items-center justify-between gap-4">
                <p className="text-sm text-[#3F5E5A]">
                  Watched something lately?{' '}
                  <span className="font-semibold text-[#172526]">Share how it made you feel.</span>
                </p>
                <Link href="/login" className="flex-shrink-0">
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2A4649] text-white whitespace-nowrap transition-all hover:-translate-y-0.5">
                    Join to share
                  </button>
                </Link>
              </div>
            )}

            <AllPost
              ref={postRef}
              isAuthed={!!user}
              requireAuth={requireAuth}
              filter={activeFilter}
              sort={activeSort}
            />
          </>
        )}

        {/* Trending view */}
        {activeView === 'trending' && (
          <TrendingView onReview={openReview} />
        )}

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

      <SignInPrompt
        isOpen={authPromptAction !== null}
        onClose={() => setAuthPromptAction(null)}
        action={authPromptAction ?? undefined}
      />
    </div>
  );
}
