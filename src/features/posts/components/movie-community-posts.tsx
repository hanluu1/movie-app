'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { PostCard } from './post-card';
import { PostCardSkeleton } from './post-card-skeleton';
import { CreatePostModal } from '../modals/new-post-modal';
import { useAuthUser } from '@/hooks/use-auth-user';
import { PencilSquareIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface Post {
  id: string;
  title: string;
  content?: string;
  movie_title: string | null;
  movie_image: string | null;
  movie_id?: number | null;
  media_type?: string | null;
  mood?: string[] | null;
  created_at: string;
  upvotes: number;
  isLiked?: boolean;
  comment_count?: number;
  image_url?: string | null;
  profiles: { username: string; avatar_url: string | null } | null;
}

interface MovieCommunityPostsProps {
  movieId: number;
  movieTitle: string;
  posterPath: string | null;
  mediaType: string;
}

export function MovieCommunityPosts ({ movieId, movieTitle, posterPath, mediaType }: MovieCommunityPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleWriteClick = () => {
    if (user) {
      setShowModal(true);
    } else {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  };

  const preselectedMovie = {
    id: movieId,
    title: mediaType === 'movie' ? movieTitle : '',
    name: mediaType === 'tv' ? movieTitle : '',
    overview: '',
    poster_path: posterPath ?? '',
  };

  const fetchPosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;

    const [postsResult, likesResult] = await Promise.all([
      supabase
        .from('posts')
        .select('*, profiles(username, avatar_url), comments(count)')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false }),
      currentUser
        ? supabase.from('post_likes').select('post_id').eq('user_id', currentUser.id)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

    if (postsResult.error) { setLoading(false); return; }

    const userLikes = likesResult.data?.map(l => l.post_id) || [];
    setPosts(
      (postsResult.data || []).map(post => ({
        ...post,
        isLiked: userLikes.includes(post.id),
        comment_count: (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [movieId]);

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, upvotes: p.upvotes + (p.isLiked ? -1 : 1) }
        : p
    ));

    if (post.isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
    }
  };

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">Community</p>
          <h2 className="font-plus-jakarta text-2xl font-extrabold text-[#EEEAE2]">
            What people <span className="shimmer-text">felt</span>
          </h2>
        </div>
        <button
          type="button"
          onClick={handleWriteClick}
          className="press flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black text-[#0D0A08]"
          style={{
            background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)',
            boxShadow: '0 0 24px rgba(245,166,35,0.35)',
          }}
        >
          <PencilSquareIcon className="h-4 w-4" strokeWidth={2.5} />
          Yap about this
        </button>
      </div>

      {loading ? (
        <div className="mx-auto flex max-w-[620px] flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-md">
          <div aria-hidden className="mb-3 text-4xl">🎬</div>
          <p className="mb-1 font-plus-jakarta text-lg font-extrabold text-[#EEEAE2]">No yaps yet</p>
          <p className="mb-5 text-sm text-[#B8AA98]">Be the first to say how this one made you feel.</p>
          <button
            type="button"
            onClick={handleWriteClick}
            className="press inline-flex items-center gap-2 rounded-full bg-[#F5A623] px-5 py-2 text-sm font-black text-[#0D0A08]"
          >
            <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
            Start the yapping
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[620px] flex-col gap-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              username={post.profiles?.username || 'Anonymous'}
              avatarUrl={post.profiles?.avatar_url}
              movieTitle={post.movie_title}
              movieImage={post.movie_image}
              movieId={post.movie_id}
              mediaType={post.media_type}
              mood={post.mood}
              postTitle={post.title}
              postContent={post.content}
              createdAt={post.created_at}
              upvotes={post.upvotes}
              imageUrl={post.image_url}
              isLiked={post.isLiked}
              commentCount={post.comment_count || 0}
              canLike={!!user}
              onLike={() => handleToggleLike(post.id)}
              variant="card"
            />
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { setShowModal(false); fetchPosts(); }}
        preselectedMovie={preselectedMovie}
      />
    </div>
  );
}
