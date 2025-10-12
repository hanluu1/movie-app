'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Header } from '@/layout';
import { SearchMovie } from '@/modules/home';
import Image from 'next/image';
export default function MyMoviesPage () {
  const[showSearch, setShowSearch] = useState(false);
  type Movie = {
      movie_id: number;
      poster_url: string;
      movie_title: string;
      status: string;
      movie_overview: string;
  };
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [unwatchedMovies, setUnwatchedMovies] = useState<Movie[]>([]);
  const [watchingMovies, setWatchingMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<'watched' | 'watching' | 'to-watch'|'all'>('watched');
  const [searchQuery, setSearchQuery] = useState('');

  const refetchMovieDetails = async () => {
    const {data, error} = await supabase
      .from('track_movies')
      .select('*');
    if (error) {
      console.error('Error fetching movie details:', error);
      return [];
    }
    
    setWatchedMovies(data.filter(movie => movie.status === 'watched'));
    setWatchingMovies(data.filter(movie => movie.status === 'watching'));
    setUnwatchedMovies(data.filter(movie => movie.status === 'to-watch'))
  }
    
  useEffect(() => {
    const fetchMovies = async () => {
      const {data} = await supabase
        .from('track_movies')
        .select('*');
      if (data) {
        setWatchedMovies(data.filter(movie => movie.status === 'watched'));
        setWatchingMovies(data.filter(movie => movie.status === 'watching'));
        setUnwatchedMovies(data.filter(movie => movie.status === 'to-watch'));
      }
    };
      
    fetchMovies();
    refetchMovieDetails();
  }, []);
    
  const filteredWatched = watchedMovies.filter(movie =>
    movie.movie_title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredWatching = watchingMovies.filter(movie =>
    movie.movie_title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUnwatched = unwatchedMovies.filter(movie =>
    movie.movie_title.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
                window.location.href = `/movie-more-info/${movie.movie_id}`;
              }
            }
            onRefetch={refetchMovieDetails}/>
        </div>
      )}
      <div className="flex flex-col w-full gap-4 mx-auto my-2 p-6">
        <div className='flex flex-row gap-2'>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className='px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          
          <button
            className={`px-4 py-2 rounded ${activeTab === 'all' ? 'bg-white text-black' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'watched' ? 'bg-white text-black' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('watched')}
          >
            Watched
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'watching' ? 'bg-white text-black' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('watching')}
          >
            Watching
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'to-watch' ? 'bg-white text-black' : 'bg-gray-700'}`}
            onClick={() => setActiveTab('to-watch')}
          >
            To Watch
          </button>
        </div>

        {activeTab === 'all' || activeTab === 'watched' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 ">
              {filteredWatched.map((movie, index) => (
                <div key={index} className="flex flex-row gap-2">
                  <Image
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    width={100}
                    height={150}
                    className="w-[100px] h-auto rounded"                  
                  />
                  <div className='flex flex-col gap-1'>
                    <div className="text-lg font-bold text-white hover:text-zinc-300 transition">
                      {movie.movie_title}
                    </div>
                    <div className="text-sm text-gray-500">{movie.movie_overview}</div>
                    <div className='flex flex-row gap-2 mt-1'>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/movie-more-info/${movie.movie_id}`;
                        }}
                      >
                          More info
                      </button>
                      <button 
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={async (e) => {
                          e.preventDefault();
                          const { error } = await supabase
                            .from('track_movies')
                            .delete()
                            .eq('movie_id', movie.movie_id);
                          if (error) {
                            console.error('Error removing movie:', error);
                          } else {
                            refetchMovieDetails();
                          }
                        }}
                      >
                          Remove
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {activeTab === 'all' || activeTab === 'watching' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {filteredWatching.map((movie, index) => (
                <div key={index} className="flex flex-row gap-2">
                  <Image
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    width={100}
                    height={150}
                    className="w-[100px] h-auto rounded"                  
                  />
                  <div className='flex flex-col gap-1'>
                    <div className="text-lg font-bold text-white hover:text-zinc-300 transition">
                      {movie.movie_title}
                    </div>
                    <div className="text-sm text-gray-500">{movie.movie_overview}</div>
                    <div className='flex flex-row gap-2 mt-1'>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/movie-more-info/${movie.movie_id}`;
                        }}
                      >
                          More info
                      </button>
                      <button 
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={async (e) => {
                          e.preventDefault();
                          const { error } = await supabase
                            .from('track_movies')
                            .delete()
                            .eq('movie_id', movie.movie_id);
                          if (error) {
                            console.error('Error removing movie:', error);
                          } else {
                            refetchMovieDetails();
                          }
                        }}
                      >
                          Remove
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'all' || activeTab === 'to-watch' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {filteredUnwatched.map((movie, index) => (
                <div key={index} className="flex flex-row gap-2">
                  <Image
                    src={movie.poster_url}
                    alt={movie.movie_title}
                    width={100}
                    height={150}
                    className="w-[100px] h-auto rounded"                  
                  />
                  <div className='flex flex-col gap-1'>
                    <div className="text-lg font-bold text-white hover:text-zinc-300 transition">
                      {movie.movie_title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {movie.movie_overview}
                    </div>
                    <div className='flex flex-row gap-2 mt-1'>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/movie-more-info/${movie.movie_id}`;
                        }}
                      >
                          More info
                      </button>
                      <button 
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={async (e) => {
                          e.preventDefault();
                          const { error } = await supabase
                            .from('track_movies')
                            .delete()
                            .eq('movie_id', movie.movie_id);
                          if (error) {
                            console.error('Error removing movie:', error);
                          } else {
                            refetchMovieDetails();
                          }
                        }}
                      >
                          Remove
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        ) : null}
          

      </div>
    </div>
  );
}