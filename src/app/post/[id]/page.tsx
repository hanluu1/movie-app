'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/header';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  upvotes: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
    }
  }, [id]);

  const fetchPost = async () => {
    const { data, error } = await supabase
                                .from('Post')
                                .select('*')
                                .eq('id', id)
                                .single();

    if (error) {
      console.error('Error fetching post:', error);
    } else {
      setPost(data);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
                                .from('Comments')
                                .select('*')
                                .eq('post_id', id)
                                .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const handleUpvote = async () => {
    if (!post) return;

    const { error } = await supabase
      .from('Post')
      .update({ upvotes: post.upvotes + 1 })
      .eq('id', post.id);

    if (error) {
      console.error('Error upvoting:', error);
    } else {
      fetchPost(); 
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    const { error } = await supabase
      .from('Comments')
      .insert({ post_id: id, content: newComment });

    if (error) {
      console.error('Error adding comment:', error);
    } else {
      setNewComment('');
      fetchComments(); 
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div className="p-6">Post not found.</div>;

  return (
    <div className="flex flex-col w-full p-6">
      <Header />

      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="text-gray-500 text-sm mb-4">Posted on {new Date(post.created_at).toLocaleString()}</div>

        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-4" />
        )}

        <p className="text-lg mb-6">{post.content}</p>

        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-8 hover:bg-blue-600"
        >
          👍 Upvote ({post.upvotes})
        </button>

        {/* Comment Section */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>

          <div className="flex flex-col gap-2 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="border rounded p-2 w-full h-24 resize-none"
            />
            <button
              onClick={handleAddComment}
              className="bg-green-500 text-white px-4 py-2 rounded-lg self-end hover:bg-green-600"
            >
              Add Comment
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border p-4 rounded-lg">
                  <p>{comment.content}</p>
                  <div className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <p>No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
