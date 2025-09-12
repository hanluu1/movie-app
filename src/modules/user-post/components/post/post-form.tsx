'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { SearchMovie } from '@/modules/home';
import { MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';

export const PostForm = ({onCreated}:{onCreated?: () => void}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{
    title: string;
    image: string;
    overview: string;
  } | null>(null);
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to create a post.');
      setIsSubmitting(false);
      return;
    }
    const { error } = await supabase.from('posts').insert({
      title,
      content,
      movie_title: selectedMovie?.title || null,
      movie_image: selectedMovie?.image || null,
      user_id: user.id,
    });

    if (error) {
      console.error('Error creating post:', error.message);
      alert('Failed to create post.');
    } else {
      if (onCreated) {
        onCreated();
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-4 mx-auto text-white">
      {/* Movie Info Section */}
      {selectedMovie && (
        <div className="flex flex-row border p-4 rounded-lg shadow mb-6 gap-6">
          <Image
            src={selectedMovie.image}
            alt={selectedMovie.title}
            width={100}
            height={150}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <h2 className="text-2xl text-white font-bold mb-2">{selectedMovie.title}</h2>
            {selectedMovie.overview && (
              <p className="text-gray-300">{selectedMovie.overview}</p>
            )}
          </div>
        </div>
      )}

      {/* Create Post Form */}
      <div
        className="flex items-center gap-2 cursor-pointer w-fit text-white hover:text-gray-500"
        onClick={() => setShowMovieSearch(!showMovieSearch)}
      >
        <MagnifyingGlassCircleIcon className="w-6 h-6" />
        <div>{selectedMovie ? 'Edit picked movie' : 'Select a show/movie'}</div>
      </div>
      {showMovieSearch && (
        <div className="min-h-40 fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-4 rounded shadow-lg w-[600px] max-w-[90vw] h-[450px] overflow-y-auto relative">
            <button
              onClick={() => setShowMovieSearch(false)}
              className="absolute top-2 right-2 z-10 cursor-pointer text-white hover:text-gray-500"
            >Close</button>
            <div className="flex justify-center">
              <SearchMovie
                mode='select'
                onSelect={(movie) => {
                  setSelectedMovie({
                    title: movie.title,
                    image: movie.image,
                    overview: movie.overview,
                  });
                  setShowMovieSearch(false);
                  setTitle('');
                  setContent('');
                }}
              />
            </div>
          </div>
        </div>
      )}
      <input
        type="text"
        placeholder="Title your post"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded p-2 bg-gray-800"
      />

      <textarea
        placeholder="Tell us about your experience with this movie/show"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className=" rounded p-2 resize-none h-40 bg-gray-800"
      />
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`bg-gray-700 hover:bg-gray-600 text-white rounded p-2 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </div>
  );
};
