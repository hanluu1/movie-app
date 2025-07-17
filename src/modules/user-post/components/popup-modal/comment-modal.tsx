'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {username: string} | null;
}
interface CommentModalProps {
  postId: number;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentModal = ({ postId, username, isOpen, onClose }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen) fetchComments();
  },);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error) {
      setComments(data || []);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('User not authenticated');
      return;
    }
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, 
        content: newComment,
        user_id: user.id,
      });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-black">
      <div className="bg-gray-800 w-[80%] max-w-xl mx-auto my-10 p-6 border border-gray-700 rounded-lg relative shadow-lg overflow-y-auto">
        <XMarkIcon
          onClick={onClose}
          className="absolute w-7 h-7 top-2 right-4 text-gray-500 cursor-pointer"
        />
        <div className="text-xl font-bold mb-4 text-white">Comments</div>

        <div className="flex flex-col gap-3 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="border rounded p-2 w-full h-24 resize-none"
          />
          <button
            onClick={handleAddComment}
            className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-2 rounded-md self-end"
          >
            Add comment
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {comments.length > 0 ? (
            comments.map((comment, idx) => (
              <div key={comment.id}                   
                className={`pb-4 ${idx !== comments.length - 1 ? 'border-b border-gray-700 mb-2' : ''}`}>
                <div className="font-semibold text-white">
                  {username}
                </div>
                <div className="text-xs text-white">
                  {new Date(comment.created_at).toLocaleString()}
                </div>
                <div className='text-white'>{comment.content}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-white">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
