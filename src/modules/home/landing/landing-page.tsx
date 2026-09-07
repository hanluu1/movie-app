'use client';

import Link from 'next/link';
import { HeartIcon, ChatBubbleLeftEllipsisIcon, UserGroupIcon, PencilSquareIcon, FilmIcon } from '@heroicons/react/24/outline';
import { Header } from '@/components/layout/header';

const steps = [
  {
    Icon: ChatBubbleLeftEllipsisIcon,
    title: 'Share a feeling',
    desc: 'Something you watched stayed with you. Put it into words.',
  },
  {
    Icon: UserGroupIcon,
    title: 'Explore perspectives',
    desc: 'See how other people experienced the same story differently.',
  },
  {
    Icon: FilmIcon,
    title: 'Discover what’s next',
    desc: 'Find movies through real emotions, reactions, and perspectives.',
  },
];

const communityReactions = [
  {
    initials: 'MA',
    username: 'Marcus',
    role: 'Action enthusiast',
    movie: 'The Batman',
    genre: 'Thriller',
    poster: '/batman.png',
    quote: 'This movie made me feel like the city itself was alive. The atmosphere, the music, the tension — everything just pulled me in.',
    relatedCount: 56,
  },
  {
    initials: 'AN',
    username: 'Anna',
    role: 'Book lover',
    movie: 'Little Women',
    genre: 'Drama',
    poster: '/littlewomen.png',
    quote: 'It reminded me of my own growing up — chasing my dreams, and still figuring out who I want to be. Such a warm and honest story.',
    relatedCount: 73,
  },
  {
    initials: 'YM',
    username: 'David',
    role: 'Sci-fi fan',
    movie: 'Interstellar',
    genre: 'Sci-Fi',
    poster: '/interstella.png',
    quote: 'I watched it and it completely blew my mind — time, love, what it means to be human. I had to sit with it for a while.',
    relatedCount: 48,
  },
];

