'use client';

import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';

const MOODS = [
  'Moved me to tears',
  'Mind-bending',
  'Still thinking about it',
  'Comforting',
  'Unsettling',
  'Pure joy',
  "Couldn't look away",
  'Broke my heart',
  'Changed how I see things',
];

const FEATURED = {
  initials: 'EM',
  username: 'Emma',
  role: 'Watches everything',
  movie: 'Arrival',
  year: '2016',
  quote: "I watched it alone at midnight and couldn't move for twenty minutes after it ended. Something about time and love and loss just... landed differently than I expected.",
  relatedCount: 47,
};

const REACTIONS = [
  {
    initials: 'MA',
    username: 'Marcus',
    role: 'Action enthusiast',
    movie: 'The Batman',
    year: '2022',
    poster: '/batman.png',
    quote: 'The atmosphere, the music, the tension — everything pulled me in. It made me feel like the city itself was alive and grieving.',
    relatedCount: 56,
  },
  {
    initials: 'AN',
    username: 'Anna',
    role: 'Book lover',
    movie: 'Little Women',
    year: '2019',
    poster: '/littlewomen.png',
    quote: 'It reminded me of my own growing up — chasing dreams and still figuring out who I want to be. Such a warm, honest story.',
    relatedCount: 73,
  },
  {
    initials: 'YM',
    username: 'David',
    role: 'Sci-fi fan',
    movie: 'Interstellar',
    year: '2014',
    poster: '/interstella.png',
    quote: 'Time, love, what it means to be human. I had to sit with it for a while. Still am.',
    relatedCount: 48,
  },
];

export default function LandingPage () {
  return (
    <div className="min-h-screen bg-[#0A0908] text-[#F2EDE4] font-sans overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <span className="font-plus-jakarta font-extrabold text-xl tracking-tight text-[#F2EDE4]">
          ReelEmotion
        </span>
        <Link href="/login">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#F2EDE4] text-[#0A0908] hover:bg-[#E0D8C8] transition-colors">
            Sign up
          </button>
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8956A] mb-10">
          Not reviews. Reactions.
        </p>
        <blockquote className="font-plus-jakarta font-extrabold text-[clamp(2rem,5vw,3.5rem)] leading-[1.2] tracking-tight text-[#F2EDE4] mb-8">
          &ldquo;I watched it alone at midnight and couldn&apos;t move for twenty minutes after it ended.&rdquo;
        </blockquote>
        <div className="flex items-center gap-3 mb-12">
          <span className="text-sm text-[#6A5E50]">— Arrival</span>
          <span className="text-[#2A2520]">·</span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#C8956A]">
            <HeartIcon className="w-4 h-4" />
            <span>47 people felt this</span>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/discover">
            <button className="px-7 py-3.5 rounded-xl font-bold text-sm bg-[#F2EDE4] text-[#0A0908] hover:bg-[#E0D8C8] transition-all">
              Browse reactions →
            </button>
          </Link>
          <button
            onClick={() => document.getElementById('reactions')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-[#272320] text-[#6A5E50] hover:text-[#F2EDE4] hover:border-[#3A3530] transition-all"
          >
            See what people are feeling
          </button>
        </div>
      </section>

      {/* Mood ticker */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 28s linear infinite; }
        .marquee-wrap:hover .marquee-track { animation-play-state: paused; }
      `}</style>
      <div className="border-t border-b border-[#161310] py-5 overflow-hidden marquee-wrap">
        <div className="marquee-track flex gap-2.5 w-max">
          {[...MOODS, ...MOODS].map((mood, i) => (
            <span
              key={i}
              className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border border-[#272320] text-[#6A5E50]"
            >
              {mood}
            </span>
          ))}
        </div>
      </div>

      {/* Reactions */}
      <section id="reactions" className="px-8 py-16 max-w-6xl mx-auto">

        {/* Featured reaction */}
        <div className="rounded-2xl border border-[#1E1B18] bg-[#111009] p-8 sm:p-10 mb-6">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#0A0908] text-xs font-bold flex-shrink-0 bg-[#C8956A]">
              {FEATURED.initials}
            </div>
            <div>
              <div className="text-sm font-bold text-[#F2EDE4]">{FEATURED.username}</div>
              <div className="text-xs text-[#4A4038]">{FEATURED.role}</div>
            </div>
            <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full border border-[#272320] text-[#6A5E50]">
              {FEATURED.movie} · {FEATURED.year}
            </span>
          </div>
          <blockquote className="font-plus-jakarta font-bold text-[clamp(1.2rem,2.5vw,1.8rem)] leading-[1.5] text-[#F2EDE4] mb-8 max-w-2xl">
            &ldquo;{FEATURED.quote}&rdquo;
          </blockquote>
          <div className="flex items-center gap-2 text-[#C8956A] font-bold text-base">
            <HeartIcon className="w-5 h-5" />
            <span>{FEATURED.relatedCount} people felt the same</span>
          </div>
        </div>

        {/* Reaction cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {REACTIONS.map(({ initials, username, role, movie, year, poster, quote, relatedCount }) => (
            <div
              key={username}
              className="rounded-2xl border border-[#1E1B18] bg-[#111009] overflow-hidden hover:border-[#2A2520] transition-all group flex flex-col"
            >
              <div className="relative h-36 overflow-hidden flex-shrink-0">
                <img
                  src={poster}
                  alt={movie}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111009] via-[#111009]/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <span className="text-sm font-bold text-[#F2EDE4]">{movie}</span>
                  <span className="text-xs text-[#6A5E50]">{year}</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#0A0908] text-[10px] font-bold flex-shrink-0 bg-[#C8956A]">
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F2EDE4]">{username}</div>
                    <div className="text-[10px] text-[#4A4038]">{role}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed italic text-[#8C7E6E] font-dm-sans flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C8956A] mt-5 pt-4 border-t border-[#1E1B18]">
                  <HeartIcon className="w-3.5 h-3.5" />
                  <span>{relatedCount} felt the same</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/discover">
            <button className="px-6 py-3 rounded-xl text-sm font-semibold border border-[#272320] text-[#6A5E50] hover:text-[#F2EDE4] hover:border-[#3A3530] transition-all">
              See all reactions →
            </button>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-8 pb-20">
        <div className="max-w-6xl mx-auto rounded-2xl border border-[#1E1B18] bg-[#111009] px-8 py-16 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C8956A] mb-4">
            What do you want to feel tonight?
          </p>
          <h2 className="font-plus-jakarta font-extrabold text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#F2EDE4] mb-4 max-w-xl mx-auto">
            Your feelings are someone else&apos;s discovery.
          </h2>
          <p className="text-sm text-[#4A4038] mb-10 max-w-sm mx-auto leading-relaxed">
            Write about a movie that moved you. Help someone else find it.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/login">
              <button className="px-7 py-3.5 rounded-xl font-bold text-sm bg-[#F2EDE4] text-[#0A0908] hover:bg-[#E0D8C8] transition-all">
                Start writing →
              </button>
            </Link>
            <Link href="/discover">
              <button className="px-7 py-3.5 rounded-xl font-semibold text-sm border border-[#272320] text-[#6A5E50] hover:text-[#F2EDE4] hover:border-[#3A3530] transition-all">
                Browse first
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
