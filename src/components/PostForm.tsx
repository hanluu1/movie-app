'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

export const PostForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const movieTitle = searchParams.get('title');
  const movieImage = searchParams.get('image');
  const movieOverview = searchParams.get('overview');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('Post').insert({
      title,
      content,
      image_url: imageUrl,
      movie_title: movieTitle,
      movie_image: movieImage,
    });

    if (error) {
      console.error('Error creating post:', error.message);
      alert('Failed to create post.');
    } else {
      router.push('/');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col gap-4 w-[70%] mx-auto">
      {/* Movie Info Section */}
      {movieTitle && (
        <div className="flex flex-row border p-4 rounded-lg shadow mb-6 gap-6">
          <Image
            src={movieImage || ''}
            alt={movieTitle || ''}
            width={100}
            height={150}
            className="rounded-lg"
          />
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold mb-2">{movieTitle}</h2>
            {movieOverview && (
              <p className="text-gray-700">{movieOverview}</p>
            )}
          </div>
        </div>
      )}

      {/* Create Post Form */}
      <input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded p-2"
      />

      <textarea
        placeholder="Write your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border rounded p-2 h-32 resize-none"
      />

      <input
        type="text"
        placeholder="Add your favorite scenes"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border rounded p-2"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`bg-zinc-400 text-black rounded p-2 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </div>
  );
};
