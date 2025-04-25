"use client";
import React from 'react';


export const SearchBar = () => {
  return (
    <div className="flex justify-center">
      <input
        type="text"
        placeholder="Search for a movie..."
        className="border border-gray-300 rounded-lg p-2 w-1/2"
      />
      <button className="bg-blue-500 text-white rounded-lg p-2 ml-2">
        Search
      </button>
    </div>
  );
}