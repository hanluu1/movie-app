'use client';

import React from "react";

import { Header } from "@/components/header";
import { Post } from "@/components/post";

export default function Home() {
  return (
    <div className="flex flex-col w-full duration-300 sm:max-w-full">
      <Header />
      <Post />
    </div>
  );
}
