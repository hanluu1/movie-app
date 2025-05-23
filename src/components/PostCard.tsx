'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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


  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl mx-auto p-6 shadow-xl hover:shadow-blue-900/40 transition duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col w-4/5">
            <Link href={`/post/${id}`}>
              <h2 className="text-2xl font-bold text-white hover:text-blue-400 transition">
                {postTitle}
              </h2>
            </Link>
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
  
        <div className="flex justify-between items-center mt-2 text-sm text-gray-300">
          <button
            onClick={onLike}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            👍 Like {upvotes}
          </button>
          <button
            onClick={onComment}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            💬 Comment
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            📌 Save
          </button>
        </div>
      </div>
    </div>
  );
};  