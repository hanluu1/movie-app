'use client';
import React, { useState } from 'react';
import Link from 'next/link';
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZWIyMjIxMzFmNTI0MDcxZGIyYjI3MjRjMDlhNTdhNCIsIm5iZiI6MTc0NTU2MTE1MC42MDE5OTk4LCJzdWIiOiI2ODBiMjYzZTc3OGI0NjI2NzM5ZDNjY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TiGNwww1D3a15vLc0FXuuCY2F2Wir1REQVucQYMM6f8";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
}

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    
            const response = await fetch(
                `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json;charset=utf-8",
                  },
                }
            );
    
            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
            } else {
                console.error('Failed to fetch movies');
            }
        };

  return (
    <div className="flex flex-col items-center">
        <h1 className="text-3xl">Welcome to Reel Emotions</h1>
        <p>Search a movie and post your thought</p>
        <div className="flex justify-center w-[100%] mb-4">
            
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a movie..."
                className="border border-gray-300 rounded-lg p-2 w-1/2"
            />
            <button
                onClick={handleSearch}
                className="bg-blue-500 text-white rounded-lg p-2 ml-2"
            >
                Search
            </button>
        </div>
        <div>
            {results.length > 0 ? (
            <div className="flex flex-col">
                {results.map((movie) => (
                <div key={movie.id} className="flex flex-row gap-5">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-32 h-48 mb-2"
                        />
                    ) : (
                        <div className="w-32 h-48 bg-gray-300 flex items-center justify-center mb-2">
                            <span className="text-sm text-gray-500">No Image</span>
                        </div>
                    )}                   
                    <Link href={`/movie/${movie.id}`} className="text-lg font-bold text-blue-500 hover:underline">
                        {movie.title}
                    </Link>
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