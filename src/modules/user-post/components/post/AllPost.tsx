'use client';

import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PostCard } from '@/modules/user-post';
import { CommentModal } from '@/modules/user-post';

interface Post {
  movie_image: string | null;
  movie_title: string | null;
  id: string;
  title: string;
  created_at: string;
  upvotes: number;
  profiles: {username: string} | null;
  content?: string;
  post_likes?: { user_id: string }[];
  isLiked?: boolean;
  comment_count?: number;
}

export const AllPost = forwardRef((props, ref) => {  
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort] = useState<'created_at' | 'upvotes'>('created_at');
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

    //find post and check if liked
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isPostLiked = post.isLiked;

    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, isLiked: !isPostLiked, upvotes: p.upvotes + (isPostLiked ? -1 : 1) } 
        : p));

    //update supabase
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
          console.log('Like change:', payload);
        
          const { data: { user } } = await supabase.auth.getUser();
        
          if (payload.eventType === 'INSERT') {
            const { post_id, user_id } = payload.new;
            setPosts(prev => prev.map(post => 
              post.id === post_id 
                ? { 
                  ...post, 
                  upvotes: post.upvotes + 1,
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
                  upvotes: post.upvotes - 1,
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
        () => {
          fetchPosts();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sort]);

  const fetchPosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [postsResult, commentsResult, likesResult] = await Promise.all([
      supabase.from('posts').select('*, profiles(username)').order(sort, { ascending: false }),
      supabase.from('comments').select('post_id'),
      user
        ? supabase.from('post_likes').select('post_id').eq('user_id', user.id)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);

    if (postsResult.error) {
      console.error('Error fetching posts:', postsResult.error);
      return;
    }

    const commentCountMap: Record<string, number> = {};
    for (const c of (commentsResult.data || [])) {
      commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
    }

    const userLikes = likesResult.data?.map(like => like.post_id) || [];

    setPosts((postsResult.data || []).map(post => ({
      ...post,
      isLiked: userLikes.includes(post.id),
      comment_count: commentCountMap[post.id] || 0,
    })));
  };

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
          username={posts.find(post => post.id === activePostId)?.profiles?.username ?? undefined}
          isOpen={showCommentModal}
          onClose={closeCommentModal}
        />
      )}
    </div>
  );
});

AllPost.displayName = 'AllPost';
