'use client';

import React, { useState } from "react";

import { Header } from "@/components/Header";
import { SearchMovie } from "@/components/searchMovie";
import { AllPost } from "@/components/AllPost";
export default function Home () {
  const[showSearch, setShowSearch] = useState(false);
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />
  
      <div className="flex flex-col items-center px-4 py-6">
        {showSearch && (
          <div className="w-full mb-6">
            <SearchMovie />
          </div>
        )}
        <div className="w-full max-w-4xl">
          <AllPost />
        </div>
      </div>
    </div>
  );
  
}
