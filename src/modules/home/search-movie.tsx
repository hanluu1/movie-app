'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabaseClient';
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
  onRefetch?: () => void; 
  mode?: 'select' | 'navigate';
}

export const SearchMovie = ({ onSelect, onRefetch, mode = 'navigate' }: SearchMovieProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [showSearchInput, setShowSearchInput] = useState(true);
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

  const handleAddToList = async (movie: Movie, status: 'watched' | 'to-watch') => {
    const movieTitle = movie.title || movie.name;
    const imageUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '';
    //check if movie already exists in the database
    const { data: existingMovies, error: fetchError } = await supabase
      .from('track_movies')
      .select('id')
      .eq('movie_id', movie.id.toString())
      .eq('status', status)
      .maybeSingle();
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing movies:', fetchError);
      alert('Something went wrong while checking the movie list.');
      return;
    }
    if (existingMovies) { return alert(`"${movieTitle}" is already in your ${status === 'watched' ? 'Watched' : 'To Watch'} list.`); }
    //insert add movie to the database
    const { error } = await supabase
      .from('track_movies')
      .insert({
        movie_id: movie.id.toString(),
        movie_title: movieTitle,
        poster_url: imageUrl,
        movie_overview: movie.overview || '',
        status,
      })
    
    if (onRefetch) {
      onRefetch();
    }
    if (error) {
      console.error(`Error adding to ${status} list:`, error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="flex flex-col my-2 items-center">
      {showSearchInput && (
        <div className="relative px-2 w-full mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your favorite movie or TV show"
            className="w-full border text-black border-gray-300 rounded-lg p-2 pr-10"
          />
          <XMarkIcon
            onClick={() => {
              if (query) {
                setQuery('');
              } else {
                setShowSearchInput(false);
              }
            }}
            className="w-5 h-5 text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          />
        </div>
      )}


      <div className="ml-2">
        {results.length > 0 ? (
          <div className="flex flex-col mt-2 gap-2">
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
                        <div className="text-lg font-bold text-white hover:text-zinc-300 transition">
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
                          handleAddToList(movie, 'watched');
                        }}
                      >
                        Watched
                      </button>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
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
            })}
          </div>
        ) : (
          query && <p className="text-gray-500 text-sm">No results found.</p>
        )}
      </div>
    </div>
  );
};