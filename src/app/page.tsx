'use client';

import React, { useState } from "react";

import { Header } from "@/components/header";
import { SearchMovie } from "@/components/searchMovie";
import { AllPost } from "@/components/AllPost";
export default function Home () {
  const[showSearch, setShowSearch] = useState(false);
  return (
    <div className="flex flex-col w-full duration-300 sm:max-w-full">
      <Header showSearchIcon={true} showSearch={() => setShowSearch(prev => !prev)} />
      {showSearch && (
        <SearchMovie />
      )}
      <AllPost />
    </div>
  );
}
