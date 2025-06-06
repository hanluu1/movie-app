'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/components';
import { SearchMovie } from '@/modules/home';
export default function MyMoviesPage() {
     const[showSearch, setShowSearch] = useState(false);
    const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
    const [unwatchedMovies, setUnwatchedMovies] = useState<string[]>([]);
    useEffect(() => {
        const fetchMovies = async () => {
            const {data, error} = await supabase
                .from('track-movie')
                .select('*');
            if (data) {
                setWatchedMovies(data.filter(movie => movie.status === 'watched'));
                setUnwatchedMovies(data.filter(movie => movie.status === 'To Watch'));
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
        <div>Watched</div>
        <div>To Watch</div>
      </div>
    </div>
  );
}