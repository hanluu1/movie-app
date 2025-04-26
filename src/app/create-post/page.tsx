'use client';
import { PostForm } from '@/components/PostForm';
import { Header } from '@/components/header';
export default function CreatePage() {
  return (
    <div className="">
        <Header/>
        <div className="flex flex-col items-center w-full h-screen bg-gray-100">
            <h1 className="text-3xl my-20 font-bold mb-6">Post Your Thought</h1>
            <PostForm />
        </div>
    </div>
  );
}
