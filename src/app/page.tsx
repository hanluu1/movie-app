'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components";
import { SearchMovie } from "@/modules/home";
import { AllPost } from "@/modules/user-post";
import { CreatePostModal } from "@/modules/user-post";
import {PlusIcon, GlobeAltIcon, FilmIcon } from "@heroicons/react/24/outline";


export default function Home () {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const[showSearch, setShowSearch] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
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
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />
      {showSearch && (
        <div className="w-full ">
          <SearchMovie 
            mode="navigate"
            onSelect={
              (movie) => {
                setShowSearch(false);
                window.location.href = `/movie-more-info/${movie.id}`;
              }
            }/>
        </div>
      )}
      <div className="flex flex-col items-center px-4 py-4">
        <div className="flex flex-row justify-between items-center bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl px-6 py-4">
          <Link href='my-movies'><FilmIcon  className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" /></Link>
          <GlobeAltIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
          <PlusIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" onClick={()=> setShowCreatePostModal(true)}/>

        </div>
        
        <div className="w-full max-w-4xl">
          <AllPost />
        </div>
      </div>
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />
    </div>
  );
  
}
