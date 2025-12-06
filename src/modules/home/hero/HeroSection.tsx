'use client';
import { ChatBubbleLeftRightIcon, BookmarkIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="max-w-2xl w-full mx-auto px-4 flex flex-col justify-center min-h-screen">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    Welcome to{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                      ReelEmotions
            </span>
          </h2>

          <p className="mt-2 text-slate-300">
                      Log in to unlock community features, connect with other movie & show lovers,
                      see posts, create your own, and track everything you’ve watched (or want to).
          </p>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">Discuss & share</span>
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <BookmarkIcon className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">Track your list</span>
            </li>
            <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <GlobeAltIcon className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300">Discover together</span>
            </li>
          </ul>

          <div className="mt-6 flex justify-end sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl
                       bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2
                       text-sm font-semibold text-white shadow transition hover:opacity-90"
            >
                      Log in / Create account
            </Link>
          </div> 
        </div>
      </div>
    </section>
  );
}