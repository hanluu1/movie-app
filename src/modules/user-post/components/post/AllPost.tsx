'use client';

import { useEffect, useState } from 'react';
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
}

export const AllPost = () => {  
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<'created_at' | 'upvotes'>('created_at');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const openCommentModal = (postId: number) => {
    setActivePostId(postId);
    setShowCommentModal(true);
  };
  
  const closeCommentModal = () => {
    setShowCommentModal(false);
    setActivePostId(null);
  };
  const handleToggleLike = async (postId: number) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return;
    }

    const { data: existingLike, error: fetchError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("post_id", postId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking like:", fetchError);
      return;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("Error unliking post:", deleteError);
      }
    } else {
      const { error: insertError } = await supabase.from("post_likes").insert({
        user_id: user.id,
        post_id: postId,
      });

      if (insertError) {
        console.error("Error liking post:", insertError?.message, insertError);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [sort]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .order(sort, { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  };
  
  return (
    <div className="flex flex-col py-4 mx-10">
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
            onLike={() => handleToggleLike(post.id)}
            onComment={() => openCommentModal(post.id)}
          />
        ))}
         
      </div>
      {showCommentModal && activePostId && (
        <CommentModal
          postId={activePostId}
          isOpen={showCommentModal}
          onClose={closeCommentModal}
        />
      )}
    </div>
  );
};
