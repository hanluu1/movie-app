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
}

export const PostCard = ({ id, movieTitle, movieImage, postTitle, createdAt, upvotes }: PostCardProps) => {

  return (
    <div className="border rounded-lg w-1/2 p-4 shadow hover:shadow-md transition bg-[#f8f4f4] hover:bg-gray-400">
      <Link href={`/post/${id}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {movieImage && (
              <Image
                src={movieImage}
                alt={movieTitle || ''}
                className="w-full h-40 object-cover rounded"
                width={50}
                height={150}
              />
            )}

            {/* Movie Title */}
            {movieTitle && (
              <h3 className="text-lg font-semibold text-gray-800">{movieTitle}</h3>
            )}
          </div>
          <h2 className="text-xl font-bold text-yellow-950">{postTitle}</h2>
          <div className="text-sm text-gray-500">
                Created at: {new Date(createdAt).toLocaleString()}
          </div>
          <div className="text-sm text-gray-700 font-semibold">
                Likes: {upvotes}
          </div>
        </div>
      </Link>
    </div>
  );
};