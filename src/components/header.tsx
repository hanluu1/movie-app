'use client';

import React from 'react';
import Link from 'next/link';
export function Header() {
    return (
        <div className='flex items-center justify-start gap-2 py-5 text-black bg-gray-200'>
            <Link href="/">
                <h1 className='text-3xl font-bold mx-10 cursor-pointer'>Reel Emotions</h1>
        
            </Link>
        </div>
    );
    }