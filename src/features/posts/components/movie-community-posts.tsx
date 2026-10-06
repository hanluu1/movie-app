'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { PostCard } from './post-card';
import { PostCardSkeleton } from './post-card-skeleton';
import { CreatePostModal } from '../modals/new-post-modal';
import { useAuthUser } from '@/hooks/use-auth-user';
import { PencilSquareIcon, ChatBubbleLeftEllipsisIcon  } from '@heroicons/react/24/outline';

interface Post {
  id: string;
  title: string;
  content?: string;
  movie_title: string | null;
  movie_image: string | null;
  movie_id?: number | null;
  media_type?: string | null;
  created_at: string;
  upvotes: number;
  isLiked?: boolean;
  comment_count?: number;
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-1">Community</p>
          <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">
            What people felt
          </h2>
        </div>
        <button
          onClick={handleWriteClick}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-[#1E1B18] border border-[#3A3530] text-[#C8956A] hover:bg-[#272320] hover:border-[#C8956A]/50 transition-all"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Write your reaction
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-[#1E1B18] border border-[#3A3530] rounded-2xl px-6 py-14 text-center">
          <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-[#3A3530] mb-3 mx-auto" />
          <p className="font-semibold text-[#EEEAE2] text-sm mb-1">No reactions yet</p>
          <p className="text-xs text-[#4A4038] mb-5">Be the first to share how this made you feel.</p>
      
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              username={post.profiles?.username || 'Anonymous'}
              avatarUrl={post.profiles?.avatar_url}
              postTitle={post.title}
              postContent={post.content}
              createdAt={post.created_at}
              upvotes={post.upvotes}
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
