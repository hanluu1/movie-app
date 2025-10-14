'use client';

import React, { useState, useEffect, useRef } from "react";
import type { User } from '@supabase/auth-js';
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/layout";
import { SearchMovie } from "@/modules/home";
import { AllPost, CreatePostModal } from "@/modules/user-post";
import {
  PlusIcon,
  GlobeAltIcon,
  FilmIcon,
  ChatBubbleLeftRightIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

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
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">

      <div className="flex flex-col items-center">
        {user && (
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
        )}

        <div className="flex min-h-screen items-center justify-center w-full ">
          {!user && (
            <div className="flex justify-center items-center overflow-hidden rounded-2xl p-6 md:p-8 mb-6">
             
              <div className="flex items-start gap-4">
                
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Welcome to{" "}
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                      ReelEmotions
                    </span>
                  </h2>

                  <p className="mt-2 text-slate-300">
                      Log in to unlock community features, connect with other movie & show lovers,
                      see posts, create your own, and track everything you’ve watched (or want to).
                  </p>

                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-300">Discuss & share</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                      <BookmarkIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-300">Track your list</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                      <GlobeAltIcon className="h-5 w-5 text-slate-400" />
                      <span className="text-slate-300">Discover together</span>
                    </li>
                  </ul>

                  <div className="mt-6 flex justify-end sm:flex-row gap-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center rounded-xl
                       bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2
                       text-sm font-semibold text-white shadow transition hover:opacity-90"
                    >
                      Log in / Create account
                    </Link>
                  </div> 
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col w-full max-w-4xl px-4 py-4">
            {user && (
              <div className="flex flex-row justify-between items-center bg-gray-900 border border-gray-700 rounded-2xl w-full px-6 py-4">
                

                <GlobeAltIcon
                  className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition"
                  aria-hidden="true"
                />

                <button
                  type="button"
                  aria-label="Create post"
                  onClick={() => setShowCreatePostModal(true)}
                  className="p-0 m-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  title="Create post"
                >
                  <PlusIcon className="h-6 w-6 text-gray-300 hover:text-blue-400 transition" />
                </button>
                <Link href="my-movies" aria-label="My Movies">
                  <BookmarkIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
                </Link>
              </div>
            )}


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
