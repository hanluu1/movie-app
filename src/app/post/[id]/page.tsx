'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AppShell, useShell } from '@/components/layout';
import { EditPostForm } from '@/features/posts';
import { BackButton } from '@/components/ui/back-button';
import { BRAND_COLOR, getFeeling } from '@/lib/moods';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRightIcon,
  ChatBubbleLeftEllipsisIcon,
  HeartIcon,
  PaperAirplaneIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const LIKE_COLOR = '#FF4D6D';

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
  image_url?: string | null;
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

function Avatar ({ username, avatarUrl, px = 40 }: { username: string; avatarUrl?: string | null; px?: number }) {
  return (
    <div
      style={{ width: px, height: px }}
      className="relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-xs font-black text-white"
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={username} fill className="object-cover" sizes={`${px}px`} />
      ) : (
        getInitials(username)
      )}
    </div>
  );
}

function PostDetail () {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user, profile: currentProfile, requireAuth } = useShell();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (post?.image_url) {
      const path = post.image_url.split('/post-images/')[1];
      if (path) await supabase.storage.from('post-images').remove([path]);
    }
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (!error) router.push('/community');
    setIsDeleting(false);
  };

  if (loading) {
    return (
      <>
        <BackButton />
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className="skeleton h-80 rounded-3xl" />
          <div className="skeleton h-40 rounded-3xl" />
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <BackButton />
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-md">
          <div aria-hidden className="mb-3 text-4xl">🫥</div>
          <p className="font-plus-jakarta text-lg font-extrabold">Post not found</p>
          <p className="mt-1 text-sm text-[#B8AA98]">This yap may have been deleted.</p>
        </div>
      </>
    );
  }

  const authorName = post.profiles?.username || 'Anonymous';
  const isOwner = user?.id === post.user_id;
  const primaryMood = post.mood?.[0] ?? null;
  const feeling = getFeeling(primaryMood);
  const color = feeling?.color ?? BRAND_COLOR;
  const extraFeelings = Math.max(0, (post.mood?.length ?? 0) - 1);
  const movieHref = post.movie_id
    ? `/movie-more-info/${post.movie_id}${post.media_type ? `?type=${post.media_type}` : ''}`
    : undefined;

  const moviePill = (
    <>
      {post.movie_image && (
        <div className="relative h-6 w-4 shrink-0 overflow-hidden rounded">
          <Image src={post.movie_image} alt="" fill sizes="16px" className="object-cover" />
        </div>
      )}
      <span className="max-w-[240px] truncate text-xs font-bold text-white/90">{post.movie_title}</span>
    </>
  );

  return (
    <>
      <BackButton />

      {/* Post */}
      <article
        className="relative mb-5 overflow-hidden rounded-3xl border"
        style={{ borderColor: `${color}33`, boxShadow: `0 12px 40px -18px ${color}55` }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {post.movie_image && (
            <Image src={post.movie_image} alt="" fill sizes="700px" className="scale-110 object-cover opacity-35 blur-2xl" />
          )}
          <div className="absolute inset-0 bg-[#0D0A08]" style={{ opacity: post.movie_image ? 0.6 : 0.92 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div
            className="absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${color}66 0%, transparent 70%)`, opacity: 0.85 }}
          />
          <div className="film-grain absolute inset-0" />
        </div>

        <div className="relative z-10 p-5 sm:p-6">
          {/* Author + feeling */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar username={authorName} avatarUrl={post.profiles?.avatar_url} px={40} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-bold text-white">{authorName}</p>
                <p className="text-[11px] font-semibold text-white/70">{formatTimestamp(post.created_at)}</p>
              </div>
            </div>
            {feeling && (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black backdrop-blur-sm"
                style={{ background: `${color}22`, color, boxShadow: `inset 0 0 0 1px ${color}44` }}
              >
                <span aria-hidden>{feeling.emoji}</span>
                {feeling.label}
                {extraFeelings > 0 && <span className="text-white/70">+{extraFeelings}</span>}
              </span>
            )}
          </div>

          {/* Show pill */}
          {post.movie_title && (
            <div className="mb-4">
              {movieHref ? (
                <Link
                  href={movieHref}
                  className="press group/movie inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-2.5 backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/15"
                >
                  {moviePill}
                  <ArrowUpRightIcon className="h-3 w-3 shrink-0 text-white/70 transition group-hover/movie:text-white" />
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-2.5 backdrop-blur-md">
                  {moviePill}
                </div>
              )}
            </div>
          )}

          {edit ? (
            <EditPostForm
              postId={post.id}
              content={post.content || ''}
              mood={post.mood ?? []}
              imageUrl={post.image_url}
              onCancel={() => setEdit(false)}
              onSave={async () => { setEdit(false); await fetchPost(); }}
            />
          ) : (
            <>
              {post.content && (
                <p
                  className="whitespace-pre-wrap break-words text-xl font-bold leading-snug text-white sm:text-2xl"
                  style={{ textShadow: `0 2px 24px ${color}55` }}
                >
                  {post.content}
                </p>
              )}

              {post.image_url && (
                <div className="relative mt-4 h-72 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-96">
                  <Image src={post.image_url} alt="Post photo" fill sizes="700px" className="object-cover" />
                </div>
              )}

              {/* Exact phrase + actions */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="min-w-0 text-xs font-semibold italic" style={{ color: primaryMood ? color : 'rgba(255,255,255,0.7)' }}>
                  {primaryMood ? `“${primaryMood}”` : ''}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUpvote}
                    aria-pressed={liked}
                    aria-label={`${liked ? 'Unlike' : 'Like'}, ${post.upvotes} likes`}
                    className="press inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-black backdrop-blur-md transition-all"
                    style={liked
                      ? { background: `${LIKE_COLOR}30`, color: LIKE_COLOR, boxShadow: `0 0 14px ${LIKE_COLOR}55` }
                      : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    {liked ? <HeartSolidIcon aria-hidden className="h-4 w-4" /> : <HeartIcon aria-hidden className="h-4 w-4" />}
                    <span>{post.upvotes}</span>
                  </button>
                  <a
                    href="#comments"
                    className="press inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-bold text-white/85 backdrop-blur-md transition-colors hover:bg-white/15"
                  >
                    <ChatBubbleLeftEllipsisIcon aria-hidden className="h-4 w-4" />
                    <span>{comments.length}</span>
                  </a>
                </div>
              </div>

              {isOwner && (
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setEdit(true)}
                    className="press inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-bold text-[#EEEAE2] transition-colors hover:bg-white/10"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="press inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 transition-colors hover:bg-rose-500/20"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </article>

      {/* Comments thread */}
      <section
        id="comments"
        className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md sm:p-5"
      >
        <h2 className="mb-4 font-plus-jakarta text-lg font-extrabold text-[#EEEAE2]">
          The <span className="shimmer-text">chat</span>
          <span className="ml-2 text-sm font-semibold text-[#B8AA98]">
            {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
          </span>
        </h2>

        {comments.length === 0 ? (
          <div className="py-8 text-center text-sm font-semibold text-[#B8AA98]">
            No replies yet. Start the chat.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map(comment => {
              const name = comment.profiles?.username || 'Anonymous';
              const mine = !!user && !!currentProfile && name === currentProfile.username;
              return (
                <div key={comment.id} className={`flex items-end gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}>
                  <Avatar username={name} avatarUrl={comment.profiles?.avatar_url} px={32} />
                  <div className={`min-w-0 max-w-[82%] ${mine ? 'items-end text-right' : ''} flex flex-col`}>
                    <div className="mb-1 flex items-baseline gap-2 px-1">
                      <span className="text-xs font-bold text-[#EEEAE2]">{name}</span>
                      <span className="text-[11px] text-[#B8AA98]">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p
                      className={`whitespace-pre-wrap break-words border px-4 py-2.5 text-left text-sm leading-relaxed ${
                        mine
                          ? 'rounded-3xl rounded-br-lg border-[#F5A623]/30 bg-[#F5A623]/15 text-[#EEEAE2]'
                          : 'rounded-3xl rounded-bl-lg border-white/10 bg-white/[0.06] text-[#EEEAE2]'
                      }`}
                    >
                      {comment.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky comment input */}
      <div className="sticky bottom-20 z-20 mt-4 lg:bottom-4">
        <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-[#17120E]/90 p-2 backdrop-blur-xl">
          {user && (
            <Avatar username={currentProfile?.username ?? user.email ?? ''} avatarUrl={currentProfile?.avatar_url} px={36} />
          )}
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment(); }}
            placeholder="say something..."
            aria-label="Write a reply"
            rows={1}
            className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl bg-transparent px-2 py-2.5 text-sm leading-relaxed text-[#EEEAE2] outline-none placeholder:text-[#B8AA98]"
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            aria-label="Send reply"
            className="press flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[#0D0A08] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)' }}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div role="dialog" aria-modal="true" className="flex w-full max-w-sm flex-col gap-5 rounded-3xl border border-white/10 bg-[#17120E]/95 p-6 backdrop-blur-xl">
            <div>
              <p className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-rose-300">Heads up</p>
              <h2 className="font-plus-jakarta text-xl font-extrabold text-[#EEEAE2]">Delete this yap?</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#B8AA98]">
                This will permanently remove your reaction. There&rsquo;s no way to get it back.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="press flex-1 rounded-full border border-white/15 bg-white/[0.06] py-2.5 text-sm font-bold text-[#EEEAE2] transition-colors hover:bg-white/10"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="press flex-1 rounded-full bg-rose-500 py-2.5 text-sm font-black text-white transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PostDetailPage () {
  return (
    <AppShell width="feed">
      <PostDetail />
    </AppShell>
  );
}
