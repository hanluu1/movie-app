'use client';

import { useRef, useState, useEffect } from 'react';
import { AllPost, CreatePostModal } from '@/features/posts';
import { Header } from '@/components/layout';
import { SignInPrompt } from '@/components/ui/sign-in-prompt';
import { useAuthUser } from '@/hooks/use-auth-user';
import { FilmIcon, TvIcon, ChevronDownIcon, XMarkIcon, FireIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { MOODS } from '@/lib/moods';

type Filter = 'all' | 'movies' | 'tv';
type Sort = 'created_at' | 'upvotes';

export default function DiscoverPage () {
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

  const typeFilters = (
    <>
      <button
        onClick={() => setActiveFilter(f => f === 'movies' ? 'all' : 'movies')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
          activeFilter === 'movies'
            ? 'bg-[#F2EDE4] text-[#0A0908] border-[#F2EDE4]'
            : 'border-[#272320] text-[#6A5E50] hover:border-[#3A3530] hover:text-[#F2EDE4]'
        }`}
      >
        <FilmIcon className="w-3.5 h-3.5 text-[#C8956A]" />
        Movies
      </button>
      <button
        onClick={() => setActiveFilter(f => f === 'tv' ? 'all' : 'tv')}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
          activeFilter === 'tv'
            ? 'bg-[#F2EDE4] text-[#0A0908] border-[#F2EDE4]'
            : 'border-[#272320] text-[#6A5E50] hover:border-[#3A3530] hover:text-[#F2EDE4]'
        }`}
      >
        <TvIcon className="w-3.5 h-3.5 text-[#C8956A]" />
        TV
      </button>
    </>
  );

  return (
    <div className="font-dm-sans bg-[#161210] min-h-screen text-[#F2EDE4]">
      <Header
        onCreatePost={() => openReview()}
        variant="dark"
      />

      <div className="mx-auto w-full 2xl:max-w-7xl px-6 lg:px-10 pt-6 pb-16">

        {/* Write prompt bar */}
        <button
          onClick={openReview}
          className="w-full flex items-center gap-3 px-4 py-3.5 mb-5 rounded-2xl bg-[#1E1B18] border-l-4 border-l-transparent hover:border-l-[#C8956A] border border-[#2A2520] hover:border-[#2A2520] transition-all text-left group"
        >
          <span className="flex-1 text-sm text-[#6A5E50] group-hover:text-[#F2EDE4] transition-colors">
            What did a movie make you feel lately?
          </span>
          <div className="flex items-center gap-1.5 text-[#C8956A] group-hover:text-[#E8A870] transition-colors flex-shrink-0">
            <PencilSquareIcon className="w-4 h-4" />
            <span className="text-xs font-semibold">Write</span>
          </div>
        </button>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">

          {/* Row 1 (mobile) / Left (desktop): mood + type filters */}
          <div className="flex items-center gap-2 flex-1">

            {/* Mood dropdown */}
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
                    <span className="max-w-[140px] truncate">{activeMood}</span>
                    <XMarkIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    <span>I&apos;m in the mood for...</span>
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
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#272320] text-[#6A5E50] hover:border-[#C8956A] hover:text-[#C8956A] transition-all"
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              {typeFilters}
            </div>

    
          </div>

          {/* Row 2 (mobile) / Right (desktop): type + popular */}
          <div className="flex sm:hidden items-center gap-2">
            {typeFilters}
            <button
              onClick={() => setActiveSort(s => s === 'upvotes' ? 'created_at' : 'upvotes')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeSort === 'upvotes'
                  ? 'bg-[#F2EDE4] text-[#0A0908] border-[#F2EDE4]'
                  : 'border-[#272320] text-[#6A5E50] hover:border-[#3A3530] hover:text-[#F2EDE4]'
              }`}
            >
              <FireIcon className="w-3.5 h-3.5 text-[#C8956A]" />
              Popular
            </button>
          </div>

          {/* Popular — desktop only (already in row 2 on mobile) */}
          <button
            onClick={() => setActiveSort(s => s === 'upvotes' ? 'created_at' : 'upvotes')}
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border flex-shrink-0 ${
              activeSort === 'upvotes'
                ? 'bg-[#F2EDE4] text-[#0A0908] border-[#F2EDE4]'
                : 'border-[#272320] text-[#6A5E50] hover:border-[#3A3530] hover:text-[#F2EDE4]'
            }`}
          >
            <FireIcon className="w-3.5 h-3.5 text-[#C8956A]" />
            Popular
          </button>

        </div>

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
