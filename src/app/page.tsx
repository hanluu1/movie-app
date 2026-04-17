'use client';

import React, { useState, useEffect, useRef } from "react";
import type { User } from '@supabase/auth-js';
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/layout";
import { SearchMovie } from "@/modules/home";
import { AllPost, CreatePostModal } from "@/modules/user-post";
import { ActionBar } from "@/modules/navigation/action-bar";
import LandingPage from "@/modules/home/landing/LandingPage";

export default function Home () {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const postRef = useRef<{ refetch: () => void } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);


  if (loading) {
    return <div className="min-h-screen bg-stone-50" />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <div className="flex flex-col items-center">
        <div className="flex flex-col justify-between w-full">
          <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />
          {showSearch && (
            <div className="w-full">
              <SearchMovie
                mode="navigate"
                onSelect={(movie) => {
                  setShowSearch(false);
                  window.location.href = `/movie-more-info/${movie.movie_id}`;
                }}
              />
            </div>
          )}
        </div>

        <div className="flex min-h-screen w-full flex-col items-center justify-center">
          <div className="flex flex-col w-full max-w-2xl px-4 py-4">
            <ActionBar onCreatePost={() => setShowCreatePostModal(true)} />
            <AllPost ref={postRef} />
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onCreated={() => {
          setShowCreatePostModal(false);
          postRef.current?.refetch();
        }}
      />
    </div>
  );
}
