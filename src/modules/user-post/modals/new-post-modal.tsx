'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchMoviesAndTv } from '@/utils/tmdb';

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
      await supabase.from('posts').insert({
        title: reviewTitle,
        content: reviewContent,
        movie_title: movieName,
        movie_image: movieImage,
        user_id: user.id,
      });
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canContinue = step === 1 ? !!selectedMovie : reviewTitle.trim().length > 0 && reviewContent.length >= 50;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-stone-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="reel-modal bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
          <h2 className="font-archivo-black text-[1.75rem] tracking-tight font-black text-stone-900">
            Add Your Review
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 border-none cursor-pointer transition-all duration-300 hover:rotate-90"
          >
            <XMarkIcon className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 overflow-y-auto flex-1">
          {step !== 'success' && (
            <div className="flex gap-2 mb-8">
              <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step === 2 ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-stone-200'}`} />
            </div>
          )}

          {/* Step 1 — Movie search */}
          {step === 1 && (
            <div>
              <div className="relative mb-6">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search for a movie or show..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base outline-none transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.1)]"
                />
              </div>

              <div className="flex flex-col gap-3">
                {searchResults.length === 0 && searchQuery.trim() === '' && (
                  <p className="text-center text-stone-400 text-sm py-8">Search for a movie or show to get started</p>
                )}
                {searchResults.map((movie) => {
                  const isSelected = selectedMovie?.id === movie.id;
                  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
                  const displayTitle = movie.title || movie.name;
                  return (
                    <button
                      key={movie.id}
                      onClick={() => setSelectedMovie(isSelected ? null : movie)}
                      className={`flex gap-4 p-4 border-2 rounded-xl text-left cursor-pointer w-full bg-transparent transition-all duration-[250ms] hover:translate-x-1 ${
                        isSelected
                          ? 'border-red-600 bg-gradient-to-br from-red-100 to-orange-200'
                          : 'border-stone-200 hover:border-red-600 hover:bg-stone-50'
                      }`}
                    >
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={displayTitle}
                          width={60}
                          height={90}
                          className="rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-[60px] h-[90px] rounded-lg flex items-center justify-center text-3xl flex-shrink-0 bg-gradient-to-br from-red-100 to-orange-200">
                          🎬
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-stone-900 mb-1 truncate">{displayTitle}</div>
                        {year && <div className="text-stone-500 text-sm mb-2">{year}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2 — Review form */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <label className="block font-bold text-base text-stone-900 mb-3" htmlFor="reviewTitle">Review title</label>
                <input
                  id="reviewTitle"
                  type="text"
                  placeholder="Sum up your review in one line..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base font-semibold outline-none transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(220,38,38,0.1)]"
                />
              </div>

              <div className="mb-8">
                <label className="block font-bold text-base text-stone-900 mb-3" htmlFor="reviewContent">Your thoughts</label>
                <textarea
                  id="reviewContent"
                  placeholder="Share your thoughts about this movie..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base outline-none transition-all duration-200 resize-y min-h-[150px] leading-[1.7] focus:shadow-[0_0_0_4px_rgba(220,38,38,0.1)]"
                />
                <div className={`text-right text-sm mt-2 ${reviewContent.length < 50 ? 'text-orange-600' : 'text-stone-500'}`}>
                  {reviewContent.length} / 500 characters (minimum 50)
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-stone-50 hover:bg-stone-100 rounded-xl cursor-pointer transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={containsSpoilers}
                    onChange={(e) => setContainsSpoilers(e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-red-600 flex-shrink-0"
                  />
                  <div>
                    <div className="text-stone-700 text-sm font-medium">Contains spoilers</div>
                    <div className="text-stone-500 text-xs mt-0.5">Check this if your review reveals plot details</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Success */}
          {step === 'success' && (
            <div className="text-center py-12 px-4">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center text-5xl bg-gradient-to-br from-red-100 to-orange-200 animate-[reelSuccessScale_0.5s_cubic-bezier(0.4,0,0.2,1)]">
                ✨
              </div>
              <h3 className="font-archivo-black text-[2rem] tracking-tight font-black text-stone-900 mb-4">
                Review Posted!
              </h3>
              <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                Your review has been shared with the community. Thanks for contributing!
              </p>
              <button
                onClick={() => { onCreated(); onClose(); }}
                className="px-8 py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer bg-gradient-to-br from-red-600 to-orange-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
              >
                Back to Feed
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-8 py-6 border-t border-stone-100 flex gap-4 flex-shrink-0">
            <button
              onClick={() => step === 2 ? setStep(1) : onClose()}
              className="flex-1 py-4 rounded-xl font-bold text-base text-stone-700 bg-white border-2 border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all duration-300 cursor-pointer"
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={() => step === 1 ? setStep(2) : handleSubmit()}
              disabled={!canContinue || isSubmitting}
              className="flex-1 py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-red-600 to-orange-600 shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_20px_rgba(220,38,38,0.35)]"
            >
              {step === 1 ? 'Continue' : isSubmitting ? 'Posting…' : 'Post Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
