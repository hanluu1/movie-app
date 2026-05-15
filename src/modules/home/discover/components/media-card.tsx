'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FilmIcon, StarIcon, PencilSquareIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { WatchlistButtons } from '@/components/movies/watchlist-buttons';

const overlayBtnBase = 'w-full text-[11px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1';

export default function MediaCard ({ id, title, posterPath, year, rating, index, onReview, releaseDate }: {
  id: number;
  title: string;
  posterPath: string | null;
  year: string;
  releaseDate: string;
  rating: number;
  index: number;
  onReview: () => void;
}) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-stone-200">
      <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-red-100 to-orange-200">
        {posterPath ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="flex items-center justify-center h-full opacity-30">
            <FilmIcon className="w-10 h-10 text-stone-400" />
          </div>
        )}
        {index < 3 && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-br from-amber-400 to-amber-500 text-amber-900">
            #{index + 1}
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
          <StarIcon className="w-2.5 h-2.5" />
          {rating.toFixed(1)}
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 p-2">
          <button onClick={onReview} className={`${overlayBtnBase} bg-white text-stone-900 hover:bg-red-50`}>
            <PencilSquareIcon className="w-3 h-3" /> Review
          </button>
          <WatchlistButtons
            movieId={id}
            title={title}
            posterPath={posterPath}
            releaseDate={releaseDate}
            variant="overlay"
          />
          <Link href={`/movie-more-info/${id}`} className={`${overlayBtnBase} text-white border border-white/30 hover:bg-white/10`}>
            <InformationCircleIcon className="w-3 h-3" /> Detail
          </Link>
        </div>
      </div>
      <div className="p-2">
        <div className="font-bold text-xs truncate text-stone-900">{title}</div>
        <div className="text-[10px] text-stone-500 mt-0.5">{year}</div>
      </div>
    </div>
  );
}
