'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { XMarkIcon, ChatBubbleLeftEllipsisIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Replies"
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#17120E]/95 backdrop-blur-xl sm:max-w-xl sm:rounded-3xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-5 pb-4 pt-5">
          <div>
            <h2 className="font-plus-jakarta text-xl font-extrabold tracking-tight text-[#EEEAE2]">
              The <span className="shimmer-text">chat</span>
            </h2>
            <p className="text-xs font-semibold text-[#B8AA98]">
              {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-[#B8AA98] transition-colors hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {comments.length === 0 ? (
            <div className="py-10 text-center">
              <ChatBubbleLeftEllipsisIcon className="mx-auto mb-3 h-10 w-10 text-[#B8AA98]/60" />
              <p className="text-sm font-semibold text-[#B8AA98]">No replies yet. Start the chat.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => {
                const username = comment.profiles?.username || 'Anonymous';
                return (
                  <div key={comment.id} className="flex items-end gap-2.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[11px] font-black text-white">
                      {getInitials(username)}
                    </div>
                    <div className="min-w-0 max-w-[85%]">
                      <div className="mb-1 flex items-baseline gap-2 pl-1">
                        <span className="text-xs font-bold text-[#EEEAE2]">{username}</span>
                        <span className="text-[11px] text-[#B8AA98]">
                          {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap break-words rounded-3xl rounded-bl-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-[#EEEAE2]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-white/10 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
              placeholder="say something..."
              aria-label="Write a reply"
              rows={1}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-[#EEEAE2] outline-none transition-colors placeholder:text-[#B8AA98] focus:border-[#F5A623]/60"
            />
            <button
              type="button"
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              aria-label={isSubmitting ? 'Posting' : 'Send reply'}
              className="press flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-[#0D0A08] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)' }}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1.5 hidden pl-2 text-[11px] text-[#B8AA98] sm:block">⌘ + Enter to send</p>
        </div>
      </div>
    </div>
  );
};
