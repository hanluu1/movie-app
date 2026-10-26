'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
}

function formatRelativeTime (dateStr: string) {
  const diff = Math.max(
    0,
    Date.now() - new Date(dateStr).getTime()
  );

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const getInitials = (username: string) => {
  const parts = username.trim().split(/\s+/);

  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase();
};

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
  canLike = true,
  variant = 'card',
  hideAvatar = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const initials = username ? getInitials(username) : '??';
  const isFeatured = variant === 'featured';
  const isLong = (postContent?.length ?? 0) > 300;

  const movieHref = movieId
    ? `/movie-more-info/${movieId}${
      mediaType ? `?type=${mediaType}` : ''
    }`
    : undefined;

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Read post${username ? ` by ${username}` : ''}${
        movieTitle ? ` about ${movieTitle}` : ''
      }`}
      onClick={() => router.push(`/post/${id}`)}
      onKeyDown={(e) => {
        if (
          (e.key === 'Enter' || e.key === ' ') &&
          e.target === e.currentTarget
        ) {
          e.preventDefault();
          router.push(`/post/${id}`);
        }
      }}
      className={`group relative mx-auto flex w-full max-w-3xl cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[#15110E] text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#75533B] hover:bg-[#19130F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8956A] ${
        isFeatured
          ? 'border-[#64452F]'
          : 'border-[#342820]'
      }`}
    >
      <div
        className={`flex flex-1 flex-col ${
          isFeatured ? 'p-5 sm:p-6' : 'p-4 sm:p-5'
        }`}
      >
        {/* USER HEADER */}
        {!hideAvatar && (
          <div className="mb-5 flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#60422F] bg-[#C8956A] text-sm font-extrabold text-[#17110E] sm:h-12 sm:w-12">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={username || 'User avatar'}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-[#EEEAE2]">
                {username || 'Anonymous'}
              </p>
              <p className="mt-1 text-xs text-[#89796B]">
                {formatRelativeTime(createdAt)}
              </p>
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
          {/* POST CONTENT */}
          <div className="min-w-0 flex-1 order-1">
            {postContent && (
              <div className="mb-1">
                <p
                  className={`whitespace-pre-wrap break-words text-lg leading-7 text-[#EEEAE2] sm:text-xl sm:leading-8 ${
                    isFeatured ? '' : 'line-clamp-5'
                  }`}
                >
                  {postContent}
                </p>

                {isLong && !isFeatured && (
                  <Link
                    href={`/post/${id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#D9A779] hover:text-[#F0C69D]"
                  >
                    Read the rest <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            )}

          </div>

          {/* MOVIE REFERENCE */}
          {movieTitle && (
            <div className="order-2 min-w-0 lg:w-56 lg:shrink-0">
              {movieHref ? (
                <Link
                  href={movieHref}
                  onClick={(e) => e.stopPropagation()}
                  className="group/movie flex w-full min-w-0 items-center gap-3 rounded-xl border border-[#493325] bg-[#211710] p-2.5 pr-3 transition-colors hover:border-[#C8956A]/70 hover:bg-[#2A1D15]"
                >
                  {movieImage ? (
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-[#30231A]">
                      <Image
                        src={movieImage}
                        alt={movieTitle}
                        fill
                        sizes="44px"
                        className="object-cover transition-transform duration-300 group-hover/movie:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-lg bg-[#30231A] text-lg">
                    🎬
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#89796B]">
                    WATCHING
                    </p>
                    <p className="truncate text-sm font-bold text-[#EEEAE2]">
                      {movieTitle}
                    </p>
                  </div>

                  <ArrowUpRightIcon className="h-4 w-4 shrink-0 text-[#89796B] transition group-hover/movie:text-[#D9A779]" />
                </Link>
              ) : (
                <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-[#493325] bg-[#211710] p-2.5 pr-3">
                  {movieImage && (
                    <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={movieImage}
                        alt={movieTitle}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#89796B]">
                    WATCHING
                    </p>
                    <p className="truncate text-sm font-bold text-[#EEEAE2]">
                      {movieTitle}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ENGAGEMENT */}
        <div className="mt-auto flex items-center gap-4 border-t border-[#30241D] pt-4">
          <button
            type="button"
            aria-label={liked ? 'Unlike post' : 'Like post'}
            aria-pressed={liked}
            disabled={!canLike}
            onClick={(e) => {
              e.stopPropagation();

              if (!canLike) return;

              setLiked((prev) => !prev);
              onLike?.();
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              liked
                ? 'text-rose-400'
                : 'text-[#A18F80] hover:text-rose-400'
            }`}
          >
            {liked ? (
              <HeartSolidIcon className="h-[18px] w-[18px]" />
            ) : (
              <HeartIcon className="h-[18px] w-[18px]" />
            )}
            <span>{upvotes} felt this</span>
          </button>

          <button
            type="button"
            aria-label={`View ${commentCount} comments`}
            onClick={(e) => {
              e.stopPropagation();
              onComment?.();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg py-1 text-xs font-bold text-[#A18F80] transition-colors hover:text-[#EEEAE2]"
          >
            <ChatBubbleLeftEllipsisIcon className="h-[18px] w-[18px]" />
            <span>
              {commentCount} {commentCount === 1 ? 'reply' : 'replies'}
            </span>
          </button>

          <span className="flex-1" />

        </div>
      </div>
    </article>
  );
};