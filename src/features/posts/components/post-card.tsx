'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRightIcon, ChatBubbleLeftEllipsisIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { BRAND_COLOR, getFeeling } from '@/lib/moods';

const LIKE_COLOR = '#FF4D6D';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BURST_PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return { dx: Math.round(Math.cos(angle) * 26), dy: Math.round(Math.sin(angle) * 26) };
});

const MAX_TILT_DEG = 3;

function formatRelativeTime (dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 5) return `${weeks}w`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials (username: string) {
  const parts = username.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase();
}

function getTextSize (text?: string) {
  const len = text?.length ?? 0;
  if (len === 0) return 'text-2xl font-black';
  if (len < 60) return 'text-3xl font-black leading-tight';
  if (len < 150) return 'text-2xl font-black leading-snug';
  if (len < 300) return 'text-lg font-bold leading-snug';
  return 'text-base font-semibold leading-relaxed';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PostCardProps {
  id: string;
  movieTitle?: string | null;
  movieImage?: string | null;
  movieId?: number | null;
  mediaType?: string | null;
  mood?: string[] | null;
  postTitle?: string;
  createdAt: string;
  upvotes: number;
  postContent?: string;
  onLike?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  username?: string;
  avatarUrl?: string | null;
  commentCount?: number;
  canLike?: boolean;
  variant?: 'card' | 'featured';
  hideAvatar?: boolean;
  imageUrl?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const PostCard = ({
  id,
  username,
  avatarUrl,
  movieTitle,
  movieImage,
  movieId,
  mediaType,
  createdAt,
  postContent,
  upvotes,
  onLike,
  onComment,
  isLiked = false,
  commentCount = 0,
  mood,
  canLike = true,
  variant = 'card',
  imageUrl,
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [burstId, setBurstId] = useState(0);
  const router = useRouter();
  const cardRef = useRef<HTMLElement>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    return () => { if (burstTimer.current) clearTimeout(burstTimer.current); };
  }, []);

  const initials = username ? getInitials(username) : '??';
  const isFeatured = variant === 'featured';
  const isLong = (postContent?.length ?? 0) > 300;

  const primaryMood = mood?.[0] ?? null;
  const feeling = getFeeling(primaryMood);
  const color = feeling?.color ?? BRAND_COLOR;
  const extraFeelings = Math.max(0, (mood?.length ?? 0) - 1);

  const movieHref = movieId
    ? `/movie-more-info/${movieId}${mediaType ? `?type=${mediaType}` : ''}`
    : undefined;

  const handleReaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canLike) return;
    setLiked((prev) => !prev);
    onLike?.();
    // Burst on like only; un-liking stays quiet
    if (!liked) {
      setBurstId((n) => n + 1);
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBurstId(0), 650);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el || e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(px * MAX_TILT_DEG).toFixed(2)}deg) translateY(-4px)`;
  };

  const resetTilt = () => {
    if (cardRef.current) cardRef.current.style.transform = '';
  };

  const pill = (
    <>
      {movieImage && (
        <div className="relative h-6 w-4 shrink-0 overflow-hidden rounded">
          <Image src={movieImage} alt="" fill sizes="16px" className="object-cover" />
        </div>
      )}
      <span className="max-w-[200px] truncate text-xs font-bold text-white/90">{movieTitle}</span>
    </>
  );

  return (
    <article
      ref={cardRef}
      role="link"
      tabIndex={0}
      aria-label={`Read post${username ? ` by ${username}` : ''}${movieTitle ? ` about ${movieTitle}` : ''}`}
      onClick={() => router.push(`/post/${id}`)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault();
          router.push(`/post/${id}`);
        }
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      className={`group relative mx-auto flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl border text-left transition-[transform,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        isFeatured ? 'min-h-[320px]' : 'min-h-[240px]'
      }`}
      style={{ borderColor: `${color}33`, boxShadow: `0 0 0 0 ${color}00, 0 12px 40px -18px ${color}55` }}
    >

      {/* ── BACKGROUND LAYER ── */}
      <div className="pointer-events-none absolute inset-0">
        {movieImage && (
          <Image
            src={movieImage}
            alt=""
            fill
            sizes="700px"
            className="scale-110 object-cover opacity-35 blur-2xl"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-[#0D0A08]" style={{ opacity: movieImage ? 0.6 : 0.92 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Emotion aura */}
        <div
          className="absolute -right-16 -top-16 h-72 w-72 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${color}66 0%, transparent 70%)`, opacity: 0.85 }}
        />
        <div
          className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${color}22 0%, transparent 70%)` }}
        />
        <div className="film-grain absolute inset-0" />
      </div>

      {/* ── FOREGROUND ── */}
      <div className={`relative z-10 flex flex-1 flex-col ${isFeatured ? 'p-6' : 'p-5'}`}>

        {/* Who + feeling */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/10 text-[11px] font-black text-white">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={username || ''} fill sizes="36px" className="object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-white">{username || 'Anonymous'}</p>
              <p className="text-[11px] font-semibold text-white/60">{formatRelativeTime(createdAt)}</p>
            </div>
          </div>

          {feeling && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black backdrop-blur-sm"
              style={{ background: `${color}22`, color, boxShadow: `inset 0 0 0 1px ${color}44` }}
            >
              <span aria-hidden>{feeling.emoji}</span>
              {feeling.label}
              {extraFeelings > 0 && <span className="text-white/60">+{extraFeelings}</span>}
            </span>
          )}
        </div>

        {/* Show pill */}
        {movieTitle && (
          <div className="mb-4">
            {movieHref ? (
              <Link
                href={movieHref}
                onClick={(e) => e.stopPropagation()}
                className="press group/movie inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-2.5 backdrop-blur-md transition-colors hover:border-white/35 hover:bg-white/15"
              >
                {pill}
                <ArrowUpRightIcon className="h-3 w-3 shrink-0 text-white/60 transition group-hover/movie:text-white" />
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1 pl-1.5 pr-2.5 backdrop-blur-md">
                {pill}
              </div>
            )}
          </div>
        )}

        {/* The yap */}
        {postContent && (
          <div className="flex-1">
            <p
              className={`${getTextSize(postContent)} text-white ${isLong && !isFeatured ? 'line-clamp-6' : ''}`}
              style={{ textShadow: `0 2px 24px ${color}55` }}
            >
              {postContent}
            </p>
            {isLong && !isFeatured && (
              <Link
                href={`/post/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-flex items-center gap-1 text-xs font-black"
                style={{ color }}
              >
                read more →
              </Link>
            )}
          </div>
        )}

        {/* User photo */}
        {imageUrl && (
          <div className="relative mt-4 h-52 w-full overflow-hidden rounded-2xl border border-white/10">
            <Image src={imageUrl} alt="Post photo" fill sizes="700px" className="object-cover" />
          </div>
        )}

        {/* Footer: exact phrase + reactions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs font-semibold italic" style={{ color: primaryMood ? color : 'rgba(255,255,255,0.6)' }}>
            {primaryMood ? `“${primaryMood}”` : ''}
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                disabled={!canLike}
                aria-pressed={liked}
                aria-label={`${liked ? 'Unlike' : 'Like'}, ${upvotes} likes`}
                onClick={handleReaction}
                className="press inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black backdrop-blur-md transition-all disabled:cursor-not-allowed disabled:opacity-50"
                style={liked
                  ? { background: `${LIKE_COLOR}30`, color: LIKE_COLOR, boxShadow: `0 0 14px ${LIKE_COLOR}55` }
                  : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
              >
                {liked
                  ? <HeartSolidIcon aria-hidden className="h-4 w-4 scale-110 transition-transform duration-150" />
                  : <HeartIcon aria-hidden className="h-4 w-4" />}
                <span>{upvotes}</span>
              </button>

              {burstId > 0 && (
                <span key={burstId} aria-hidden className="pointer-events-none absolute left-5 top-1/2">
                  {BURST_PARTICLES.map((p, i) => (
                    <span
                      key={i}
                      className="burst-particle absolute -ml-2 -mt-2 text-sm"
                      style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px` } as CSSProperties}
                    >
                      ❤️
                    </span>
                  ))}
                </span>
              )}
            </div>

            <button
              type="button"
              aria-label={`Comments, ${commentCount}`}
              onClick={(e) => { e.stopPropagation(); onComment?.(); }}
              className="press inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 backdrop-blur-md transition-colors hover:bg-white/15"
            >
              <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
              <span>{commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
