'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { searchMoviesAndTv } from '@/utils/tmdb';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
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

const TMDB_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10765: 'Sci-Fi & Fantasy',
  10759: 'Action & Adventure',
};

const RATING_LABELS = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

export const CreatePostModal = ({ isOpen, onClose, onCreated }: CreatePostModalProps) => {
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieResult | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
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
      setRating(0);
      setHoverRating(0);
      setReviewTitle('');
      setReviewContent('');
      setContainsSpoilers(false);
    }
  }, [isOpen]);

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
    <>
      <style>{`
        @keyframes reelModalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reelSuccessScale {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .reel-modal { animation: reelModalSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .reel-success-icon { animation: reelSuccessScale 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .reel-close-btn { transition: all 0.3s ease; }
        .reel-close-btn:hover { transform: rotate(90deg); }
        .reel-star { transition: color 0.15s ease, transform 0.15s ease; }
        .reel-movie-option { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .reel-movie-option:hover { transform: translateX(4px); }
        .reel-primary-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .reel-primary-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35); }
        .reel-search-input:focus { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1); }
        .reel-text-input:focus { box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1); }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-8"
        style={{ background: 'rgba(28, 25, 23, 0.6)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="reel-modal bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
          style={{ boxShadow: '0 24px 48px rgba(28, 25, 23, 0.2)' }}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
            <h2 style={{ fontFamily: "'Archivo Black', sans-serif", letterSpacing: '-0.02em', fontSize: '1.75rem', fontWeight: 900 }} className="text-stone-900">
              Add Your Review
            </h2>
            <button
              onClick={onClose}
              className="reel-close-btn w-9 h-9 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 border-none cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-8 overflow-y-auto flex-1">
            {step !== 'success' && (
              <div className="flex gap-2 mb-8">
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= 1 ? '' : 'bg-stone-200'}`}
                  style={step >= 1 ? { background: 'linear-gradient(135deg, #DC2626, #EA580C)' } : {}} />
                <div className={`flex-1 h-1 rounded-full transition-all duration-300 ${step === 2 ? '' : 'bg-stone-200'}`}
                  style={step === 2 ? { background: 'linear-gradient(135deg, #DC2626, #EA580C)' } : {}} />
              </div>
            )}

            {/* Step 1 — Movie search */}
            {step === 1 && (
              <div>
                <div className="relative mb-6">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for a movie or show..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="reel-search-input w-full pl-12 pr-4 py-4 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base outline-none transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  {searchResults.length === 0 && searchQuery.trim() === '' && (
                    <p className="text-center text-stone-400 text-sm py-8">Search for a movie or show to get started</p>
                  )}
                  {searchResults.map((movie) => {
                    const isSelected = selectedMovie?.id === movie.id;
                    const genres = (movie.genre_ids ?? []).slice(0, 3).map((id) => TMDB_GENRES[id]).filter(Boolean);
                    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
                    const displayTitle = movie.title || movie.name;
                    return (
                      <button
                        key={movie.id}
                        onClick={() => setSelectedMovie(isSelected ? null : movie)}
                        className={`reel-movie-option flex gap-4 p-4 border-2 rounded-xl text-left cursor-pointer w-full bg-transparent ${
                          isSelected
                            ? 'border-red-600'
                            : 'border-stone-200 hover:border-red-600 hover:bg-stone-50'
                        }`}
                        style={isSelected ? { background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' } : {}}
                      >
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={displayTitle}
                            className="rounded-lg object-cover flex-shrink-0"
                            style={{ width: '60px', height: '90px' }}
                          />
                        ) : (
                          <div
                            className="rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                            style={{ width: '60px', height: '90px', background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
                          >
                            🎬
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-stone-900 mb-1 truncate">{displayTitle}</div>
                          {year && <div className="text-stone-500 text-sm mb-2">{year}</div>}
                          {genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {genres.map((g) => (
                                <span key={g} className="px-2 py-0.5 bg-white border border-stone-200 rounded text-xs text-stone-600">{g}</span>
                              ))}
                            </div>
                          )}
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
                  <label className="block font-bold text-base text-stone-900 mb-3">Your rating</label>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="reel-star border-none bg-transparent cursor-pointer p-0"
                        style={{
                          fontSize: '2.5rem',
                          lineHeight: 1,
                          color: star <= (hoverRating || rating) ? '#FBBF24' : '#E7E5E4',
                          transform: star <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="text-stone-500 text-sm font-medium h-5">
                    {rating > 0 ? `${rating} out of 5 stars — ${RATING_LABELS[rating - 1]}` : ''}
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block font-bold text-base text-stone-900 mb-3" htmlFor="reviewTitle">Review title</label>
                  <input
                    id="reviewTitle"
                    type="text"
                    placeholder="Sum up your review in one line..."
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="reel-text-input w-full px-4 py-3.5 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base font-semibold outline-none transition-all duration-200"
                  />
                </div>

                <div className="mb-8">
                  <label className="block font-bold text-base text-stone-900 mb-3" htmlFor="reviewContent">Your thoughts</label>
                  <textarea
                    id="reviewContent"
                    placeholder="Share your thoughts about this movie..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="reel-text-input w-full px-4 py-4 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base outline-none transition-all duration-200 resize-y"
                    style={{ minHeight: '150px', lineHeight: '1.7' }}
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
                <div
                  className="reel-success-icon w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center"
                  style={{ fontSize: '3rem', background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
                >
                  ✨
                </div>
                <h3
                  className="text-stone-900 mb-4"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '2rem', letterSpacing: '-0.02em', fontWeight: 900 }}
                >
                  Review Posted!
                </h3>
                <p className="text-stone-600 text-lg mb-8 leading-relaxed">
                  Your review has been shared with the community. Thanks for contributing!
                </p>
                <button
                  onClick={() => { onCreated(); onClose(); }}
                  className="reel-primary-btn px-8 py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #DC2626, #EA580C)',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                  }}
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
                className="reel-primary-btn flex-1 py-4 rounded-xl font-bold text-base text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #EA580C)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
                }}
              >
                {step === 1 ? 'Continue' : isSubmitting ? 'Posting…' : 'Post Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
