'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useRouter} from 'next/navigation';
import { SearchMovie } from '@/modules/home';
import { MagnifyingGlassCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const PostForm = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{
    title: string;
    image: string;
    overview: string;
  } | null>(null);

  // const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = e.target.files;
  //   if (!files || files.length === 0) return;
  
  //   const newUrls: string[] = [];
  
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  
  //     // Validate image type
  //     if (!file.type.startsWith('image/')) {
  //       alert(`File "${file.name}" is not a valid image.`);
  //       continue;
  //     }
  
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${uuidv4()}.${fileExt}`;
  //     const filePath = `${fileName}`;
  
  //     const { error: uploadError } = await supabase.storage
  //       .from('post-images')
  //       .upload(filePath, file, {
  //         contentType: file.type || 'image/jpeg', 
  //       });
  
  //     if (uploadError) {
  //       console.error('Upload error:', uploadError);
  //       alert(`Failed to upload file: ${file.name}`);
  //       continue;
  //     }
  
  //     const { data: publicUrlData } = supabase
  //       .storage
  //       .from('post-images')
  //       .getPublicUrl(filePath);
  
  //     if (publicUrlData?.publicUrl) {
  //       console.log(` Public URL for "${file.name}":`, publicUrlData.publicUrl);
  //       newUrls.push(publicUrlData.publicUrl);
  //     } else {
  //       alert(`Failed to get public URL for file: ${file.name}`);
  //     }
  //   }
  
  //   setImageUrl((prev) => [...prev, ...newUrls]);
  // }
  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Title is required.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('Post').insert({
      title,
      content,
      movie_title: selectedMovie?.title || null,
      movie_image: selectedMovie?.image || null,
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
    <div className="flex flex-col gap-4 mx-auto text-black">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowMovieSearch(false)}
              className="absolute top-2 right-2 z-10 gap-2 cursor-pointer"
            >Close</button>
            <div className="pt-4">
              <SearchMovie
                mode='select'
                onSelect={(movie) => {
                  setSelectedMovie(movie);
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

      {/* <input
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
      )} */}
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
