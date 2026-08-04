'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
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
    if (status === 'watched') return { label: 'Watched', cls: 'bg-red-600/85 text-white' };
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
    <div className="font-dm-sans flex flex-col min-h-screen w-full bg-stone-50 text-stone-900">
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />

      <div className="flex flex-col w-full max-w-5xl mx-auto px-7 py-7">
        {/* Profile section */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0">
            {profile ? getInitials(profile.username) : ''}
          </div>
          <div>
            <h2 className="font-archivo-black text-2xl text-stone-800">{profile?.username ?? '—'}</h2>
            <p className="text-sm text-stone-400 mt-1">
              @{profile?.username ?? '—'}{memberYear ? ` · Member since ${memberYear}` : ''}
            </p>
            <div className="flex gap-8 mt-3">
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-red-600">{reviews.length}</span>
                <span className="text-xs text-stone-400 mt-0.5">reviews</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-red-600">{watchedCount}</span>
                <span className="text-xs text-stone-400 mt-0.5">watched</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-red-600">{watchingCount}</span>
                <span className="text-xs text-stone-400 mt-0.5">watching</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-red-600">{toWatchCount}</span>
                <span className="text-xs text-stone-400 mt-0.5">to watch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main tabs */}
        <div className="flex gap-1 border-b border-stone-200 mb-8">
          {(['reviews', 'movies'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMainTab(tab)}
              className={`px-6 py-3 text-base font-bold relative transition-colors ${
                activeMainTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab === 'reviews' ? 'My Reviews' : 'My Movies'}
              {activeMainTab === tab && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-red-600 rounded-t" />
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
                className="px-4 py-2 rounded-lg bg-stone-100 text-gray-700 text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-600/10"
              />
              {filters.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeFilter === value
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-stone-200 text-stone-400 hover:border-stone-300 hover:text-stone-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredMovies.length === 0 ? (
              <div className="text-center py-10 text-stone-400 text-sm">No movies found.</div>
            ) : (
              <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
                {filteredMovies.map((movie, index) => {
                  const badge = statusBadge(movie.status);
                  return (
                    <div key={index} className="group relative bg-white rounded-xl overflow-hidden border border-stone-200">
                      <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-red-100 to-orange-200">
                        {movie.poster_url && (
                          <Image
                            src={movie.poster_url}
                            alt={movie.movie_title}
                            fill
                            className="object-cover"
                          />
                        )}
                        <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 gap-1.5">
                          <button
                            className="flex-1 py-1.5 rounded-md text-[11px] font-medium bg-red-600 text-white"
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
                      <div className="p-2">
                        <div className="font-bold text-xs truncate text-stone-900">{movie.movie_title}</div>
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
              <div className="text-center py-10 text-stone-400 text-sm">No reviews yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-stone-50 border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-colors cursor-pointer flex flex-col"
                    onClick={() => window.location.href = `/post/${review.id}`}
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="relative w-[56px] h-[84px] rounded-lg overflow-hidden bg-stone-200 border border-stone-200 flex-shrink-0">
                        {review.movie_image && (
                          <Image src={review.movie_image} alt={review.movie_title} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-stone-900 leading-snug line-clamp-2">{review.movie_title}</div>
                        <div className="text-sm text-stone-400 mt-1">{formatDate(review.created_at)}</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-stone-900 mb-2 leading-snug">{review.title}</div>
                    <p className="text-sm text-stone-500 leading-relaxed line-clamp-3 flex-1">{review.content}</p>
                    <div className="flex items-center justify-end mt-4 pt-4 border-t border-stone-200">
                      <span className="text-sm text-red-600 font-semibold">Read more →</span>
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
