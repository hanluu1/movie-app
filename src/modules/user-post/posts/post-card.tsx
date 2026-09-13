'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeartIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface PostCardProps {
  id: string;
  movieTitle: string | null;
  movieImage?: string | null;
  movieId?: number | null;
  postTitle?: string;
  createdAt: string;
  upvotes: number;
  postContent?: string;
  onLike?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  username?: string;
  commentCount?: number;
  canLike?: boolean;
}

function formatRelativeTime (dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const getInitials = (username: string) => {
  const parts = username.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase();
};

const READ_MORE_THRESHOLD = 160;

export const PostCard = ({
  id, username, movieTitle, movieImage, movieId,
  postTitle, createdAt, postContent, upvotes,
  onLike, onComment, isLiked = false, commentCount = 0, canLike = true,
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const initials = username ? getInitials(username) : '??';
  const isLong = (postContent?.length ?? 0) > READ_MORE_THRESHOLD;

  return (
    <div
      className="bg-[#FFFDF8] border border-[#E8EEEA] rounded-2xl w-full transition-all hover:shadow-md cursor-pointer p-5 flex flex-col gap-3"
      onClick={() => router.push(`/post/${id}`)}
    >
      {/* User + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#2A4649]">
            {initials}
          </div>
          <span className="text-sm font-semibold text-[#172526]">{username || 'Anonymous'}</span>
        </div>
        <span className="text-xs text-[#6F8C88] flex-shrink-0">{formatRelativeTime(createdAt)}</span>
      </div>

      {/* Reaction title — the star */}
      {postTitle && (
        <div className="font-plus-jakarta font-extrabold text-[#172526] text-base leading-snug">
          {postTitle}
        </div>
      )}

      {/* Reaction content */}
      {postContent && (
        <p className="font-dm-sans text-[#3F5E5A] text-base leading-relaxed line-clamp-3">
          {postContent}
        </p>
      )}

      {isLong && (
        <Link
          href={`/post/${id}`}
          onClick={e => e.stopPropagation()}
          className="text-xs font-semibold text-[#2A4649] hover:opacity-70 transition-opacity -mt-1"
        >
          Read more →
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#E8EEEA] flex-wrap">

        {/* Movie pill */}
        {movieTitle && (
          movieId ? (
            <Link
              href={`/movie-more-info/${movieId}`}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2A4649] bg-[#EEF2ED] px-2.5 py-1 rounded-full hover:bg-[#dde5dc] transition-colors mr-auto"
            >
              {movieImage && (
                <Image src={movieImage} alt={movieTitle} width={14} height={20} className="rounded object-cover flex-shrink-0" />
              )}
              {movieTitle}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2A4649] bg-[#EEF2ED] px-2.5 py-1 rounded-full mr-auto">
              {movieImage && (
                <Image src={movieImage} alt={movieTitle} width={14} height={20} className="rounded object-cover flex-shrink-0" />
              )}
              {movieTitle}
            </span>
          )
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canLike) setLiked(prev => !prev);
              onLike?.();
            }}
            className={`flex items-center gap-1 text-xs font-semibold transition-colors ${liked ? 'text-rose-500' : 'text-[#6F8C88] hover:text-rose-500'}`}
          >
            {liked ? <HeartSolidIcon className="w-3.5 h-3.5" /> : <HeartIcon className="w-3.5 h-3.5" />}
            <span>{upvotes}</span>
          </button>

          <span className="text-[#E8EEEA] text-xs">·</span>

          <button
            onClick={(e) => { e.stopPropagation(); onComment?.(); }}
            className="flex items-center gap-1 text-xs font-semibold text-[#6F8C88] hover:text-[#2A4649] transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
            <span>{commentCount}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
