'use client';
import { PostForm } from '@/components/PostForm';
import { Header } from '@/components/header';
export default function CreatePage () {
  return (
    <div className="">
      <Header showSearchIcon={false}/>
      <div className="flex flex-col items-center w-full h-screen bg-[#dddddd]">
        <h1 className="text-3xl my-5 font-bold mb-6">Give a thought on your recently watched</h1>
        <PostForm />
      </div>
    </div>
  );
}
