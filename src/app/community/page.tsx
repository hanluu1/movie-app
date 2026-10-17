'use client';

import { useRef, useState, useEffect } from 'react';
import { AllPost, CreatePostModal } from '@/features/posts';
import { Header, MobileNavTabs } from '@/components/layout';
import { SignInPrompt } from '@/components/ui/sign-in-prompt';
import { useAuthUser } from '@/hooks/use-auth-user';
import { FilmIcon, TvIcon, ChevronDownIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { MOODS } from '@/lib/moods';

type Filter = 'all' | 'movies' | 'tv';
type Sort = 'created_at' | 'upvotes';

export default function CommunityPage () {
  const postRef = useRef<{ refetch: () => void } | null>(null);
  const moodRef = useRef<HTMLDivElement>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [activeSort, setActiveSort] = useState<Sort>('created_at');
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [moodOpen, setMoodOpen] = useState(false);
  const { user } = useAuthUser();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moodRef.current && !moodRef.current.contains(e.target as Node)) {
        setMoodOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const requireAuth = (action: string) => {
    if (user) return true;
    setAuthPromptAction(action);
    return false;
  };

  const openReview = () => {
    if (!requireAuth('share your take')) return;
    setShowCreatePostModal(true);
  };

  const selectMood = (mood: string) => {
    setActiveMood(mood);
    setMoodOpen(false);
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setActiveSort('created_at');
    setActiveMood(null);
    setMoodOpen(false);
  };

  const hasActiveFilters = activeFilter !== 'all' || activeSort !== 'created_at' || activeMood !== null;

  const filterButtonClass = (isActive: boolean) => `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all border ${
    isActive
      ? 'bg-[#EEEAE2] text-[#0A0908] border-[#EEEAE2]'
      : 'border-[#272320] text-[#8C7E6E] hover:border-[#3A3530] hover:text-[#EEEAE2]'
  }`;

  const typeFilters = (
    <>
      <button onClick={() => setActiveFilter('all')} className={filterButtonClass(activeFilter === 'all')}>
        All
      </button>
      <button
        onClick={() => setActiveFilter('movies')}
        className={filterButtonClass(activeFilter === 'movies')}
      >
        <FilmIcon className="w-3.5 h-3.5 text-[#C8956A]" />
        Movies
      </button>
      <button
        onClick={() => setActiveFilter('tv')}
        className={filterButtonClass(activeFilter === 'tv')}
      >
        <TvIcon className="w-3.5 h-3.5 text-[#C8956A]" />
        TV shows
      </button>
    </>
  );

  const sortFilters = (
    <div className="flex items-center gap-1 rounded-full border border-[#272320] p-1">
      <button
        onClick={() => setActiveSort('created_at')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          activeSort === 'created_at' ? 'bg-[#EEEAE2] text-[#0A0908]' : 'text-[#8C7E6E] hover:text-[#EEEAE2]'
        }`}
      >
        Newest
      </button>
      <button
        onClick={() => setActiveSort('upvotes')}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          activeSort === 'upvotes' ? 'bg-[#EEEAE2] text-[#0A0908]' : 'text-[#8C7E6E] hover:text-[#EEEAE2]'
        }`}
      >
        Most reactions
      </button>
    </div>
  );

  return (
    <div className="font-dm-sans bg-[#161210] min-h-screen text-[#EEEAE2]">
      <Header
        onCreatePost={() => openReview()}
        variant="dark"
      />
      <MobileNavTabs dark />

      <div className="mx-auto w-full 2xl:max-w-7xl px-6 lg:px-10 sm:pt-6 pb-16">

        <div className="mb-6">
          <h1 className="font-plus-jakarta font-extrabold text-3xl text-[#EEEAE2]">Community reactions</h1>
          <p className="text-sm text-[#8C7E6E] mt-1">See what people felt about the movies and shows they watched.</p>
        </div>

        {/* Write prompt bar */}
        <button
          onClick={openReview}
          className="w-full flex items-center gap-3 px-4 py-3.5 mb-5 rounded-2xl bg-[#1E1B18] border-l-4 border-l-transparent hover:border-l-[#C8956A] border border-[#2A2520] hover:border-[#2A2520] transition-all text-left group"
        >
          <span className="flex-1 text-sm text-[#8C7E6E] group-hover:text-[#EEEAE2] transition-colors">
            What did a movie make you feel lately?
          </span>
          <div className="flex items-center gap-1.5 text-[#C8956A] group-hover:text-[#E8A870] transition-colors flex-shrink-0">
            <PencilSquareIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">Share a reaction</span>
          </div>
        </button>

        <div className="mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Filter reactions</p>
          <div className="flex flex-wrap items-center gap-2">
            {typeFilters}
            <div className="relative" ref={moodRef}>
              <button
                onClick={() => activeMood ? setActiveMood(null) : setMoodOpen(o => !o)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border whitespace-nowrap ${
                  activeMood
                    ? 'bg-[#C8956A] text-[#0A0908] border-[#C8956A]'
                    : 'border-[#C8956A]/40 text-[#C8956A] hover:border-[#C8956A] hover:bg-[#C8956A]/10'
                }`}
              >
                {activeMood ? (
                  <>
                    <span className="max-w-[160px] truncate">Feeling: {activeMood}</span>
                    <XMarkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <span>Filter by feeling</span>
                    <ChevronDownIcon className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${moodOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Mood dropdown panel */}
              {moodOpen && (
                <div className="absolute top-full mt-2 left-0 z-50 w-72 bg-[#111009] border border-[#272320] rounded-2xl p-3 shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A4038] px-1 mb-2">
                    Pick a feeling
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MOODS.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => selectMood(mood)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#272320] text-[#8C7E6E] hover:border-[#C8956A] hover:text-[#C8956A] transition-all"
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Sort by</span>
          {sortFilters}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-[#8C7E6E]">Showing:</span>
            {activeFilter !== 'all' && (
              <button onClick={() => setActiveFilter('all')} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C8956A]/15 text-[#C8956A]">
                {activeFilter === 'movies' ? 'Movies' : 'TV shows'} <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            {activeMood && (
              <button onClick={() => setActiveMood(null)} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C8956A]/15 text-[#C8956A]">
                {activeMood} <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            {activeSort === 'upvotes' && (
              <button onClick={() => setActiveSort('created_at')} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C8956A]/15 text-[#C8956A]">
                Most reactions <XMarkIcon className="w-3 h-3" />
              </button>
            )}
            <button onClick={clearFilters} className="text-xs font-semibold text-[#8C7E6E] hover:text-[#EEEAE2] transition-colors">
              Clear filters
            </button>
          </div>
        )}

        <AllPost
          ref={postRef}
          isAuthed={!!user}
          requireAuth={requireAuth}
          filter={activeFilter}
          sort={activeSort}
          activeMood={activeMood}
          onWriteClick={openReview}
        />
      </div>

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onCreated={() => {
          setShowCreatePostModal(false);
          postRef.current?.refetch();
        }}
      />

      <SignInPrompt
        isOpen={authPromptAction !== null}
        onClose={() => setAuthPromptAction(null)}
        action={authPromptAction ?? undefined}
      />
    </div>
  );
}
