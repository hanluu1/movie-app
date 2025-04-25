import React from 'react';
import { SearchBar } from './search-bar';

export const Post = () => {
  return (
    <div className="flex justify-center">
        <div>
            <h2 className="">Welcome to Reel Emotions</h2>
            <p>Search a movie and post your thought</p>
            <SearchBar />
        </div>
    </div>
  );
}