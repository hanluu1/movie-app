'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Comment {
  id: string;
  content: string;
  created_at: string;
}

interface CommentModalProps {
  postId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentModal = ({ postId, isOpen, onClose }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (isOpen) fetchComments();
  },);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('Comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error) {
      setComments(data || []);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('Comments')
      .insert({ post_id: postId, content: newComment });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg relative shadow-lg max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Comments</h2>

        <div className="flex flex-col gap-2 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="border rounded p-2 w-full h-24 resize-none"
          />
          <button
            onClick={handleAddComment}
            className="bg-[#cfcfcf] text-black px-4 py-2 rounded-lg self-end"
          >
            Add Comment
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border p-3 rounded-lg bg-gray-100">
                <p>{comment.content}</p>
                <div className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
