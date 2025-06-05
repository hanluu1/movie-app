'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PostCard } from '@/modules/user-post';
import { CommentModal } from '@/modules/user-post';
interface Post {
  movie_image: string | null;
  movie_title: string | null;
  id: number;
  title: string;
  created_at: string;
  upvotes: number;
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
  const handleUpvote = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
  
    const { error } = await supabase
      .from('Post')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', postId);
  
    if (error) {
      console.error('Error upvoting post:', error);
    } else {
      fetchPosts();
    }
  };
  
  useEffect(() => {
    fetchPosts();
  },);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('Post')
      .select('id, title, content, movie_title, movie_image, created_at, upvotes')
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
            movieTitle={post.movie_title}
            movieImage={post.movie_image}
            postTitle={post.title}
            createdAt={post.created_at}
            upvotes={post.upvotes}
            postContent={post.content}
            onLike={() => handleUpvote(post.id)}
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
