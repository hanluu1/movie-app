'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PostCard } from '../components/post-card';
import { PostCardSkeleton } from '../components/post-card-skeleton';
import { CommentModal } from '../modals/comment-modal';

const PAGE_SIZE = 10;

type Filter = 'all' | 'movies' | 'tv';
type Sort = 'created_at' | 'upvotes';

interface Post {
  movie_image: string | null;
  movie_title: string | null;
  movie_id?: number | null;
  media_type?: string | null;
  id: string;
  title: string;
  created_at: string;
  upvotes: number;
  profiles: { username: string; avatar_url: string | null } | null;
  content?: string;
  isLiked?: boolean;
  comment_count?: number;
}

interface AllPostProps {
  isAuthed?: boolean;
  requireAuth?: (action: string) => boolean;
  filter?: Filter;
  sort?: Sort;
}

export const AllPost = forwardRef<{ refetch: () => void }, AllPostProps>(
  ({ isAuthed = true, requireAuth, filter = 'all', sort = 'created_at' }, ref) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [activePostId, setActivePostId] = useState<string | null>(null);

    const openCommentModal = (postId: string) => {
      if (requireAuth && !requireAuth('join the discussion')) return;
      setActivePostId(postId);
      setShowCommentModal(true);
    };

    const closeCommentModal = () => {
      setShowCommentModal(false);
      setActivePostId(null);
    };

    const handleToggleLike = async (postId: string) => {
      if (requireAuth && !requireAuth('like this post')) return;
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const post = posts.find(p => p.id === postId);
      if (!post) return;
      const isPostLiked = post.isLiked;

      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, isLiked: !isPostLiked, upvotes: p.upvotes + (isPostLiked ? -1 : 1) }
          : p
      ));

      if (isPostLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
      }
    };

    const fetchPosts = async (fromOffset: number, append: boolean) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      let postsQuery = supabase
        .from('posts')
        .select('*, profiles(username, avatar_url), comments(count)')
        .order(sort, { ascending: false })
        .range(fromOffset, fromOffset + PAGE_SIZE - 1);

      if (filter === 'movies') postsQuery = postsQuery.eq('media_type', 'movie');
      if (filter === 'tv') postsQuery = postsQuery.eq('media_type', 'tv');

      const [postsResult, likesResult] = await Promise.all([
        postsQuery,
        user
          ? supabase.from('post_likes').select('post_id').eq('user_id', user.id)
          : Promise.resolve({ data: [] as { post_id: string }[] }),
      ]);

      if (postsResult.error) {
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const userLikes = likesResult.data?.map(l => l.post_id) || [];
      const newPosts = (postsResult.data || []).map(post => ({
        ...post,
        isLiked: userLikes.includes(post.id),
        comment_count: (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
      }));

      setHasMore(newPosts.length === PAGE_SIZE);
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
      if (!append) setLoading(false);
      else setLoadingMore(false);
    };

    const loadMore = () => {
      const nextOffset = offset + PAGE_SIZE;
      setOffset(nextOffset);
      fetchPosts(nextOffset, true);
    };

    useImperativeHandle(ref, () => ({
      refetch: () => {
        setOffset(0);
        fetchPosts(0, false);
      },
    }));

    // Reset and refetch when filter or sort changes
    useEffect(() => {
      setOffset(0);
      fetchPosts(0, false);
    }, [filter, sort]); // eslint-disable-line react-hooks/exhaustive-deps

    // Realtime subscription
    useEffect(() => {
      const channel = supabase
        .channel('post_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, async (payload) => {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          if (payload.eventType === 'INSERT') {
            const { post_id, user_id } = payload.new;
            setPosts(prev => prev.map(post =>
              post.id === post_id
                ? { ...post, upvotes: user?.id === user_id ? post.upvotes : post.upvotes + 1, isLiked: user?.id === user_id ? true : post.isLiked }
                : post
            ));
          } else if (payload.eventType === 'DELETE') {
            const { post_id, user_id } = payload.old;
            setPosts(prev => prev.map(post =>
              post.id === post_id
                ? { ...post, upvotes: user?.id === user_id ? post.upvotes : post.upvotes - 1, isLiked: user?.id === user_id ? false : post.isLiked }
                : post
            ));
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async (payload) => {
          if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('posts')
              .select('*, profiles(username, avatar_url), comments(count)')
              .eq('id', payload.new.id)
              .single();
            if (data) setPosts(prev => [{ ...data, isLiked: false, comment_count: 0 }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) return (
      <div className="flex flex-col gap-4 w-full">
        {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    );

    if (posts.length === 0) return (
      <div className="text-center py-20 px-4">
        <p className="text-2xl mb-3">🎬</p>
        <p className="font-semibold text-[#172526] text-sm mb-1">
          {filter === 'movies' ? 'No movie reactions yet.' : filter === 'tv' ? 'No TV show reactions yet.' : 'No reactions yet.'}
        </p>
        <p className="text-xs text-[#6F8C88]">Be the first to share how something made you feel.</p>
      </div>
    );

    return (
      <div className="flex flex-col gap-4 w-full">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            username={post.profiles?.username || 'Anonymous'}
            avatarUrl={post.profiles?.avatar_url}
            movieTitle={post.movie_title}
            movieImage={post.movie_image}
            movieId={post.movie_id}
            mediaType={post.media_type}
            postTitle={post.title}
            createdAt={post.created_at}
            upvotes={post.upvotes}
            postContent={post.content}
            isLiked={post.isLiked}
            commentCount={post.comment_count || 0}
            canLike={isAuthed}
            onLike={() => handleToggleLike(post.id)}
            onComment={() => openCommentModal(post.id)}
          />
        ))}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-3 rounded-2xl border border-[#E8EEEA] text-sm font-semibold text-[#2A4649] bg-[#FFFDF8] hover:border-[#2A4649] transition-all disabled:opacity-50"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}

        {showCommentModal && activePostId && (
          <CommentModal
            postId={activePostId}
            isOpen={showCommentModal}
            onClose={closeCommentModal}
          />
        )}
      </div>
    );
  }
);

AllPost.displayName = 'AllPost';
