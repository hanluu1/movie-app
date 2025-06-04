'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { Header } from '@/components/Header';

export default function MyMoviesPage() {
    const [watchedMovies, setWatchedMovies] = useState<string[]>([]);
    const [unwatchedMovies, setUnwatchedMovies] = useState<string[]>([]);
    useState(() => {
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
      <Header showSearchIcon={false}/>
      <div className="flex flex-row bg-gray-900 border border-gray-700 rounded-2xl w-[90%] gap-4 mx-auto my-10 p-6">
        <div>Watched</div>
        <div>To Watch</div>
      </div>
    </div>
  );
}