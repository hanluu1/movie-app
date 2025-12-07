'use client';

import { PlusIcon, GlobeAltIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';

interface ActionBarProps {
    onCreatePost?: () => void;
}
export const ActionBar = ({ onCreatePost }: ActionBarProps) => {

  return (
    <div className="flex flex-row justify-between items-center bg-gray-900 border border-gray-700 rounded-2xl px-6 py-4">
      <GlobeAltIcon
        className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition"
        aria-hidden="true"
      />
      <button
        type="button"
        aria-label="Create post"
        onClick={onCreatePost}
        className="p-0 m-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/40"
        title="Create post"
      >
        <PlusIcon className="h-6 w-6 text-gray-300 hover:text-blue-400 transition" />
      </button>
      <Link href="my-movies" aria-label="My Movies">
        <BookmarkIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
      </Link>
    </div>

  );
}