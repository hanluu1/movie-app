'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/components';
import { SearchMovie } from '@/modules/home';
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
        <div className="flex flex-row bg-gray-900 border border-gray-700 rounded-2xl w-[90%] gap-4 mx-auto my-10 p-6">
          <div className="flex flex-col gap-4 w-1/2">
            <h2 className="text-xl font-semibold">Watched</h2>
            <div className="flex flex-col gap-2 overflow-x-auto">
              {watchedMovies.map((movie, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    className="w-[100px] h-auto rounded"
                  />
                  <div className="text-base text-white">{movie.movie_title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-1/2">
            <h2 className="text-xl font-semibold">To Watch</h2>
            <div className="flex flex-col gap-2 overflow-x-auto">
              {unwatchedMovies.map((movie, index) => (
                <div key={index} className="flex items-center gap-3">
                  <img
                    key={index}
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    className="w-[100px] h-auto rounded"
                  />
                  <div className="text-base text-white">{movie.movie_title}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
}