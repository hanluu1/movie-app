'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { XMarkIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string } | null;
}

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

function getInitials (name: string) {
  return name.slice(0, 2).toUpperCase();
}

export const CommentModal = ({ postId, isOpen, onClose }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (!error) setComments(data || []);
  };

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        content: newComment,
        user_id: user.id,
      });
      if (!error) { setNewComment(''); await fetchComments(); }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes commentModalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .comment-modal { animation: commentModalSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .comment-close-btn { transition: all 0.25s ease; }
        .comment-close-btn:hover { transform: rotate(90deg); }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(28, 25, 23, 0.6)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="comment-modal bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden"
          style={{ boxShadow: '0 24px 48px rgba(28, 25, 23, 0.2)' }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
            <h2
              className="text-stone-900"
              style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '1.25rem', letterSpacing: '-0.02em' }}
            >
              Comments ({comments.length})
            </h2>
            <button
              onClick={onClose}
              className="comment-close-btn w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 border-none cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable comment list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <ChatBubbleLeftEllipsisIcon className="w-10 h-10 mx-auto mb-3 text-stone-300" />
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {comments.map((comment, idx) => {
                  const username = comment.profiles?.username || 'Anonymous';
                  return (
                    <div
                      key={comment.id}
                      className={`py-4 ${idx !== comments.length - 1 ? 'border-b border-stone-100' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
                        >
                          {getInitials(username)}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-stone-900">{username}</span>
                          <span className="text-stone-400 text-xs">
                            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-stone-600 text-sm leading-relaxed pl-11">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment input — pinned to bottom */}
          <div className="px-6 py-5 border-t border-stone-100 flex-shrink-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
              placeholder="Share your thoughts..."
              rows={2}
              className="w-full px-4 py-3 border-2 border-stone-200 focus:border-red-600 rounded-xl text-sm resize-none outline-none transition-colors duration-200"
              style={{ fontFamily: 'inherit', lineHeight: '1.6' }}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-stone-400">⌘ + Enter to post</span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-lg font-bold text-sm text-white border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-px"
                style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 2px 8px rgba(220,38,38,0.2)' }}
              >
                {isSubmitting ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
