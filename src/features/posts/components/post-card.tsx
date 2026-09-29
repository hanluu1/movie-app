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

function formatRelativeTime(dateStr: string) {
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
  variant = 'card', hideAvatar = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const initials = username ? getInitials(username) : '??';

  const avatarEl = (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 bg-[#2A4649] overflow-hidden relative">
      {avatarUrl
        ? <Image src={avatarUrl} alt={username || ''} fill className="object-cover" sizes="24px" />
        : initials}
    </div>
  );

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canLike) setLiked(prev => !prev);
    onLike?.();
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.();
  };

  const movieInfoHref = movieId
    ? `/movie-more-info/${movieId}${mediaType ? `?type=${mediaType}` : ''}`
    : null;

  const overlayContent = (isFeatured = false) => (
    <div className="absolute inset-0 flex flex-col justify-end p-5 gap-2">

      {/* Movie name pill — above the title, clickable if we have an ID */}
      {movieTitle && (
        <div className="w-fit">
          {movieInfoHref ? (
            <Link
              href={movieInfoHref}
              onClick={e => e.stopPropagation()}
              className="text-xs font-semibold text-[#F2EDE4] bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-[#C8956A] hover:text-[#0A0908] transition-all"
            >
              {movieTitle}
            </Link>
          ) : (
            <span className="text-xs font-semibold text-[#F2EDE4] bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {movieTitle}
            </span>
          )}
        </div>
      )}

      {/* Reaction title — hero */}
      {postTitle && (
        <p className={`font-plus-jakarta font-bold text-[#F2EDE4] leading-snug ${
          isFeatured ? 'text-3xl line-clamp-2' : 'text-2xl line-clamp-2'
        }`}>
          {postTitle}
        </p>
      )}

      {/* Content excerpt */}
      {postContent && (
        <p className="text-sm text-[#A89880] line-clamp-2 leading-relaxed">
          {postContent}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!hideAvatar && (
            <>
              {avatarEl}
              <span className="text-xs text-[#8C7E6E] font-medium truncate">{username || 'Anonymous'}</span>
              <span className="text-[#3A3530] flex-shrink-0">·</span>
            </>
          )}
          <span className="text-xs text-[#6A5E50] flex-shrink-0">{formatRelativeTime(createdAt)}</span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              liked ? 'text-rose-400' : 'text-[#6A5E50] hover:text-rose-400'
            }`}
          >
            {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            <span>{upvotes}</span>
          </button>
          <button
            onClick={handleComment}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6A5E50] hover:text-[#F2EDE4] transition-colors"
          >
            <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            <span>{commentCount}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (variant === 'featured') {
    return (
      <div
        className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => router.push(`/post/${id}`)}
      >
        {movieImage ? (
          <Image
            src={movieImage}
            alt={movieTitle || ''}
            fill
            className="object-cover opacity-55 group-hover:opacity-65 transition-opacity duration-300"
            sizes="(min-width: 1280px) 1024px, 100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111009]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-[#0A0908]/60 to-transparent" />
        {overlayContent(true)}
      </div>
    );
  }

  return (
    <div
      className="relative h-72 rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => router.push(`/post/${id}`)}
    >
      {movieImage ? (
        <Image
          src={movieImage}
          alt={movieTitle || ''}
          fill
          className="object-cover opacity-55 group-hover:opacity-70 transition-opacity duration-300"
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-[#111009]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0908] via-[#0A0908]/60 to-transparent" />
      {overlayContent(false)}
    </div>
  );
};
