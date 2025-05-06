'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export const PostForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const movieTitle = searchParams.get('title');
  const movieImage = searchParams.get('image');
  const movieOverview = searchParams.get('overview');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const newUrls: string[] = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
  
      // Validate image type
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not a valid image.`);
        continue;
      }
  
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
  
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          contentType: file.type || 'image/jpeg', 
        });
  
      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Failed to upload file: ${file.name}`);
        continue;
      }
  
      const { data: publicUrlData } = supabase
        .storage
        .from('post-images')
        .getPublicUrl(filePath);
  
      if (publicUrlData?.publicUrl) {
        console.log(`✅ Public URL for "${file.name}":`, publicUrlData.publicUrl);
        newUrls.push(publicUrlData.publicUrl);
      } else {
        alert(`Failed to get public URL for file: ${file.name}`);
      }
    }
  
    setImageUrl((prev) => [...prev, ...newUrls]);
  }
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('Post').insert({
      title,
      content,
      image_url: imageUrl.join(','),
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
        type="file"
        accept='image/*'
        multiple
        onChange={handleImageUpload}
      />
      {imageUrl.length > 0 && (
        <div className="mt-4 flex gap-4 flex-wrap">
          {imageUrl.map((url, idx) => (
            url ? (
              <Image
                key={idx}
                src={url.trim()}
                alt={`Uploaded ${idx}`}
                className="max-w-[120px] rounded border"
                width={120}
                height={120}
              />
            ) : (
              <div key={idx} className="text-gray-500">Invalid Image</div>
            )
          ))}
        </div>
      )}


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
