'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Header } from '@/components/layout';
import { EditPostForm } from '@/features/posts';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { SignInPrompt } from '@/components/ui/sign-in-prompt';
import { useAuthUser } from '@/hooks/use-auth-user';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  upvotes: number;
  movie_title?: string;
  movie_image?: string;
  movie_id?: number | null;
  media_type?: string | null;
  user_id: string;
  mood?: string[] | null;
  profiles?: { username: string; avatar_url?: string | null } | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url?: string | null } | null;
}

function formatTimestamp (dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getInitials (name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function Avatar ({ username, avatarUrl, size = 10 }: { username: string; avatarUrl?: string | null; size?: number }) {
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className={`${sizeClass} rounded-full flex-shrink-0 bg-[#272320] flex items-center justify-center text-[#EEEAE2] font-bold text-sm overflow-hidden relative`}>
      {avatarUrl ? (
        <Image src={avatarUrl} alt={username} fill className="object-cover" sizes={`${size * 4}px`} />
      ) : (
        getInitials(username)
      )}
    </div>
  );
}

export default function PostDetailPage () {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [liked, setLiked] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<{ username: string; avatar_url?: string | null } | null>(null);
  const { user } = useAuthUser();

  const requireAuth = (action: string) => {
    if (user) return true;
    setAuthPromptAction(action);
    return false;
  };

  const fetchPost = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username, avatar_url)')
      .eq('id', id)
      .single();
    if (!error) setPost(data as Post);
  }, [id]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username, avatar_url)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (!error) setComments((data as Comment[]) || []);
  }, [id]);

  useEffect(() => {
    (async () => {
      if (id) await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    })();
  }, [id, fetchPost, fetchComments]);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setCurrentProfile(data); });
  }, [user]);

  const handleUpvote = async () => {
    if (!post) return;
    if (!requireAuth('like this post')) return;
    const next = liked ? post.upvotes - 1 : post.upvotes + 1;
    setLiked(l => !l);
    await supabase.from('posts').update({ upvotes: next }).eq('id', post.id);
    await fetchPost();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!requireAuth('join the discussion')) return;
    if (!user) return;
    const { error } = await supabase.from('comments').insert({ post_id: id, content: newComment, user_id: user.id });
    if (!error) { setNewComment(''); await fetchComments(); }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) router.push('/feed');
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161210] flex flex-col">
        <Header variant="dark" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#272320] border-t-[#C8956A] animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#161210]">
        <Header variant="dark" />
        <div className="flex items-center justify-center h-64 text-[#8C7E6E]">Post not found.</div>
      </div>
    );
  }

  const authorName = post.profiles?.username || 'Anonymous';
  const isOwner = user?.id === post.user_id;

  return (
    <div className="font-dm-sans min-h-screen bg-[#161210] text-[#EEEAE2]">
      <Header variant="dark" />

      <div className="mx-auto w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl px-6 lg:px-10 py-8">

        {/* Back */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7E6E] hover:text-[#EEEAE2] transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to feed
        </Link>

        {/* Post */}
        <div className="bg-[#1E1B18] border border-[#3A3530] rounded-2xl overflow-hidden mb-6">

          {/* Author row */}
          <div className="px-6 pt-6 pb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar username={authorName} avatarUrl={post.profiles?.avatar_url} size={10} />
              <div>
                <div className="font-semibold text-sm text-[#EEEAE2]">{authorName}</div>
                <div className="text-xs text-[#8C7E6E]">{formatTimestamp(post.created_at)}</div>
              </div>
            </div>
            {isOwner && !edit && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#8C7E6E] hover:text-[#EEEAE2] hover:bg-[#272320] transition-all"
                >
                  <PencilSquareIcon className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Edit form */}
          {edit && (
            <div className="px-6 pb-6">
              <EditPostForm
                postId={post.id}
                title={post.title}
                content={post.content || ''}
                mood={post.mood ?? []}
                onCancel={() => setEdit(false)}
                onSave={async () => { setEdit(false); await fetchPost(); }}
              />
            </div>
          )}

          {!edit && (
            <>
              {/* Reaction content */}
              <div className="px-6 pb-6">
                <h1 className="font-plus-jakarta font-extrabold text-2xl text-[#EEEAE2] leading-snug mb-4">
                  {post.title}
                </h1>
                {post.content && (
                  <p className="text-[#C8B8A2] text-base leading-relaxed">
                    {post.content}
                  </p>
                )}
              </div>

              {/* Movie pill */}
              {post.movie_title && (
                <div className="px-6 pb-5">
                  {post.movie_id ? (
                    <Link
                      href={`/movie-more-info/${post.movie_id}${post.media_type ? `?type=${post.media_type}` : ''}`}
                      className="inline-flex items-center gap-2.5 bg-[#272320] hover:bg-[#3A3530] border border-[#3A3530] rounded-xl px-3 py-2 transition-colors"
                    >
                      {post.movie_image && (
                        <div className="relative w-6 h-9 rounded flex-shrink-0 overflow-hidden">
                          <Image src={post.movie_image} alt={post.movie_title} fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#C8B8A2]">{post.movie_title}</span>
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-2.5 bg-[#272320] border border-[#3A3530] rounded-xl px-3 py-2">
                      {post.movie_image && (
                        <div className="relative w-6 h-9 rounded flex-shrink-0 overflow-hidden">
                          <Image src={post.movie_image} alt={post.movie_title} fill className="object-cover" sizes="24px" />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-[#C8B8A2]">{post.movie_title}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action bar */}
              <div className="px-6 py-4 border-t border-[#3A3530] flex items-center gap-4">
                <button
                  onClick={handleUpvote}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    liked
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-[#272320] text-[#8C7E6E] hover:text-rose-400 border border-[#3A3530]'
                  }`}
                >
                  {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                  {post.upvotes} felt the same
                </button>
                <a
                  href="#comments"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#272320] border border-[#3A3530] text-[#8C7E6E] hover:text-[#EEEAE2] transition-colors"
                >
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
                  {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
                </a>
              </div>
            </>
          )}
        </div>

        {/* Comments */}
        <div id="comments" className="bg-[#1E1B18] border border-[#3A3530] rounded-2xl px-6 py-6">

          <p className="text-xs font-bold uppercase tracking-widest text-[#C8956A] mb-5">
            {comments.length === 0 ? 'Replies' : `${comments.length} ${comments.length === 1 ? 'Reply' : 'Replies'}`}
          </p>

          {/* Input */}
          <div className="flex gap-3 mb-6">
            {user && (
              <Avatar username={currentProfile?.username ?? user.email ?? ''} avatarUrl={currentProfile?.avatar_url} size={8} />
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your reaction..."
                rows={3}
                className="w-full px-4 py-3 border border-[#3A3530] focus:border-[#C8956A]/60 bg-[#272320] rounded-xl text-sm text-[#EEEAE2] placeholder:text-[#4A4038] outline-none transition-all resize-none leading-relaxed"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="mt-2 px-5 py-2 rounded-xl text-sm font-semibold text-[#0A0908] bg-[#C8956A] hover:bg-[#D4A870] transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
              >
                Reply
              </button>
            </div>
          </div>

          {/* List */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-[#4A4038] text-sm">
              No replies yet — be the first.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#3A3530]">
              {comments.map(comment => {
                const name = comment.profiles?.username || 'Anonymous';
                return (
                  <div key={comment.id} className="py-4 flex gap-3">
                    <Avatar username={name} avatarUrl={comment.profiles?.avatar_url} size={8} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#EEEAE2]">{name}</span>
                        <span className="text-xs text-[#8C7E6E]">
                          {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-[#C8B8A2] leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <SignInPrompt
        isOpen={authPromptAction !== null}
        onClose={() => setAuthPromptAction(null)}
        action={authPromptAction ?? undefined}
      />

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div className="bg-[#1E1B18] border border-[#3A3530] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-1">Heads up</p>
              <h2 className="font-plus-jakarta font-extrabold text-xl text-[#EEEAE2]">Delete this post?</h2>
              <p className="text-sm text-[#8C7E6E] mt-2 leading-relaxed">
                This will permanently remove your reaction. There&rsquo;s no way to get it back.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#C8B8A2] bg-[#272320] border border-[#3A3530] hover:bg-[#3A3530] hover:text-[#EEEAE2] transition-all"
              >
                Keep it
              </button>
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-500 hover:bg-rose-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
