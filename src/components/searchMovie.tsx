'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
}

interface SearchMovieProps {
  onSelect: (movie: { title: string; image: string; overview: string }) => void;
  mode?: 'select' | 'navigate';
}

export const SearchMovie = ({ onSelect, mode = 'navigate' }: SearchMovieProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMoviesOrTv = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          }),
          fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          }),
        ]);

        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        const combinedResults = [
          ...(movieData.results || []),
          ...(tvData.results || []),
        ];

        setResults(combinedResults);
      } catch (error) {
        console.error('Error fetching movie or TV:', error);
      }
    };

    fetchMoviesOrTv();
  }, [query]);

  return (
    <div className="flex flex-col my-2 items-center">
      <div className="flex px-2 justify-center w-full mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your favorite movie or TV show"
          className="border text-black border-gray-300 rounded-lg p-2 w-full"
        />
        {query && (
          <XMarkIcon
            onClick={() => setQuery('')}
            className="w-6 h-6 ml-3 cursor-pointer text-gray-500 hover:text-gray-700"
          />
        )}
      </div>

      <div className="w-full">
        {results.length > 0 ? (
          <div className="flex flex-col gap-2">
            {results.map((movie) => {
              const movieTitle = movie.title || movie.name;
              const imageUrl = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : '';

              return (
                <div
                  key={movie.id}
                  className="flex flex-row gap-5 cursor-pointerp-2 rounded transition"
                  onClick={() => {
                    if (mode === 'select' && onSelect) {
                      onSelect({
                        title: movieTitle,
                        image: imageUrl,
                        overview: movie.overview || '',
                      });
                    }
                  }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={movieTitle}
                      width={128}
                      height={192}
                      className="w-32 h-48 rounded"
                    />
                  ) : (
                    <div className="w-32 h-48 bg-gray-300 flex items-center justify-center rounded">
                      <div className="text-sm text-gray-500">No Image</div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div>
                      {mode === 'navigate' ? (
                        <a
                          href={`/movie-more-info/${movie.id}`}
                          className="text-lg font-bold text-white hover:text-zinc-300 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {movieTitle}
                        </a>
                      ) : (
                        <div className="text-lg font-bold text-blue-500 hover:underline">
                          {movieTitle}
                        </div>
                      )}

                      <div className="text-sm text-gray-500 max-w-[90%] mt-1">
                        {movie.overview}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          alert(`Added "${movieTitle}" to Watched list`);
                        }}
                      >
                        Watched
                      </button>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Added "${movieTitle}" to Will Watch list`);
                        }}
                      >
                        To Watch
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          query && <p className="text-gray-500 text-sm">No results found.</p>
        )}
      </div>
    </div>
  );
};