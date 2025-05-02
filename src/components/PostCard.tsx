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
}

export const PostCard = ({ id, movieTitle, movieImage, postTitle, createdAt, postContent, upvotes, onLike, onComment }: PostCardProps) => {


  return (
    <div className="border rounded-lg w-1/2 p-4 shadow hover:shadow-md transition bg-[#f8f4f4]">
      <div>
        <div className="flex flex-col gap-2">
          <div className='flex flex-row justify-between'>
            <div className='flex flex-col w-4/5'>
              <Link href={`/post/${id}`} >
                <h2 className="text-xl font-bold text-yellow-950">{postTitle}</h2>
              </Link>
              <div className="text-sm text-gray-500">
                {new Date(createdAt).toLocaleString()}
              </div>
              <p className="text-lg mb-6">{postContent}</p>

            </div>
            <div className="flex flex-col items-center">
              {movieImage && (
                <Image
                  src={movieImage}
                  alt={movieTitle || ''}
                  className="w-20 h-24 object-cover rounded"
                  width={50}
                  height={150}
                />
              )}
            </div>
          </div>
          <div className="flex flex-row justify-between mt-2 mb-1 px-4">
            <button
              onClick={onLike}
              className="bg-[#cfcfcf] text-black px-4 py-2 rounded-lg hover:bg-zinc-400"
            >
              Like {upvotes}
            </button>
            <button
              onClick={onComment}
              className="bg-[#cfcfcf] text-black px-4 py-2 rounded-lg self-end hover:bg-zinc-400"
            >
              Comment
            </button>
            <button
             
              className="bg-[#cfcfcf] text-black px-4 py-2 rounded-lg hover:bg-zinc-400"
            >
              Save
            </button>

              
          </div>
        </div>
      </div>
    </div>
  );
};