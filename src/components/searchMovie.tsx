'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
}

export const SearchMovie = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);  


  useEffect(() => {
    const fetchMoviesOrTv = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      try {
        // Try searching movies first
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json;charset=utf-8",
              },
            }
          ),
          fetch(
            `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json;charset=utf-8",
              },
            }
          ),
        ]);
          
        const movieData = await movieRes.json();
        const tvData = await tvRes.json();

        //combine the results
        const combinedResults = [...movieData.results, ...tvData.results];
        
        setResults(combinedResults);
      }
      catch (error) {
        console.error('Error fetching movie or TV:', error);
      }

    };

    fetchMoviesOrTv();
  }, [query]); // 👈 Automatically run every time the query changes


  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl">Welcome to Reel Emotions</h1>
      <p>Search a movie to create a new post or basically create new post if no result found</p>
      <div className="flex gap-2 justify-center w-[100%] mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="border border-gray-300 rounded-lg p-2 w-1/2"
        />
        
        <button className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
          <Link href="/create-post">
              Create New Post
          </Link>
        </button>
      </div>
      
      <div>
        {results.length > 0 ? (
          <div className="flex flex-col">
            {results.map((movie) => (
              <div key={movie.id} className="flex flex-row gap-5">
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    width={128}
                    height={192}
                    className="w-32 h-48 mb-2"
                  />
                ) : (
                  <div className="w-32 h-48 bg-gray-300 flex items-center justify-center mb-2">
                    <span className="text-sm text-gray-500">No Image</span>
                  </div>
                )} 
                <div className='flex flex-col'>               
                  <Link href={`/movie/${movie.id}`} className="text-lg font-bold text-blue-500 hover:underline">
                    {movie.title || movie.name}
                  </Link>
                  <Link
                    href={`/create-post?title=${encodeURIComponent(movie.title || movie.name)}&image=https://image.tmdb.org/t/p/w500${movie.poster_path}&overview=${encodeURIComponent(movie.overview)}`}
                  >
                    <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-green-600">
                      Create Post
                    </button>
                  </Link>
                </div>
              </div>   
            ))}
          </div>
        ) : (
          query && <p>No result found</p>
        )}
      </div>
    </div>
  );
};