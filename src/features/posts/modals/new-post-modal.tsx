'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { XMarkIcon, MagnifyingGlassIcon, FilmIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useMovieSearch } from '@/hooks/use-movie-search';
import { FeelingMoodSelect } from '@/components/ui/feeling-mood-select';
import { BRAND_COLOR, getFeeling } from '@/lib/moods';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  preselectedMovie?: MovieResult;
}

interface MovieResult {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

const getYear = (m: MovieResult) => (m.release_date || m.first_air_date || '').slice(0, 4);

export const CreatePostModal = ({ isOpen, onClose, onCreated, preselectedMovie }: CreatePostModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { results: searchResults, loading: searching } = useMovieSearch(searchQuery);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedMovie(null);
      setReviewContent('');
      setSelectedMoods([]);
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      return;
    }
    if (preselectedMovie) setSelectedMovie(preselectedMovie);
    // Land the cursor where the user needs to type next
    setTimeout(() => (preselectedMovie ? textareaRef.current : searchRef.current)?.focus(), 50);
  }, [isOpen, preselectedMovie]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const pickMovie = (movie: MovieResult) => {
    setSelectedMovie(movie);
    setSearchQuery('');
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedMovie || !reviewContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You need to be signed in to post.');
        return;
      }

      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, imageFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(path);
          imageUrl = publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('posts').insert({
        title: '',
        content: reviewContent,
        movie_title: selectedMovie.title || selectedMovie.name || null,
        movie_image: selectedMovie.poster_path
          ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
          : null,
        media_type: selectedMovie.title ? 'movie' : 'tv',
        movie_id: selectedMovie.id,
        mood: selectedMoods,
        user_id: user.id,
        image_url: imageUrl,
      });

      if (insertError) {
        setError('Couldn’t post that. Try again in a sec.');
        return;
      }
      onCreated();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const feeling = getFeeling(selectedMoods[0]);
  const glow = feeling?.color ?? BRAND_COLOR;
  const displayTitle = selectedMovie?.title || selectedMovie?.name || '';
  const canPost = !!selectedMovie && reviewContent.trim().length > 0 && !isSubmitting;
  const showResults = searchQuery.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New yap"
        className="relative flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#120E0B] sm:max-h-[90dvh] sm:max-w-[560px] sm:rounded-3xl"
      >
        {/* Aura follows the chosen feeling */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl transition-colors duration-500"
          style={{ background: glow }}
        />
        <div aria-hidden className="film-grain pointer-events-none absolute inset-0" />

        {/* Header */}
        <div className="relative flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
          <h2 className="font-plus-jakarta text-xl font-extrabold tracking-tight text-[#EEEAE2]">
            New <span className="shimmer-text">yap</span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press flex h-9 w-9 items-center justify-center rounded-full text-[#B8AA98] transition-colors hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="relative flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">

          {/* 1. Show */}
          <section aria-label="What you watched">
            {selectedMovie ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 pr-3">
                {selectedMovie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`}
                    alt=""
                    width={36}
                    height={54}
                    className="shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-[54px] w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <FilmIcon className="h-4 w-4 text-[#B8AA98]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-[#B8AA98]">Yapping about</p>
                  <p className="truncate text-sm font-bold text-white">{displayTitle}</p>
                  <p className="text-xs text-[#B8AA98]">
                    {[getYear(selectedMovie), selectedMovie.title ? 'Movie' : 'TV show'].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {!preselectedMovie && (
                  <button
                    type="button"
                    onClick={() => { setSelectedMovie(null); setTimeout(() => searchRef.current?.focus(), 50); }}
                    className="press shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/90 hover:bg-white/10"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="relative">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B8AA98]" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What did you watch? 🎬"
                    aria-label="Search for a movie or show"
                    className="w-full rounded-2xl border border-white/15 bg-white/[0.05] py-3.5 pl-12 pr-4 text-base text-white outline-none transition-colors placeholder:text-[#B8AA98] focus:border-[#F5A623]/70"
                  />
                </div>

                {showResults && (
                  <ul className="mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-black/30">
                    {searching && searchResults.length === 0 && (
                      <li className="px-4 py-4 text-sm text-[#B8AA98]">Searching…</li>
                    )}
                    {!searching && searchResults.length === 0 && (
                      <li className="px-4 py-4 text-sm text-[#B8AA98]">
                        Nothing found for &ldquo;{searchQuery.trim()}&rdquo;. Try a different spelling.
                      </li>
                    )}
                    {searchResults.slice(0, 8).map((movie) => (
                      <li key={`${movie.title ? 'm' : 't'}-${movie.id}`}>
                        <button
                          type="button"
                          onClick={() => pickMovie(movie)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
                        >
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt=""
                              width={32}
                              height={48}
                              className="shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-white/10">
                              <FilmIcon className="h-4 w-4 text-[#B8AA98]" />
                            </div>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white">{movie.title || movie.name}</span>
                            <span className="text-xs text-[#B8AA98]">
                              {[getYear(movie), movie.title ? 'Movie' : 'TV show'].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>

          {/* 2. The yap */}
          <section aria-label="Your yap">
            <textarea
              ref={textareaRef}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="how did it hit you? yap it out…"
              aria-label="Your yap"
              rows={5}
              className="min-h-[140px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xl font-bold leading-snug text-white outline-none transition-[border-color,box-shadow] placeholder:font-semibold placeholder:text-[#B8AA98] focus:border-transparent"
              style={{ boxShadow: `0 0 0 1px ${glow}55` }}
            />

            {imagePreview && (
              <div className="relative mt-3 h-48 w-full overflow-hidden rounded-2xl border border-white/10">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="press absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <label className="press inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/90 transition-colors hover:bg-white/10">
                <PhotoIcon className="h-4 w-4" />
                {imagePreview ? 'Change photo' : 'Add photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <span className="text-xs text-[#B8AA98]">{reviewContent.length}</span>
            </div>
          </section>

          {/* 3. Feeling (optional) */}
          <section aria-label="How it hit you">
            <p className="text-sm font-bold text-[#EEEAE2]">
              How did it hit? <span className="font-medium text-[#B8AA98]">(optional)</span>
            </p>
            <FeelingMoodSelect value={selectedMoods} onChange={setSelectedMoods} />
          </section>
        </div>

        {/* Footer CTA */}
        <div className="relative shrink-0 border-t border-white/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
          {error && <p role="alert" className="mb-2 text-sm font-semibold text-[#FF8A8A]">{error}</p>}
          {!selectedMovie && !error && (
            <p className="mb-2 text-xs text-[#B8AA98]">Pick what you watched to post.</p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canPost}
            className="press w-full rounded-2xl py-3.5 text-base font-black text-[#0D0A08] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #FFD83D, #F5A623 60%, #FF5A36)',
              boxShadow: canPost ? '0 0 24px rgba(245,166,35,0.4)' : 'none',
            }}
          >
            {isSubmitting ? 'Posting…' : 'Yap it'}
          </button>
        </div>
      </div>
    </div>
  );
};
