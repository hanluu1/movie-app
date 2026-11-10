'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { AllPost } from '@/features/posts';
import { AppShell, useShell } from '@/components/layout';
import { FeelingPicker } from '@/components/ui/feeling-picker';
import { BRAND_COLOR, FEELINGS, type FeelingKey } from '@/lib/moods';
import { FilmIcon, TvIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Filter = 'all' | 'movies' | 'tv';
type Sort = 'created_at' | 'upvotes';

interface FeedProps {
  activeFilter: Filter;
  setActiveFilter: (f: Filter) => void;
  activeSort: Sort;
  setActiveSort: (s: Sort) => void;
  activeFeeling: FeelingKey | null;
  setActiveFeeling: (k: FeelingKey | null) => void;
  showFeelingSheet: boolean;
  setShowFeelingSheet: (open: boolean) => void;
  postRef: React.RefObject<{ refetch: () => void } | null>;
}

function CommunityFeed ({
  activeFilter, setActiveFilter, activeSort, setActiveSort,
  activeFeeling, setActiveFeeling, showFeelingSheet, setShowFeelingSheet, postRef,
}: FeedProps) {
  const { user, profile, openComposer, requireAuth } = useShell();

  const clearFilters = () => {
    setActiveFilter('all');
    setActiveSort('created_at');
    setActiveFeeling(null);
  };

  const hasActiveFilters = activeFilter !== 'all' || activeSort !== 'created_at' || activeFeeling !== null;
  const feeling = activeFeeling ? FEELINGS[activeFeeling] : null;

  return (
    <>
      <div className="mb-5">
        <h1 className="font-plus-jakarta text-3xl font-extrabold leading-tight sm:text-4xl">
          The <span className="shimmer-text">Yap</span> Feed
        </h1>
        <p className="mt-1 text-sm text-[#B8AA98]">what everyone&apos;s watching &amp; feeling rn</p>
      </div>

      {/* Composer */}
      <button
        onClick={openComposer}
        className="press group mb-5 flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left backdrop-blur-md transition-all hover:border-[#F5A623]/50 hover:bg-white/[0.07]"
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5A623] text-xs font-extrabold text-[#17110E]">
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.username} fill sizes="40px" className="object-cover" />
          ) : (
            (profile?.username || user?.email || 'You').slice(0, 2).toUpperCase()
          )}
        </span>
        <span className="flex-1 text-sm text-[#B8AA98] transition-colors group-hover:text-white">
          what are you watching? yap about it... 🎬
        </span>
        <span className="shrink-0 rounded-full bg-[#F5A623] px-4 py-1.5 text-xs font-black text-[#0D0A08]">
          Yap
        </span>
      </button>

      {/* Feelings: orbs below xl; moved to right rail at xl */}
      <div className="mb-5 xl:hidden">
        <p className="mb-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">How are you feeling?</p>
        <FeelingPicker active={activeFeeling} onChange={setActiveFeeling} />
      </div>

      {/* Type + sort */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'movies', 'tv'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`press flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeFilter === f
                  ? 'border-[#EEEAE2] bg-[#EEEAE2] text-[#0D0A08]'
                  : 'border-white/15 text-[#B8AA98] hover:border-white/30 hover:text-white'
              }`}
            >
              {f === 'movies' && <FilmIcon className="h-3 w-3" />}
              {f === 'tv' && <TvIcon className="h-3 w-3" />}
              {f === 'all' ? 'All' : f === 'movies' ? 'Movies' : 'TV shows'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-full border border-white/15 p-1">
          {(['created_at', 'upvotes'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveSort(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                activeSort === s ? 'bg-[#EEEAE2] text-[#0D0A08]' : 'text-[#B8AA98] hover:text-white'
              }`}
            >
              {s === 'created_at' ? 'Newest' : 'Most felt'}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#B8AA98]">Showing:</span>
          {activeFilter !== 'all' && (
            <button onClick={() => setActiveFilter('all')} className="flex items-center gap-1 rounded-full bg-[#F5A623]/15 px-2.5 py-1 text-xs font-bold text-[#F5A623]">
              {activeFilter === 'movies' ? 'Movies' : 'TV shows'} <XMarkIcon className="h-3 w-3" />
            </button>
          )}
          {feeling && (
            <button
              onClick={() => setActiveFeeling(null)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: `${feeling.color}22`, color: feeling.color }}
            >
              {feeling.emoji} {feeling.label} <XMarkIcon className="h-3 w-3" />
            </button>
          )}
          {activeSort === 'upvotes' && (
            <button onClick={() => setActiveSort('created_at')} className="flex items-center gap-1 rounded-full bg-[#F5A623]/15 px-2.5 py-1 text-xs font-bold text-[#F5A623]">
              Most felt <XMarkIcon className="h-3 w-3" />
            </button>
          )}
          <button onClick={clearFilters} className="text-xs font-bold text-[#B8AA98] transition-colors hover:text-white">
            Clear all
          </button>
        </div>
      )}

      <AllPost
        ref={postRef}
        isAuthed={!!user}
        requireAuth={requireAuth}
        filter={activeFilter}
        sort={activeSort}
        activeFeeling={activeFeeling}
        onWriteClick={openComposer}
      />

      {/* Mobile/tablet: feeling sheet from the Mood tab */}
      {showFeelingSheet && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="How are you feeling?">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowFeelingSheet(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-[#17120E] p-5 pb-8">
            <p className="mb-4 font-plus-jakarta text-xl font-extrabold">How are you feeling?</p>
            <FeelingPicker
              layout="grid"
              active={activeFeeling}
              onChange={(k) => { setActiveFeeling(k); setShowFeelingSheet(false); }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function CommunityPage () {
  const postRef = useRef<{ refetch: () => void } | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [activeSort, setActiveSort] = useState<Sort>('created_at');
  const [activeFeeling, setActiveFeeling] = useState<FeelingKey | null>(null);
  const [showFeelingSheet, setShowFeelingSheet] = useState(false);

  return (
    <AppShell
      glowColor={activeFeeling ? FEELINGS[activeFeeling].color : BRAND_COLOR}
      onPostCreated={() => postRef.current?.refetch()}
      onMood={() => setShowFeelingSheet(true)}
      moodActive={activeFeeling !== null}
      rightRail={
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">How are you feeling?</p>
          <FeelingPicker active={activeFeeling} onChange={setActiveFeeling} layout="grid" />
          <p className="mt-3 text-xs leading-relaxed text-[#B8AA98]">
            Pick a feeling to see yaps that hit the same way.
          </p>
        </div>
      }
    >
      <CommunityFeed
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        activeFeeling={activeFeeling}
        setActiveFeeling={setActiveFeeling}
        showFeelingSheet={showFeelingSheet}
        setShowFeelingSheet={setShowFeelingSheet}
        postRef={postRef}
      />
    </AppShell>
  );
}
