'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/Header';
import { EditPostForm } from '@/components/EditPost';
import Image from 'next/image';
interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  upvotes: number;
  movie_title?: string;
  movie_image?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

export default function PostDetailPage () {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
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
  const handleDeletePost = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');

    if (!confirmDelete) return;

    const { error } = await supabase
      .from('Post')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
    } else {
      alert('Post deleted successfully.');
      window.location.href = '/';
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!post) return <div className="p-6">Post not found.</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <Header showSearchIcon={false} />

      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl mx-auto my-10 p-6 ">
        {edit ? (
          <EditPostForm
            postId={post.id}
            title={post.title}
            content={post.content || ''}
            imageUrl={post.image_url || ''}
            onCancel={() => setEdit(false)}
            onSave={() => {
              setEdit(false);
              fetchPost();
            }}
          />
        ) : (
          <div>
            <div className="flex flex-row justify-between min-w-96">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
                <div className="text-gray-500 text-sm mb-4">Posted on {new Date(post.created_at).toLocaleString()}</div>
              </div>
              
              <div className="flex flex-col items-center w-36">
                {post.movie_image && (
                  <Image
                    src={post.movie_image}
                    alt={post.movie_title || 'Movie poster'}
                    width={300}
                    height={450}
                    className="rounded-lg mb-4 w-20 h-24"
                  />
                )}

                {post.movie_title && (
                  <div className="flex items-center justify-center text-sm font-semibold text-gray-300 mb-2">{post.movie_title}</div>
                )}
              </div>
            </div>
            <p className="text-lg mb-6">{post.content}</p>
            {Array.isArray(post.image_url)
              ? post.image_url.map((url, idx) => (
                <Image
                  key={idx}
                  src={url.trim()}
                  alt={`Uploaded ${idx}`}
                  width={150}
                  height={150}
                  className="w-full rounded-lg mb-4"
                />
              ))
              : post.image_url && (
                <Image
                  src={post.image_url.trim()}
                  alt={post.title}
                  width={150}
                  height={150}
                  className="w-full rounded-lg mb-4"
                />
              )
            }
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleUpvote}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Like ({post.upvotes})
              </button>

              <button
                onClick={() => setEdit(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg "
              >
                Edit Post
              </button>

              <button
                onClick={handleDeletePost}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg "
              >
                Delete Post
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t pt-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>

          <div className="flex flex-col gap-2 mb-6 text-black">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="border rounded p-2 w-full h-24 resize-none"
            />
            <button
              onClick={handleAddComment}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg self-end hover:bg-gray-400 hover:text-white"
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