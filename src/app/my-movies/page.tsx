'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/components';
import { SearchMovie } from '@/modules/home';
import Image from 'next/image';
export default function MyMoviesPage () {
  const[showSearch, setShowSearch] = useState(false);
    type Movie = {
        movie_id: number;
        poster_url: string;
        movie_title: string;
        status: string;
    };
    const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
    const [unwatchedMovies, setUnwatchedMovies] = useState<Movie[]>([]);
    useEffect(() => {
      const fetchMovies = async () => {
        const {data, error} = await supabase
          .from('track_movies')
          .select('*');
        if (data) {
          setWatchedMovies(data.filter(movie => movie.status === 'watched'));
          setUnwatchedMovies(data.filter(movie => movie.status === 'to-watch'));
        }
      };
      fetchMovies();
    }, []);

    return (
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
        <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)}/>
        {showSearch && (
          <div className="w-full ">
            <SearchMovie 
              mode="navigate"
              onSelect={
                (movie) => {
                  setShowSearch(false);
                  window.location.href = `/movie-more-info/${movie.id}`;
                }
              }/>
          </div>
        )}
        <div className="flex flex-row gap-4 mx-auto my-10 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center text-xl py-1 bg-gray-900 border border-gray-700 rounded-2xl font-semibold">Watched</div>
            <div className="flex flex-col gap-2 overflow-x-auto">
              {watchedMovies.map((movie, index) => (
                <div key={index} className="flex gap-3">
                  <Image
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    width={100}
                    height={150}
                    className="w-[100px] h-auto rounded"                  
                  />
                  <div className="text-xl text-white">{movie.movie_title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center text-xl py-1 bg-gray-900 border border-gray-700 rounded-2xl font-semibold">Watched</div>
            <div className="flex flex-col gap-2 overflow-x-auto">
              {unwatchedMovies.map((movie, index) => (
                <div key={index} className="flex gap-3">
                  <Image
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    width={100}
                    height={150}
                    className="w-[100px] h-auto rounded"                  
                  />
                  <div className="text-xl text-white">{movie.movie_title}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
}