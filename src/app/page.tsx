'use client';

import React from "react";
import Link from "next/link";

import { Header } from "@/components/header";
import { SearchBar } from "@/components/search-bar";
import { AllPost } from "@/components/AllPost";
export default function Home() {
  return (
    <div className="flex flex-col w-full duration-300 sm:max-w-full">
      <Header />
      <SearchBar />
      <div className="flex items-center justify-center">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
          <Link href="/create-post">
            Create New Post
          </Link>
        </button>
      </div>
      <AllPost />
    </div>
  );
}
