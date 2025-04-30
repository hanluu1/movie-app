'use client';

import React from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function Header ({showSearchIcon = true, showSearch}:{showSearchIcon?: boolean; showSearch?: ()=> void}) {
  
  return (
    <div className='flex flex-row justify-between items-center px-4 py-5 text-black bg-[#cfcfcf]'>
      
      <Link href='/' className='text-3xl font-bold cursor-pointer'>Reel Emotions</Link>
      <div className='flex flex-row gap-2'>
        {showSearchIcon && (
          <MagnifyingGlassIcon 
            className="flex h-6 w-6 cursor-pointer text-gray-500"
            onClick={showSearch}/>
        )}
        <p>Sign out</p>
      </div>
      
    </div>
  );
}