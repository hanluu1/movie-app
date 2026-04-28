'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/layout';
import { EditPostForm } from '@/modules/user-post';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { WatchlistButtons } from '@/components/buttons/WatchlistButtons';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | string[];
  created_at: string;
  upvotes: number;
  movie_title?: string;
  movie_image?: string;
  user_id: string;
  profiles?: { username: string } | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string } | null;
}

interface MovieDetails {
  tmdbId: number;
  genres: string[];
  cast: string[];
  director: string | null;
  year: string;
  mediaType: 'movie' | 'tv';
}

const TMDB_GENRES: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10765: 'Sci-Fi & Fantasy',
  10759: 'Action & Adventure',
};

async function fetchMovieDetails (title: string, posterUrl?: string): Promise<MovieDetails | null> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key || !title) return null;
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json;charset=utf-8' };
  const q = encodeURIComponent(title);

  try {
    const [movieData, tvData] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?query=${q}`, { headers }).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/search/tv?query=${q}`, { headers }).then(r => r.json()),
    ]);

    const posterPath = posterUrl?.match(/\/p\/w\d+(\/.+)/)?.[1] ?? null;

    const movieResults: any[] = movieData.results || [];
    const tvResults: any[] = tvData.results || [];

    let result: any = null;
    let mediaType: 'movie' | 'tv' = 'movie';

    if (posterPath) {
      result = movieResults.find(r => r.poster_path === posterPath);
      if (!result) {
        const tvMatch = tvResults.find(r => r.poster_path === posterPath);
        if (tvMatch) { result = tvMatch; mediaType = 'tv'; }
      }
    }

    if (!result) {
      result = movieResults.find(r => r.title?.toLowerCase() === title.toLowerCase()) ?? movieResults[0];
      const tvExact = tvResults.find(r => r.name?.toLowerCase() === title.toLowerCase());
      if (!result && tvExact) { result = tvExact; mediaType = 'tv'; }
    }

    if (!result) return null;

    const genres = (result.genre_ids || []).slice(0, 3).map((id: number) => TMDB_GENRES[id]).filter(Boolean);
    const year = (result.release_date || result.first_air_date || '').slice(0, 4);

    const creditsData = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${result.id}/credits`,
      { headers }
    ).then(r => r.json());

    const cast: string[] = (creditsData.cast || []).slice(0, 3).map((c: any) => c.name);
    const director: string | null =
      creditsData.crew?.find((c: any) => c.job === 'Director')?.name ??
      creditsData.crew?.find((c: any) => c.job === 'Series Director')?.name ??
      (mediaType === 'tv' ? creditsData.crew?.find((c: any) => c.job === 'Executive Producer')?.name : null) ??
      null;

    return { tmdbId: result.id, genres, cast, director, year, mediaType };
  } catch {
    return null;
  }
}

function formatTimestamp (dateStr: string) {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

function getInitials (name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function PostDetailPage () {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('id', id)
      .single();
    if (!error) setPost(data as Post);
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (!error) setComments((data as Comment[]) || []);
  }, [id]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUser(user.id);
      if (id) await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    })();
  }, [id, fetchPost, fetchComments]);

  useEffect(() => {
    if (post?.movie_title) {
      fetchMovieDetails(post.movie_title, post.movie_image).then(setMovieDetails);
    }
  }, [post?.movie_title, post?.movie_image]);

  const handleUpvote = async () => {
    if (!post) return;
    const next = liked ? post.upvotes - 1 : post.upvotes + 1;
    setLiked(!liked);
    await supabase.from('posts').update({ upvotes: next }).eq('id', post.id);
    await fetchPost();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert('You must be logged in to comment.'); return; }
    const { error } = await supabase.from('comments').insert({ post_id: id, content: newComment, user_id: user.id });
    if (!error) { setNewComment(''); await fetchComments(); }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="flex items-center justify-center h-64 text-stone-400">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header />
        <div className="flex items-center justify-center h-64 text-stone-400">Post not found.</div>
      </div>
    );
  }

  const authorName = post.profiles?.username || 'Anonymous';
  const isOwner = currentUser === post.user_id;

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-red-600 font-medium mb-6 transition-colors duration-200 text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to feed
        </Link>

        {/* Post card */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-8">

          {/* Author header */}
          <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
            >
              {getInitials(authorName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base text-stone-900">{authorName}</div>
              <div className="text-stone-500 text-sm">Posted on {formatTimestamp(post.created_at)}</div>
            </div>
            
          </div>

          {/* Edit form */}
          {edit && (
            <div className="px-6 py-6">
              <EditPostForm
                postId={post.id}
                title={post.title}
                content={post.content || ''}
                imageUrl={(Array.isArray(post.image_url) ? '' : post.image_url) || ''}
                onCancel={() => setEdit(false)}
                onSave={async () => { setEdit(false); await fetchPost(); }}
              />
            </div>
          )}

          {!edit && (
            <>
              {/* Movie section */}
              {post.movie_title && (
                <div className="px-6 py-5 bg-stone-50 border-b border-stone-100 flex gap-6 items-start">
                  {post.movie_image && (
                    <div className="rounded-lg overflow-hidden flex-shrink-0 shadow" style={{ width: 100, height: 150 }}>
                      <Image
                        src={post.movie_image}
                        alt={post.movie_title}
                        width={100}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-1">
                    <h2
                      className="text-red-600 leading-tight mb-1"
                      style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.4rem', letterSpacing: '-0.02em' }}
                    >
                      {post.movie_title}
                    </h2>

                    {movieDetails && (
                      <>
                        <div className="text-stone-500 text-sm mb-2">
                          {[
                            movieDetails.year,
                            movieDetails.mediaType === 'tv' ? 'TV Series' : 'Film',
                          ].filter(Boolean).join(' · ')}
                        </div>

                        {movieDetails.cast.length > 0 && (
                          <div className="text-sm text-stone-500 mb-3">
                            <span className="font-semibold text-stone-700">Starring </span>
                            {movieDetails.cast.join(', ')}
                          </div>
                        )}

                        {movieDetails.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {movieDetails.genres.map(g => (
                              <span
                                key={g}
                                className="px-2.5 py-0.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {movieDetails && (
                      <WatchlistButtons
                        movieId={movieDetails.tmdbId}
                        title={post.movie_title!}
                        posterPath={post.movie_image?.match(/\/p\/w\d+(\/.+)/)?.[1] ?? null}
                        releaseDate={movieDetails.year}
                      />
                    )}

                    {!movieDetails && (
                      <div className="text-stone-400 text-xs mt-2 animate-pulse">Loading details…</div>
                    )}
                  </div>
                </div>
              )}

              {/* Review content */}
              <div className="px-6 py-8">
                <h1
                  className="text-stone-900 mb-5 leading-snug"
                  style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.75rem', letterSpacing: '-0.02em' }}
                >
                  {post.title}
                </h1>
                {post.content && (
                  <p className="text-stone-600 text-base" style={{ lineHeight: '1.8' }}>
                    {post.content}
                  </p>
                )}
              </div>

              {/* Action bar */}
              <div className="px-6 py-4 border-t border-stone-100 flex flex-wrap gap-3 items-center">
                <button
                  onClick={handleUpvote}
                  className="px-5 py-3 border rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-200"
                  style={liked
                    ? { background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)', borderColor: '#DC2626', color: '#DC2626' }
                    : { background: 'white', borderColor: '#E7E5E4', color: '#44403C' }}
                >
                  {liked
                    ? <HeartSolidIcon className="w-4 h-4 text-red-600" />
                    : <HeartIcon className="w-4 h-4" />}
                  Like ({post.upvotes})
                </button>

                <a
                  href="#comments"
                  className="px-5 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 text-white no-underline transition-all duration-200 hover:-translate-y-px"
                  style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}
                >
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                  Comment
                </a>

                {isOwner && (
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setEdit(true)}
                      className="px-5 py-3 border border-stone-200 bg-white rounded-lg font-semibold text-sm text-stone-500 hover:bg-stone-50 flex items-center gap-2 transition-all duration-200"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="px-5 py-3 border border-stone-200 bg-white rounded-lg font-semibold text-sm text-red-600 hover:bg-red-50 hover:border-red-300 flex items-center gap-2 transition-all duration-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Comments section */}
        <div id="comments" className="bg-white rounded-2xl border border-stone-200 px-6 py-6">
          <h3
            className="text-stone-900 mb-6"
            style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.25rem', letterSpacing: '-0.02em' }}
          >
            Comments ({comments.length})
          </h3>

          {/* Comment input */}
          <div className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this review..."
              className="w-full min-h-[80px] px-4 py-4 border-2 border-stone-200 focus:border-red-600 rounded-xl text-base resize-y outline-none transition-colors duration-200"
              style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="mt-3 px-6 py-3 rounded-lg font-bold text-sm text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}
            >
              Post Comment
            </button>
          </div>

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <ChatBubbleLeftEllipsisIcon className="w-12 h-12 mx-auto mb-4 text-stone-300" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {comments.map((comment, idx) => {
                const username = comment.profiles?.username || 'Anonymous';
                return (
                  <div
                    key={comment.id}
                    className={`py-5 ${idx !== comments.length - 1 ? 'border-b border-stone-100' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
                      >
                        {getInitials(username)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-stone-900">{username}</span>
                        <span className="text-stone-400 text-xs">
                          {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed pl-12">{comment.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
