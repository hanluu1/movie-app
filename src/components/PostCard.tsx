'use client';
import React from 'react';
import Link from 'next/link';

interface PostCardProps {
    id: number;
    title: string;
    createdAt: string;
    upvotes: number;
}

export const PostCard = ({ id, title, createdAt, upvotes }: PostCardProps) => {

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-md transition bg-blue-200 hover:bg-blue-100">
      <Link href={`/post/${id}`}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-yellow-950">{title}</h2>
          <div className="text-sm text-gray-500">
                Created at: {new Date(createdAt).toLocaleString()}
          </div>
          <div className="text-sm text-gray-700 font-semibold">
                Upvotes: {upvotes}
          </div>
        </div>
      </Link>
    </div>
  );
};