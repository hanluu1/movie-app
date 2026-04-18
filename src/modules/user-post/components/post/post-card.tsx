'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HeartIcon, ChatBubbleLeftEllipsisIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface PostCardProps {
  id: string;
  movieTitle: string | null;
  movieImage?: string | null;
  postTitle?: string;
  createdAt: string;
  upvotes: number;
  postContent?: string;
  onLike?: () => void;
  onComment?: () => void;
  isLiked?: boolean;
  postImage?: string;
  username?: string;
  commentCount?: number;
}

function formatDate (dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const READ_MORE_THRESHOLD = 160;

export const PostCard = ({ id, username, movieTitle, movieImage, postTitle, createdAt, postContent, upvotes, onLike, onComment, isLiked = false, commentCount = 0 }: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const router = useRouter();

  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const initials = (username ?? 'AN').slice(0, 2).toUpperCase();
  const isLong = (postContent?.length ?? 0) > READ_MORE_THRESHOLD;

  return (
    <div
      className="bg-white border border-stone-200 rounded-2xl p-5 w-full transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => router.push(`/post/${id}`)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
        >
          {initials}
        </div>
        <div>
          <div className="font-bold text-stone-900">{username || 'Anonymous'}</div>
          <div className="text-sm text-stone-500">{formatDate(createdAt)}</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4">

        {/* Text content */}
        <div className="flex-1 min-w-0">
          {!movieImage && movieTitle && (
            <div className="text-sm font-semibold text-red-600 mb-1">{movieTitle}</div>
          )}
          {postTitle && (
            <div className="font-bold text-stone-900 text-base mb-2">{postTitle}</div>
          )}
          {postContent && (
            <p className="text-stone-600 text-[0.9rem] leading-relaxed line-clamp-3">{postContent}</p>
          )}
          {isLong && (
            <Link
              href={`/post/${id}`}
              onClick={e => e.stopPropagation()}
              className="inline-block mt-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              Read more →
            </Link>
          )}
        </div>

        {/* Poster + movie title below — right side */}
        {movieImage && (
          <div className="flex-shrink-0 flex flex-col items-center gap-2" style={{ width: 88 }}>
            <div className="relative w-full rounded-lg overflow-hidden" style={{ aspectRatio: '2/3' }}>
              <Image
                src={movieImage}
                alt={movieTitle || ''}
                fill
                className="object-cover"
                sizes="88px"
              />
            </div>
            {movieTitle && (
              <div className="text-xs font-semibold text-red-600 text-center leading-tight line-clamp-2 w-full">
                {movieTitle}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(prev => !prev);
            onLike?.();
          }}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${liked ? 'text-red-600' : 'text-stone-500 hover:text-red-600'}`}
        >
          {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
          <span>{upvotes}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onComment?.(); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
          <span>{commentCount}</span>
        </button>
        {/* <button
          className="ml-auto flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-300 hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', color: '#92400E' }}
        >
          <SparklesIcon className="w-4 h-4" /> Similar taste
        </button> */}
      </div>
    </div>
  );
};
