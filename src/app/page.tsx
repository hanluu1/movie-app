'use client';

import React from "react";

import { Header } from "@/components/header";
import { SearchMovie } from "@/components/searchMovie";
import { AllPost } from "@/components/AllPost";
export default function Home () {
  return (
    <div className="flex flex-col w-full duration-300 sm:max-w-full">
      <Header />
      <SearchMovie />
      <AllPost />
    </div>
  );
}
