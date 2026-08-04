'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PostCard } from '../posts/post-card';
import { PostCardSkeleton } from '../posts/post-card-skeleton';
import { CommentModal } from '../modals/comment-modal';

interface Post {
  movie_image: string | null;
  movie_title: string | null;
  id: string;
  title: string;
  created_at: string;
  upvotes: number;
  profiles: {username: string} | null;
  content?: string;
  isLiked?: boolean;
  comment_count?: number;
}

export const AllPost = forwardRef((_props, ref) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort] = useState<'created_at' | 'upvotes'>('created_at');
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  useImperativeHandle(ref, () => ({
    refetch: fetchPosts
  }));
  const openCommentModal = (postId: string) => {
    setActivePostId(postId);
    setShowCommentModal(true);
  };
  
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setActivePostId(null);
  };
  const handleToggleLike = async (postId: string) => {
    const { data: { user }, error: userError, } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated');
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isPostLiked = post.isLiked;

    // optimistic update so the UI feels instant before the db write completes
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, isLiked: !isPostLiked, upvotes: p.upvotes + (isPostLiked ? -1 : 1) }
        : p));

    if (isPostLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }]);
    }
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('post_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        async (payload) => {
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
        
          if (payload.eventType === 'INSERT') {
            const { post_id, user_id } = payload.new;
            setPosts(prev => prev.map(post => 
              post.id === post_id 
                ? { 
                  ...post, 
                  upvotes: user?.id === user_id ? post.upvotes : post.upvotes + 1,
                  isLiked: user?.id === user_id ? true : post.isLiked
                }
                : post
            ));
          } else if (payload.eventType === 'DELETE') {
            const { post_id, user_id } = payload.old;
            setPosts(prev => prev.map(post => 
              post.id === post_id 
                ? { 
                  ...post, 
                  upvotes: user?.id === user_id ? post.upvotes : post.upvotes - 1,
                  isLiked: user?.id === user_id ? false : post.isLiked
                }
                : post
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
          } else if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('posts')
              .select('*, profiles(username), comments(count)')
              .eq('id', payload.new.id)
              .single();
            if (data) setPosts(prev => [{ ...data, isLiked: false, comment_count: 0 }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Performance optimisations:
  // - getSession (local) instead of getUser (network) since we only need the user id for UI
  // - comments(count) embedded in posts query so the database counts instead of fetching all rows
  // - post_likes fetched in parallel with posts via Promise.all
  // - realtime handlers updated to handle INSERT/UPDATE/DELETE individually instead of full refetch
  const fetchPosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    const [postsResult, likesResult] = await Promise.all([
      supabase.from('posts').select('*, profiles(username), comments(count)').order(sort, { ascending: false }),
      user
        ? supabase.from('post_likes').select('post_id').eq('user_id', user.id)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error);
      return;
    }

    const userLikes = likesResult.data?.map(like => like.post_id) || [];

    setPosts((postsResult.data || []).map(post => ({
      ...post,
      isLiked: userLikes.includes(post.id),
      comment_count: (post.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
    })));
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          username={post.profiles?.username || 'Anonymous'}
          movieTitle={post.movie_title}
          movieImage={post.movie_image}
          postTitle={post.title}
          createdAt={post.created_at}
          upvotes={post.upvotes}
          postContent={post.content}
          isLiked={post.isLiked}
          commentCount={post.comment_count || 0}
          onLike={() => handleToggleLike(post.id)}
          onComment={() => openCommentModal(post.id)}
        />
      ))}
      {showCommentModal && activePostId && (
        <CommentModal
          postId={activePostId}
          isOpen={showCommentModal}
          onClose={closeCommentModal}
        />
      )}
    </div>
  );
});

AllPost.displayName = 'AllPost';
