'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/layout';
import { SearchMovie } from '@/modules/home';
import Image from 'next/image';

type Movie = {
  movie_id: number;
  poster_url: string;
  movie_title: string;
  status: string;
  movie_overview: string;
};

type Review = {
  id: string;
  title: string;
  content: string;
  movie_title: string;
  movie_image: string;
  upvotes: number;
  created_at: string;
};

type Profile = {
  username: string;
  created_at: string;
};


function formatDate (iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials (username: string) {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else {
    return username.slice(0, 2).toUpperCase();
  }
}

export default function MyMoviesPage () {
  const [showSearch, setShowSearch] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'movies' | 'reviews'>('reviews');
  const [activeFilter, setActiveFilter] = useState<'all' | 'watched' | 'watching' | 'to-watch'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchMovies = async () => {
    const { data, error } = await supabase.from('track_movies').select('*');
    if (error) { console.error('Error fetching movies:', error); return; }
    if (data) setMovies(data);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      fetchMovies();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, created_at')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: reviewData, error } = await supabase
        .from('posts')
        .select('id, title, content, movie_title, movie_image, upvotes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('Error fetching reviews:', error); return; }
      if (reviewData) setReviews(reviewData);
    };
    init();
  }, []);


  const filteredMovies = movies.filter(movie => {
    const matchesFilter = activeFilter === 'all' || movie.status === activeFilter;
    const matchesSearch = (movie.movie_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const watchedCount = movies.filter(m => m.status === 'watched').length;
  const watchingCount = movies.filter(m => m.status === 'watching').length;
  const toWatchCount = movies.filter(m => m.status === 'to-watch').length;

  const statusBadge = (status: string) => {
    if (status === 'watched') return { label: 'Watched', cls: 'bg-[#E8500A]/85 text-white' };
    if (status === 'watching') return { label: 'Watching', cls: 'bg-blue-500/85 text-white' };
    return { label: 'To Watch', cls: 'bg-gray-400/80 text-gray-800' };
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'watched', label: 'Watched' },
    { value: 'watching', label: 'Watching' },
    { value: 'to-watch', label: 'To Watch' },
  ] as const;

  const memberYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-gray-900">
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />

      {showSearch && (
        <div className="w-full border-b border-gray-200">
          <SearchMovie
            mode="navigate"
            onSelect={(movie) => {
              setShowSearch(false);
              window.location.href = `/movie-more-info/${movie.movie_id}`;
            }}
            onRefetch={fetchMovies}
          />
        </div>
      )}

      <div className="flex flex-col w-full max-w-5xl mx-auto px-7 py-7">
        {/* Profile section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#E8500A] flex items-center justify-center font-bold text-xl text-white flex-shrink-0">
            {profile ? getInitials(profile.username) : ''}
          </div>
          <div>
            <h2 className="font-semibold text-lg text-gray-900">{profile?.username ?? '—'}</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              @{profile?.username ?? '—'}{memberYear ? ` · Member since ${memberYear}` : ''}
            </p>
            <div className="flex gap-6 mt-2">
              <div>
                <span className="font-semibold text-[#E8500A]">{reviews.length}</span>
                <small className="text-xs text-gray-400 ml-1">reviews</small>
              </div>
              <div>
                <span className="font-semibold text-[#E8500A]">{watchedCount}</span>
                <small className="text-xs text-gray-400 ml-1">watched</small>
              </div>
              <div>
                <span className="font-semibold text-[#E8500A]">{watchingCount}</span>
                <small className="text-xs text-gray-400 ml-1">watching</small>
              </div>
              <div>
                <span className="font-semibold text-[#E8500A]">{toWatchCount}</span>
                <small className="text-xs text-gray-400 ml-1">to watch</small>
              </div>
            </div>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {(['reviews', 'movies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`px-[18px] py-[10px] text-sm font-bold relative transition-colors ${
                activeMainTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'reviews' ? 'My Reviews' : 'My Movies'}
              {activeMainTab === tab && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#E8500A] rounded-t" />
              )}
            </button>
          ))}
        </div>

        {/* Movies tab */}
        {activeMainTab === 'movies' && (
          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8500A]/30"
              />
              {filters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeFilter === value
                      ? 'bg-[#E8500A] border-[#E8500A] text-white'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredMovies.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No movies found.</div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
                {filteredMovies.map((movie, index) => {
                  const badge = statusBadge(movie.status);
                  return (
                    <div key={index} className="group relative cursor-pointer">
                      <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200" style={{ aspectRatio: '2/3' }}>
                        {movie.poster_url && (
                          <Image
                            src={movie.poster_url}
                            alt={movie.movie_title}
                            fill
                            className="object-cover"
                          />
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end p-2.5 gap-1.5">
                          <button
                            className="flex-1 py-1.5 rounded-md text-[11px] font-medium bg-[#E8500A] text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              window.location.href = `/movie-more-info/${movie.movie_id}`;
                            }}
                          >
                            Info
                          </button>
                          <button
                            className="flex-1 py-1.5 rounded-md text-[11px] font-medium bg-white/15 text-white"
                            onClick={async (e) => {
                              e.preventDefault();
                              const { error } = await supabase
                                .from('track_movies')
                                .delete()
                                .eq('movie_id', movie.movie_id);
                              if (error) {
                                console.error('Error removing movie:', error);
                              } else {
                                fetchMovies();
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-700 truncate leading-snug">
                          {movie.movie_title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {activeMainTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No reviews yet.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="relative w-[52px] h-[78px] rounded-lg overflow-hidden bg-gray-200 border border-gray-200 flex-shrink-0">
                        {review.movie_image && (
                          <Image
                            src={review.movie_image}
                            alt={review.movie_title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[15px] text-gray-900">{review.movie_title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{formatDate(review.created_at)}</div>
                      </div>
                    </div>

                    <div className="font-semibold text-base text-gray-900 mb-2">{review.title}</div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{review.content}</p>

                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                      <button
                        className="text-sm text-[#E8500A] font-medium"
                        onClick={() => window.location.href = `/post/${review.id}`}
                      >
                        Read more →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
