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
  }, [sort]);

  const fetchPosts = async () => {
    const { data: {user} } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .order(sort, { ascending: false });
   
    if (error) {
      console.error('Error fetching posts:', error);
      return;
    } 
    // If user is logged in, get their likes
    let userLikes: string[] = [];
    if (user) {
      const { data: likesData } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);
    
      userLikes = likesData?.map(like => like.post_id) || [];
    }

    // Add isLiked to each post
    const postsWithLikeStatus = data?.map(post => ({
      ...post,
      isLiked: userLikes.includes(post.id)
    })) || [];
  
    setPosts(postsWithLikeStatus);
  };

  return (
    <div className="flex flex-col py-4 mx-auto">
      <div className="flex flex-col gap-4 justify-center items-center">
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
            onLike={() => handleToggleLike(post.id)}
            onComment={() => openCommentModal(post.id)}
          />
        ))}
         
      </div>
      {showCommentModal && activePostId && (
        <CommentModal
          postId={activePostId}
          username={posts.find(post => post.id === activePostId)?.profiles?.username}
          isOpen={showCommentModal}
          onClose={closeCommentModal}
        />
      )}
    </div>
  );
});

AllPost.displayName = 'AllPost';
