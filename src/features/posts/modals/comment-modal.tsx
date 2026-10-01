'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
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
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-[#0D0B09] w-full sm:max-w-xl max-h-[85vh] sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden border border-[#1A1410]">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 border-b border-[#1A1410] flex items-center justify-between flex-shrink-0">
            <h2 className="font-plus-jakarta font-extrabold text-xl tracking-tight text-[#F2EDE4]">
              Replies ({comments.length})
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#6A5E50] hover:text-[#F2EDE4] hover:bg-[#1E1B18] transition-all"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable comment list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-[#4A4038]">
                <ChatBubbleLeftEllipsisIcon className="w-10 h-10 mx-auto mb-3 text-[#272320]" />
                <p className="text-sm">No replies yet. Be the first!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {comments.map((comment, idx) => {
                  const username = comment.profiles?.username || 'Anonymous';
                  return (
                    <div
                      key={comment.id}
                      className={`py-4 ${idx !== comments.length - 1 ? 'border-b border-[#1A1410]' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-[#272320]">
                          {getInitials(username)}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-[#F2EDE4]">{username}</span>
                          <span className="text-[#4A4038] text-xs">
                            {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-[#C8B8A2] text-sm leading-relaxed pl-11">{comment.content}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Comment input */}
          <div className="px-6 py-5 border-t border-[#1A1410] flex-shrink-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
              placeholder="Share your thoughts..."
              rows={2}
              className="w-full px-4 py-3 border border-[#2A2520] focus:border-[#C8956A]/60 bg-[#1A1714] rounded-xl text-sm text-[#F2EDE4] placeholder:text-[#4A4038] outline-none transition-all resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[#4A4038]">⌘ + Enter to post</span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm text-[#0A0908] bg-[#C8956A] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isSubmitting ? 'Posting…' : 'Post Reply'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
