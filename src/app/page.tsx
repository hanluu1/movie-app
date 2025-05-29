'use client';

import React, { useState } from "react";

import { Header } from "@/components/Header";
import { SearchMovie } from "@/components/searchMovie";
import { AllPost } from "@/components/AllPost";
import { HomeIcon, PlusIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
export default function Home () {
  const[showSearch, setShowSearch] = useState(false);
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />
      {showSearch && (
        <div className="w-full">
          <SearchMovie />
        </div>
      )}
      <div className="flex flex-col items-center px-4 py-4">
        <div className="flex flex-row justify-between items-center bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl p-4">
         
          <HomeIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
          
          <GlobeAltIcon href='/' className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
          <Link href="/create-post">
            <PlusIcon className="h-6 w-6 cursor-pointer text-gray-300 hover:text-blue-400 transition" />
          </Link>
        </div>
        
        <div className="w-full max-w-4xl">
          <AllPost />
        </div>
      </div>
    </div>
  );
  
}
