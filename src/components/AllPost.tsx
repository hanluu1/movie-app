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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('Post')
      .select('id, title, created_at, upvotes')
      .order('created_at', { ascending: false });

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
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border rounded p-2 w-full sm:w-64"
        />
      </div>

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
  );
};
