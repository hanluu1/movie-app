'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
import { searchMoviesAndTv } from '@/utils/tmdb';

interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
  release_date?: string;
}

interface SearchMovieProps {
  onSelect: (movie: { title: string; image: string; release_date: string }) => void;
  onRefetch?: () => void;
  mode?: 'select' | 'navigate';
}

export const SearchMovie = ({ onSelect, onRefetch, mode = 'navigate' }: SearchMovieProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(true);
  // Fetch results from TMDB
  useEffect(() => {
    const fetchResults = async () => {
      const fetchResults = await searchMoviesAndTv(query);
      setResults(fetchResults);
    };

    fetchResults();
  }, [query]);

  const getImageUrl = (path: string) => path ? `https://image.tmdb.org/t/p/w500${path}` : '';

  const handleAddToList = async (movie: Movie, status: 'watched' | 'to-watch' | 'watching') => {
    const title = movie.title || movie.name;
    const poster = getImageUrl(movie.poster_path);

    const { data: exists, error: fetchError } = await supabase
      .from('track_movies')
      .select('id')
      .eq('movie_id', movie.id.toString())
      .eq('status', status)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError);
      return alert('Something went wrong checking the movie list.');
    }

    if (exists) {
      return alert(`Movie "${title}" is already in your ${status} list.`);
    }
    
    const { error } = await supabase
      .from('track_movies')
      .insert({
        movie_id: movie.id.toString(),
        movie_title: title,
        poster_url: poster,
        movie_release: movie.release_date || '',
        status,
      });

    
    if (error) {
      console.error('Insert error:', error);
      alert('Failed to add movie.');
    } else {
      alert(`Movie "${title}" added to your ${status} list.`);
    }
    if (onRefetch) onRefetch();
  };

  const handleMovieClick = (movie: Movie) => {
    if (mode === 'select') {
      onSelect({
        title: movie.title || movie.name,
        image: getImageUrl(movie.poster_path),
        release_date: movie.release_date || '',
      });
    }
  };

  const renderMovieCard = (movie: Movie) => {
    const title = movie.title || movie.name;
    const image = getImageUrl(movie.poster_path);

    return (
      <div
        key={movie.id}
        className="flex gap-5 cursor-pointer p-2 rounded hover:bg-zinc-800 transition"
        onClick={() => handleMovieClick(movie)}
      >
        {image ? (
          <Image src={image} alt={title} width={50} height={100} className="w-18 h-22 rounded" />
        ) : (
          <div className="w-32 h-48 bg-gray-300 flex items-center justify-center rounded">
            <span className="text-sm text-gray-500">No Image</span>
          </div>
        )}
        <div className="flex flex-col gap-2 max-w-[75%]">
          <div>
            {mode === 'navigate' ? (
              <a
                href={`/movie-more-info/${movie.id}`}
                className="text-lg font-bold text-white hover:text-zinc-300"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </a>
            ) : (
              <div className="font-semibold text-white">{title}</div>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-3">
            {movie.release_date ? `Release ${movie.release_date.slice(0, 4)}` : 'No release year'}
          </p>

          <div className="flex gap-2 mt-1">
            <button
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToList(movie, 'watched');
              }}
            >
              Watched
            </button>
            <button
              className=" px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToList(movie, 'watching');
              }}
            >
              Watching
            </button>
            <button
              className=" px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToList(movie, 'to-watch');
              }}
            >
              To Watch
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center w-full px-4 pt-4"> 
      <div className="relative w-full">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your favorite movie or TV show"
          className="w-full border text-black border-gray-300 rounded-lg p-2 pr-10"
        />
        <XMarkIcon
          onClick={() => (query ? setQuery('') : setShowSearchInput(false))}
          className="w-5 h-5 text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        />
        {results.length > 0 && (
          <div className="absolute z-50 right-0 left-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg max-h-[300px] overflow-y-auto">
            <div className="flex flex-col gap-2 p-2">
              {results.map(renderMovieCard)}
            </div>
          </div>
        )}
      </div>
    </div>

  );
};
