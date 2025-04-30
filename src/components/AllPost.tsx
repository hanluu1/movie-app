'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PostCard } from '@/components/PostCard';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
interface Post {
  movie_image: string | null;
  movie_title: string | null;
  id: number;
  title: string;
  created_at: string;
  upvotes: number;
}

export const AllPost = () => {  
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<'created_at' | 'upvotes'>('created_at');
    
  useEffect(() => {
    fetchPosts();
  }, [sort]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('Post')
      .select('id, title, movie_title, movie_image, created_at, upvotes')
      .order(sort, { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col py-4 mx-10">
      <div className="flex flex-row justify-center gap-2 mb-4">
        <button className="bg-[#f6f6f6] text-black px-2 py-2 rounded hover:bg-gray-500 transition duration-300">
          <Link href="/create-post">
            Create Post
          </Link>
        </button>
        <button
          onClick={() => setSort('upvotes')}
          className={`px-4 py-2 rounded bg-[#f6f6f6] ${sort === 'upvotes' ? 'hover:bg-gray-500 text-black' : 'bg-[#f6f6f6]'}`}
        >
          Most favorite
        </button>
      </div>
      
      <div className="flex flex-col gap-4 justify-center items-center">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              movieTitle={post.movie_title}
              movieImage={post.movie_image}
              postTitle={post.title}
              createdAt={post.created_at}
              upvotes={post.upvotes}
            />
          ))
        ) : (
          <p>No posts yet. Be the first to create one!</p>
        )}
      </div>
    </div>
  );
};