export default function LandingPage () {
  return (
    <div className="font-sans min-h-screen overflow-x-hidden bg-[#FAF7F1] text-[#172526]">

      <Header showSearch={false} />

      {/* Hero */}
      <section className="px-8 py-10 sm:py-14 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <p className="font-serif italic text-base mb-4 text-[#6F8C88]">
              Movies. Real People. Real Feelings.
            </p>
            <h1 className="font-serif text-[clamp(2.4rem,4.8vw,4rem)] leading-[1.15] font-bold tracking-tight mb-6 text-[#172526]">
              <span className="font-bold text-[#172526]">Share</span><span className="font-normal italic text-[#6F8C88]"> what you</span><br /><span className="font-normal italic text-[#6F8C88]">felt. </span>
              <span className="font-bold text-[#2A4649]">Find</span><span className="font-normal italic text-[#6F8C88]"> what to watch next.</span>
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-md font-normal text-[#3F5E5A]">
              Share how a movie or show made you feel. Read real reactions from people like you, and discover what to watch next.
            </p>
            <div className="flex gap-3 flex-wrap items-center">
              <Link href="/discover">
                <button className="text-white px-7 py-3.5 rounded-xl font-bold text-sm bg-[#2A4649] shadow-[0_4px_16px_rgba(42,70,73,0.25)] transition-all hover:-translate-y-0.5">
                  Explore ReelEmotions 
                </button>
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-7 py-3.5 rounded-xl font-semibold text-sm border-2 border-[#2A4649] text-[#2A4649] bg-transparent transition-all hover:opacity-80"
              >
                How it works
              </button>
            </div>
          </div>

          {/* Right — Featured Card */}
          <div className="relative w-full min-h-[480px] flex items-center justify-center">

            {/* Decorative bubbles */}
            <div className="absolute top-4 left-0 w-24 h-24 rounded-full pointer-events-none bg-[#D8E8E2] opacity-70" />
            <div className="absolute bottom-0 right-7 w-20 h-20 rounded-tl-[120px] rounded-tr-[160px] rounded-br-[100px] rounded-bl-[180px] pointer-events-none bg-[#C8DDD8] opacity-60" />

            {/* Main Organic Arch Container */}
            <div className="relative w-[88%] h-[420px] shadow-2xl overflow-hidden rounded-tl-[160px] rounded-tr-[120px] rounded-br-[180px] rounded-bl-[100px]">
              <img
                src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=1000"
                alt="Cinematic mood still"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Floating Review Card Overlay */}
            <div className="absolute -bottom-2 left-2 max-w-[320px] p-5 rounded-2xl shadow-2xl border border-[#E8EEEA] backdrop-blur-sm z-20 bg-[#FFFDF8]/95">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#2A4649]">
                    EM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172526]">Emma</div>
                    <div className="text-[10px] text-[#6F8C88]">Movie lover</div>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[#E8EEEA] bg-[#F9F6EF] text-[#2A4649]">
                  Dune: Part Two
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3 font-serif italic text-[#172526]">
                &ldquo;I felt so small... and so hopeful. It&apos;s rare for a movie to make me feel both at the same time.&rdquo;
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A4649]">
                <HeartIcon className="w-3.5 h-3.5 fill-current" />
                <span>38 people felt the same</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="px-8 py-20 border-t border-b border-[#E8EEEA] bg-[#EEF2ED]"
      >
        <div className="max-w-6xl mx-auto">

          {/* Section intro */}
          <div className="max-w-xl mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#2A4649]">
        The ReelEmotion way
            </p>

            <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-[#172526]">
        Your feelings are the starting point.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-[#3F5E5A]">
        Share what stayed with you, see how others felt, and discover
        something that might stay with you next.
            </p>
          </div>

          {/* Three things */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="p-7 rounded-3xl bg-[#FAF7F1] border border-[#E8EEEA]"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#E8EEEA] mb-6">
                  <Icon className="w-5 h-5 text-[#2A4649]" />
                </div>

                <h3 className="font-bold text-lg mb-3 text-[#172526]">
                  {title}
                </h3>

                <p className="leading-relaxed text-sm text-[#3F5E5A]">
                  {desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Real Reactions */}
      <section className="px-8 py-20 bg-[#FAF7F1]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-[#2A4649]">Real Reactions</p>
              <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] font-bold tracking-tight text-[#172526]">
                What people are feeling
              </h2>
            </div>
            <Link href="/discover" className="hidden sm:block text-sm font-semibold text-[#2A4649] transition-opacity hover:opacity-70">
              View more →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {communityReactions.map(({ initials, username, role, movie, genre, poster, quote, relatedCount }) => (
              <div
                key={username}
                className="rounded-2xl border border-[#E8EEEA] flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg bg-[#FFFDF8]"
              >
                <div>
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={poster}
                      alt={movie}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-wider text-white bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                      {genre}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 bg-[#2A4649]">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm leading-tight text-[#172526]">{username}</div>
                        <div className="text-[11px] text-[#6F8C88]">{role}</div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed mb-4 font-serif italic text-[#172526]">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100/60 mt-auto">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#6F8C88]">
                    <HeartIcon className="w-3.5 h-3.5 fill-current text-rose-500/80" />
                    <span>{relatedCount} people related to this</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#2A4649]">
                    {movie}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="px-8 pb-16 bg-[#F9F6EF]">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden relative bg-[#2A4649] min-h-[160px]">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 px-10 py-10">
            <div className="flex-1">
              <h2 className="font-serif text-[clamp(1.4rem,2.5vw,1.9rem)] font-bold leading-snug text-white mb-1">
                Join a community<br />that feels like your movie club.
              </h2>
              <p className="text-sm mt-2 text-[#6F8C88]">
                Share. Read. Discover. All about what movies make people feel.
              </p>
            </div>
            <Link href="/login" className="flex-shrink-0">
              <button className="px-7 py-3 rounded-full font-semibold text-sm border-2 border-[#E8EEEA] text-[#E8EEEA] transition-all hover:bg-white/10 whitespace-nowrap">
                Sign Up →
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
