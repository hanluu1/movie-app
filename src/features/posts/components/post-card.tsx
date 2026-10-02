'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface PostCardProps {
  id: string;
  movieTitle: string | null;
  movieImage?: string | null;
  movieId?: number | null;
  mediaType?: string | null;
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
  const diff = Date.now() - new Date(dateStr).getTime();
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

const getInitials = (username: string) => {
  const parts = username.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase();
};

export const PostCard = ({
  id, username, avatarUrl, movieTitle, movieImage, movieId, mediaType,
  postTitle, createdAt, postContent, upvotes,
  onLike, onComment, isLiked = false, commentCount = 0, canLike = true,
  hideAvatar = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const initials = username ? getInitials(username) : '??';
  const isLong = (postContent?.length ?? 0) > 300;

  return (
    <div
      className="bg-[#1E1B18] border border-[#4A4540] rounded-2xl overflow-hidden flex cursor-pointer hover:border-[#6A5E50] transition-colors min-h-[160px] sm:min-h-[220px]"
      onClick={() => router.push(`/post/${id}`)}
    >

      {/* Left: poster + pill — desktop only */}
      {movieImage && (
        <div className="hidden sm:flex flex-col w-1/5 flex-shrink-0">

          {/* Poster */}
          <div
            className="flex-1 relative bg-[#272320]"
            onClick={e => { if (movieId) { e.stopPropagation(); router.push(`/movie-more-info/${movieId}${mediaType ? `?type=${mediaType}` : ''}`); } }}
          >
            <Image src={movieImage} alt={movieTitle || ''} fill className="object-cover" sizes="20vw" />
          </div>

          {/* Pill — sits directly under poster */}
          {movieTitle && (
            <div className="px-2 py-2 border-t border-[#2A2520] flex justify-center">
              {movieId ? (
                <Link
                  href={`/movie-more-info/${movieId}${mediaType ? `?type=${mediaType}` : ''}`}
                  onClick={e => e.stopPropagation()}
                  className="text-sm font-semibold text-[#C8956A] bg-[#C8956A]/10 border border-[#C8956A]/20 px-2.5 py-1 rounded-full hover:bg-[#C8956A]/20 transition-colors truncate max-w-full"
                >
                  {movieTitle}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-[#C8956A]/50 bg-[#C8956A]/10 border border-[#C8956A]/20 px-2.5 py-1 rounded-full truncate max-w-full">
                  {movieTitle}
                </span>
              )}
            </div>
          )}

        </div>
      )}

      {/* Right: content + like/comment */}
      <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">

        {/* User + time */}
        {!hideAvatar && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#0A0908] text-xs font-bold flex-shrink-0 bg-[#C8956A] overflow-hidden relative">
                {avatarUrl
                  ? <Image src={avatarUrl} alt={username || ''} fill className="object-cover" sizes="40px" />
                  : initials}
              </div>
              <span className="text-sm font-semibold text-[#F2EDE4] truncate">{username}</span>
            </div>
            <span className="text-xs text-[#6A5E50] flex-shrink-0">{formatRelativeTime(createdAt)}</span>
          </div>
        )}

        {/* Reaction title */}
        {postTitle && (
          <div className="font-plus-jakarta font-extrabold text-[#F2EDE4] text-xl leading-snug">
            {postTitle}
          </div>
        )}

        {/* Reaction content */}
        {postContent && (
          <p className="text-base text-[#F2EDE4] leading-relaxed line-clamp-3">
            {postContent}
          </p>
        )}

        {isLong && (
          <Link
            href={`/post/${id}`}
            onClick={e => e.stopPropagation()}
            className="text-xs font-semibold text-[#C8956A] hover:opacity-70 transition-opacity -mt-1"
          >
          Read more →
          </Link>
        )}

        {/* Movie pill — mobile only (desktop pill is under the poster) */}
        {movieTitle && (
          <div className="sm:hidden">
            {movieId ? (
              <Link
                href={`/movie-more-info/${movieId}${mediaType ? `?type=${mediaType}` : ''}`}
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C8956A] bg-[#C8956A]/10 border border-[#C8956A]/20 px-2.5 py-1 rounded-full hover:bg-[#C8956A]/20 transition-colors"
              >
                {movieImage && (
                  <div className="w-3 h-5 rounded flex-shrink-0 overflow-hidden relative">
                    <Image src={movieImage} alt={movieTitle} fill className="object-cover" sizes="12px" />
                  </div>
                )}
                <span className="truncate max-w-[140px]">{movieTitle}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-[#C8956A]/50 bg-[#C8956A]/10 border border-[#C8956A]/20 px-2.5 py-1 rounded-full">
                <span className="truncate max-w-[140px]">{movieTitle}</span>
              </span>
            )}
          </div>
        )}

        {/* Like + Comment — pinned to bottom */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-[#2A2520] justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canLike) setLiked(prev => !prev);
              onLike?.();
            }}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${liked ? 'text-rose-400' : 'text-[#4A4038] hover:text-rose-400'}`}
          >
            {liked ? <HeartSolidIcon className="w-3.5 h-3.5" /> : <HeartIcon className="w-3.5 h-3.5" />}
            <span>{upvotes}</span>
          </button>
          <span className="text-[#2A2520] text-xs">·</span>
          <button
            onClick={(e) => { e.stopPropagation(); onComment?.(); }}
            className="flex items-center gap-1 text-xs font-semibold text-[#4A4038] hover:text-[#C8B8A2] transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
            <span>{commentCount}</span>
          </button>
        </div>

      </div>


    </div>
  );
};
