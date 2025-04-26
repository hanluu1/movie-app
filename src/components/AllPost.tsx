'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PostCard } from '@/components/PostCard';

interface Post {
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
      .select('id, title, created_at, upvotes')
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
    <div className="flex flex-col mx-10">
      <div className="flex flex-row gap-2 justify-start mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2 w-full sm:w-64"
        />
            
            
        <button
          onClick={() => setSort('created_at')}
          className={`px-4 py-2 rounded ${sort === 'created_at' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
            Sort by Newest
        </button>

        <button
          onClick={() => setSort('upvotes')}
          className={`px-4 py-2 rounded ${sort === 'upvotes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
            Sort by Upvotes
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
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
