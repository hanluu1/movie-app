'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

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
    <div className="flex flex-col gap-4 w-[70%] mx-auto mt-8">
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
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border rounded p-2"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className={`bg-blue-500 text-white rounded p-2 ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </div>
  );
};
