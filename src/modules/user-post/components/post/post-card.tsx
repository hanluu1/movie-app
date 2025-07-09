'use client';
import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/16/solid';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/16/solid';
import { HandThumbUpIcon as HandThumbUpOutline } from '@heroicons/react/24/outline';

interface PostCardProps {
    id: number;
    movieTitle: string | null;
    movieImage: string | null;
    postTitle: string;
    createdAt: string;
    upvotes: number;
    postContent?: string;
    onLike?: () => void;
    onComment?: () => void;
    postImage?: string;
}

export const PostCard = ({ id, movieTitle, movieImage, postTitle, createdAt, postContent, upvotes, postImage, onLike, onComment }: PostCardProps) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl mx-auto p-6 shadow-xl hover:shadow-blue-900/40 transition duration-300">
      <Link href={`/post/${id}`}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col w-4/5">
              <h2 className="text-2xl font-bold text-white">
                {postTitle}
              </h2>
              <span className="text-sm text-gray-400">
                {new Date(createdAt).toLocaleString()}
              </span>
              <p className="text-gray-300 mt-2">{postContent}</p>
            </div>
  
            {movieImage && (
              <div className="shrink-0">
                <Image
                  src={movieImage}
                  alt={movieTitle || ''}
                  className="rounded-lg object-cover w-24 h-32 border border-gray-600"
                  width={96}
                  height={128}
                />
              </div>
            )}
          </div>
  
          {postImage && (
            <Image
              src={postImage}
              alt={postTitle}
              className="w-full rounded-lg border border-gray-700"
              width={600}
              height={300}
            />
          )}
  
          <div className="flex items-center gap-5 mt-2 text-sm text-gray-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setLiked((prev) => !prev);
                if (onLike) onLike();
              }}
              className={`flex items-center justify-center w-1/2 gap-1 px-4 py-2 rounded-lg transition
              ${liked ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              {liked ? (
                <HandThumbUpSolid className="h-5 w-5" />
              ) : (
                <HandThumbUpOutline className="h-5 w-5" />
              )}
              Like {upvotes}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onComment) onComment();
              }}
              className="flex items-center justify-center w-1/2 gap-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Comment
            </button>
            
          </div>
        </div>
      </Link>
    </div>
  );
};  