'use client';
import { PostForm } from '@/components/PostForm';
import { Header } from '@/components/header';
export default function CreatePage () {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <Header showSearchIcon={false}/>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl mx-auto my-10 p-6">
        <h1 className="flex flex-col items-center text-3xl font-bold mb-6">New post</h1>
        <PostForm />
      </div>
    </div>
  );
}
