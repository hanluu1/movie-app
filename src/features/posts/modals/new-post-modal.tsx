'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchMoviesAndTv } from '@/lib/tmdb/client';

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
  genre_ids?: number[];
}

export const CreatePostModal = ({ isOpen, onClose, onCreated, preselectedMovie }: CreatePostModalProps) => {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [containsSpoilers, setContainsSpoilers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMovie(null);
      setReviewTitle('');
      setReviewContent('');
      setContainsSpoilers(false);
    } else if (preselectedMovie) {
      setSelectedMovie(preselectedMovie);
      setStep(2);
    }
  }, [isOpen, preselectedMovie]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); return; }
      const results = await searchMoviesAndTv(searchQuery);
      setSearchResults(results);
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!reviewTitle.trim() || reviewContent.length < 50 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const movieName = selectedMovie?.title || selectedMovie?.name || null;
      const movieImage = selectedMovie?.poster_path
        ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
        : null;
      const mediaType = selectedMovie
        ? (selectedMovie.title ? 'movie' : 'tv')
        : null;
      await supabase.from('posts').insert({
        title: reviewTitle,
        content: reviewContent,
        movie_title: movieName,
        movie_image: movieImage,
        media_type: mediaType,
        movie_id: selectedMovie?.id ?? null,
        user_id: user.id,
      });
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canContinue = step === 1 ? !!selectedMovie : reviewTitle.trim().length > 0 && reviewContent.length >= 50;
  const displayTitle = selectedMovie?.title || selectedMovie?.name || '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-[#172526]/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#FFFDF8] w-full sm:max-w-lg max-h-[92dvh] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col border border-[#E8EEEA]">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-[#E8EEEA] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#2A4649] mb-0.5">
              {step === 1 ? 'Step 1 of 2' : step === 2 ? 'Step 2 of 2' : ''}
            </p>
            <h2 className="font-plus-jakarta font-extrabold text-xl tracking-tight text-[#172526]">
              {step === 1 && 'Pick a movie or show'}
              {step === 2 && 'Write what it made you feel'}
              {step === 'success' && 'Feeling shared!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6F8C88] hover:text-[#172526] hover:bg-[#EEF2ED] transition-all"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {step !== 'success' && (
          <div className="flex gap-1.5 px-6 pt-4 flex-shrink-0">
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-[#2A4649]' : 'bg-[#E8EEEA]'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step === 2 ? 'bg-[#2A4649]' : 'bg-[#E8EEEA]'}`} />
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">

          {/* Step 1 — Movie search */}
          {step === 1 && (
            <div>
              <p className="text-sm text-[#6F8C88] mb-4">
                Search for the movie or show that stayed with you.
              </p>
              <div className="relative mb-5">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F8C88] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search movies or shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#E8EEEA] focus:border-[#2A4649] bg-white rounded-xl text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(42,70,73,0.08)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                {searchResults.length === 0 && searchQuery.trim() === '' && (
                  <p className="text-center text-[#6F8C88] text-sm py-10">Start typing to find something...</p>
                )}
                {searchResults.map((movie) => {
                  const isSelected = selectedMovie?.id === movie.id;
                  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
                  const title = movie.title || movie.name;
                  return (
                    <button
                      key={movie.id}
                      onClick={() => setSelectedMovie(isSelected ? null : movie)}
                      className={`flex gap-3 p-3 border rounded-xl text-left w-full transition-all ${
                        isSelected
                          ? 'border-[#2A4649] bg-[#EEF2ED]'
                          : 'border-[#E8EEEA] bg-white hover:border-[#2A4649] hover:bg-[#F9F6EF]'
                      }`}
                    >
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={title}
                          width={44}
                          height={66}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-[66px] rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-[#EEF2ED]">
                          🎬
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="font-semibold text-sm text-[#172526] truncate">{title}</div>
                        {year && <div className="text-xs text-[#6F8C88] mt-0.5">{year}</div>}
                        {!movie.title && <div className="text-[10px] text-[#2A4649] font-semibold mt-1">TV Show</div>}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2A4649] flex items-center justify-center self-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Feeling form */}
          {step === 2 && (
            <div>
              {/* Selected movie pill */}
              {selectedMovie && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EEF2ED] border border-[#E8EEEA] mb-6">
                  {selectedMovie.poster_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`}
                      alt={displayTitle}
                      width={32}
                      height={48}
                      className="rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <div className="text-xs text-[#6F8C88]">You&rsquo;re writing about</div>
                    <div className="text-sm font-semibold text-[#172526]">{displayTitle}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#172526] mb-2" htmlFor="reviewTitle">
                    Give it a title
                  </label>
                  <input
                    id="reviewTitle"
                    type="text"
                    placeholder="Sum up your feeling in one line..."
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E8EEEA] focus:border-[#2A4649] bg-white rounded-xl text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(42,70,73,0.08)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#172526] mb-2" htmlFor="reviewContent">
                    What did it make you feel?
                  </label>
                  <textarea
                    id="reviewContent"
                    placeholder="Write freely — no critic templates, no star ratings. Just how it made you feel and why..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E8EEEA] focus:border-[#2A4649] bg-white rounded-xl text-sm outline-none transition-all resize-none min-h-[140px] leading-relaxed focus:shadow-[0_0_0_3px_rgba(42,70,73,0.08)]"
                  />
                  <div className={`text-right text-xs mt-1.5 ${reviewContent.length < 50 ? 'text-[#6F8C88]' : 'text-[#2A4649]'}`}>
                    {reviewContent.length < 50
                      ? `${50 - reviewContent.length} more characters to go`
                      : `${reviewContent.length} characters`}
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3.5 bg-[#F9F6EF] hover:bg-[#EEF2ED] rounded-xl cursor-pointer transition-colors border border-[#E8EEEA]">
                  <input
                    type="checkbox"
                    checked={containsSpoilers}
                    onChange={(e) => setContainsSpoilers(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#2A4649] flex-shrink-0"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#172526]">Contains spoilers</div>
                    <div className="text-xs text-[#6F8C88] mt-0.5">Check if your reaction reveals plot details</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl bg-[#EEF2ED]">
                ✨
              </div>
              <h3 className="font-plus-jakarta font-extrabold text-xl text-[#172526] mb-2">
                Your feeling is out there.
              </h3>
              <p className="text-sm text-[#6F8C88] leading-relaxed mb-8">
                Someone will read this and feel less alone about what they watched.
              </p>
              <button
                onClick={() => { onCreated(); onClose(); }}
                className="px-8 py-3 rounded-xl font-semibold text-sm text-white bg-[#2A4649] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Back to the feed
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-5 border-t border-[#E8EEEA] flex gap-3 flex-shrink-0">
            <button
              onClick={() => step === 2 ? setStep(1) : onClose()}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-[#2A4649] bg-[#F9F6EF] border border-[#E8EEEA] hover:bg-[#EEF2ED] transition-all"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={() => step === 1 ? setStep(2) : handleSubmit()}
              disabled={!canContinue || isSubmitting}
              className="flex-1 py-3 rounded-xl font-semibold text-sm text-white bg-[#2A4649] transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              {step === 1 ? 'Continue' : isSubmitting ? 'Sharing…' : 'Share Feeling'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
