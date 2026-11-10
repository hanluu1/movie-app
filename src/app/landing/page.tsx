'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/ui/logo';
import { ArrowUpRightIcon, ChatBubbleOvalLeftIcon, HeartIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { FEELING_LIST, FEELINGS, getFeeling, getMoodsForFeeling, type FeelingKey } from '@/lib/moods';
import { searchMoviesAndTv, searchTvShows, type Movie, type TrendingTV } from '@/lib/tmdb/client';

const MOOD_FEATURES = [
  {
    mood: 'Pure joy',
    label: 'Need a good laugh?',
    subtitle: 'A comfort watch for the plot and the giggles.',
    search: 'Paddington 2',
    mediaType: 'movie' as const,
  },
  {
    mood: 'Mind-bending',
    label: 'Mess with my head',
    subtitle: 'The kind of story that sends you down a rabbit hole.',
    search: 'Inception',
    mediaType: 'movie' as const,
  },
  {
    mood: 'Moved me to tears',
    label: 'I need to feel something',
    subtitle: 'Grab the tissues. You have been warned.',
    search: 'Reply 1988',
    mediaType: 'tv' as const,
  },
  {
    mood: "Couldn't look away",
    label: 'Keep me guessing',
    subtitle: 'Mysteries, twists, and theories at 2 AM.',
    search: 'The Glory',
    mediaType: 'tv' as const,
  },
];

const CTA_GRADIENT = 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)';

const SAMPLE_POSTS: { user: string; show: string; feeling: FeelingKey; text: string; likes: string; replies: number }[] = [
  { user: 'soojin.exe', show: 'Queen of Tears', feeling: 'sad', text: 'came for the rich people problems, stayed for the emotional damage. ep 12 ruined me', likes: '2.4k', replies: 186 },
  { user: 'no.context.nina', show: 'Inception', feeling: 'mindblown', text: 'rewatched it and STILL had to pause to google what happened. my brain is soup', likes: '1.9k', replies: 142 },
  { user: 'popcorn.goblin', show: 'The Bear', feeling: 'hype', text: 'yes chef. my blood pressure has left the chat', likes: '1.1k', replies: 63 },
];

function SamplePost ({ post, className = '' }: { post: typeof SAMPLE_POSTS[number]; className?: string }) {
  const f = FEELINGS[post.feeling];
  return (
    <div
      className={`relative rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md xl:p-5 ${className}`}
      style={{ boxShadow: `0 0 48px -12px ${f.color}66` }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold text-[#0D0A08]" style={{ backgroundColor: f.color }}>
          {post.user[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#EEEAE2]">@{post.user}</p>
          <p className="truncate text-xs text-[#B8AA98]">watching {post.show}</p>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-[#EEEAE2]"
          style={{ backgroundColor: `${f.color}33`, border: `1px solid ${f.color}66` }}
        >
          <span aria-hidden="true">{f.emoji}</span>{f.label}
        </span>
      </div>
      <p className="mt-3 text-left text-[15px] font-medium leading-6 text-[#EEEAE2] xl:text-base xl:leading-7 2xl:text-lg 2xl:leading-8">{post.text}</p>
      <div className="mt-3 flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#EEEAE2]">
          <HeartIcon className="h-4 w-4" style={{ color: FEELINGS.love.color }} />{post.likes}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#EEEAE2]">
          <ChatBubbleOvalLeftIcon className="h-4 w-4 text-[#B8AA98]" />{post.replies}
        </span>
      </div>
    </div>
  );
}

export default function LandingPage () {
  const [moodMedia, setMoodMedia] = useState<(Movie | TrendingTV | null)[]>([]);

  useEffect(() => {
    Promise.all(MOOD_FEATURES.map((item) => (
      item.mediaType === 'tv' ? searchTvShows(item.search) : searchMoviesAndTv(item.search)
    ))).then((results) => {
      setMoodMedia(results.map((items, index) => {
        const expected = MOOD_FEATURES[index];
        const exactMatch = items.find((item) => {
          const title = 'title' in item ? item.title : item.name;
          return title.trim().toLowerCase() === expected.search.toLowerCase();
        });

        return exactMatch ?? items[0] ?? null;
      }));
    });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0D0A08] font-sans text-[#EEEAE2]">
      <style>{`
        @keyframes reel-float {
          0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--r, 0deg)); }
        }
        @keyframes reel-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .reel-float { animation: reel-float 5s ease-in-out infinite; }
        .reel-marquee { animation: reel-marquee 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .reel-float, .reel-marquee { animation: none; }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-32 -top-20 h-[28rem] w-[28rem] rounded-full bg-[#FF4D9D]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-[30rem] w-[30rem] rounded-full bg-[#9B6BFF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/3 top-[60rem] h-96 w-96 rounded-full bg-[#F5A623]/15 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />

      {/* TOP BAR */}
      <header className="relative mx-auto flex w-full max-w-6xl xl:max-w-[1400px] 2xl:max-w-[1680px] items-center justify-between px-5 py-5 sm:px-8">
        <Logo className="text-xl sm:text-2xl 2xl:text-3xl" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="press rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-[#EEEAE2] backdrop-blur-md transition hover:bg-white/[0.08]">
            Sign in
          </Link>
          <Link href="/login" style={{ background: CTA_GRADIENT }} className="press rounded-full px-4 py-2 text-sm font-extrabold text-[#0D0A08] transition hover:brightness-110">
            Join free
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto grid max-w-6xl xl:max-w-[1400px] 2xl:max-w-[1680px] items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:min-h-[80vh] lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:pb-24 lg:pt-14 xl:pt-20 2xl:gap-24 2xl:pt-28">
        <div className="text-center lg:text-left">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold xl:mb-7 xl:text-sm text-[#EEEAE2] backdrop-blur-md">
            <span aria-hidden="true">🍿</span> the social app for movie &amp; show feelings
          </p>
          <h1 className="font-plus-jakarta text-[clamp(3rem,7.5vw,9.5rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
            Yap about what you watch. <span className="shimmer-text">Feel</span> it out loud.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#B8AA98] sm:text-lg lg:mx-0 xl:mt-8 xl:max-w-2xl xl:text-xl xl:leading-8 2xl:text-2xl 2xl:leading-9">
            Post your take on any show or movie and tag how it made you feel. Find your people, find your next watch.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start xl:mt-10">
            <Link href="/login" style={{ background: CTA_GRADIENT }} className="press inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-extrabold text-[#0D0A08] shadow-[0_8px_40px_rgba(245,166,35,0.3)] xl:px-10 xl:py-5 xl:text-lg transition hover:brightness-110">
              Start yapping <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/community" className="press inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-bold text-[#EEEAE2] backdrop-blur-md transition hover:bg-white/[0.08] xl:px-10 xl:py-5 xl:text-lg">
              Peek at the feed
            </Link>
          </div>

          {/* Feeling orbs */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start xl:mt-14 xl:gap-4" aria-label="Pick a feeling">
            {FEELING_LIST.map((f, i) => (
              <Link
                key={f.key}
                href={`/discover?mood=${encodeURIComponent(getMoodsForFeeling(f.key)[0])}`}
                aria-label={f.label}
                title={f.label}
                className="press reel-float flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-2xl backdrop-blur-md xl:h-16 xl:w-16 xl:text-3xl 2xl:h-20 2xl:w-20 2xl:text-4xl"
                style={{ backgroundColor: `${f.color}26`, boxShadow: `0 0 28px -4px ${f.color}88`, animationDelay: `${i * 0.4}s` }}
              >
                <span aria-hidden="true">{f.emoji}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Faux phone feed */}
        <div className="relative mx-auto w-full max-w-[340px] xl:max-w-[420px] 2xl:max-w-[500px]">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md xl:p-4 2xl:rounded-[3rem] 2xl:p-5">
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-white/15" />
            <div className="flex flex-col gap-3 xl:gap-4">
              {SAMPLE_POSTS.map((p) => <SamplePost key={p.user} post={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* BROWSE BY FEELING */}
      <section id="browse-by-mood" className="relative mx-auto max-w-6xl xl:max-w-[1400px] 2xl:max-w-[1680px] px-5 py-12 sm:px-8 lg:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#F5A623]">Browse by feeling</p>
          <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">
            What are we <span className="shimmer-text">feeling</span> tonight?
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {MOOD_FEATURES.map((item, index) => {
            const media = moodMedia[index];
            const mediaTitle = media ? ('title' in media ? media.title : media.name) : item.search;
            const posterPath = media?.poster_path;
            const mediaHref = media
              ? `/movie-more-info/${media.id}?type=${item.mediaType}`
              : `/discover?mood=${encodeURIComponent(item.mood)}`;
            const f = getFeeling(item.mood) ?? FEELINGS.joy;

            return (
              <Link
                href={mediaHref}
                key={item.mood}
                className="press group relative block aspect-[2/3] overflow-hidden rounded-3xl border border-white/10 transition duration-300 hover:-translate-y-1 motion-reduce:transition-none"
                style={{ boxShadow: `0 0 48px -16px ${f.color}88` }}
              >
                {posterPath ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                    alt={`${mediaTitle} poster`}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                ) : (
                  <div className="skeleton h-full w-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A08] via-[#0D0A08]/50 to-transparent" />
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 110%, ${f.color}55, transparent 60%)` }} />

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span
                    className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-[#EEEAE2]"
                    style={{ backgroundColor: `${f.color}33`, border: `1px solid ${f.color}66` }}
                  >
                    <span aria-hidden="true">{f.emoji}</span>{f.label}
                  </span>
                  <h3 className="mt-2 font-plus-jakarta text-lg font-extrabold leading-tight sm:text-xl xl:text-2xl">{item.label}</h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#B8AA98] sm:text-sm">{item.subtitle}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#F5A623]">
                    <span className="truncate">{mediaTitle}</span>
                    <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 overflow-hidden border-y border-white/10 py-4">
          <div className="reel-marquee flex w-max gap-6">
            {[...Array(2)].flatMap(() => [
              'LET PEOPLE ENJOY THINGS ✦',
              'BUT THAT ENDING THO ✦',
              'I SAID WHAT I SAID ✦',
              'THE GROUP CHAT NEEDS THIS ✦',
            ]).map((item, i) => (
              <span key={`${item}-${i}`} className="whitespace-nowrap font-plus-jakarta text-sm font-extrabold tracking-wide text-[#B8AA98]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-5 pb-16 sm:px-8 lg:pb-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-14 text-center backdrop-blur-md sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-[#FF4D9D]/25 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-8 h-64 w-64 rounded-full bg-[#9B6BFF]/25 blur-[100px]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-plus-jakarta text-4xl font-extrabold tracking-tight sm:text-6xl">
              Got a take? <span className="shimmer-text">Drop it.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#B8AA98]">
              No essays required. Just you, a show, and how it hit.
            </p>
            <Link href="/login" style={{ background: CTA_GRADIENT }} className="press mt-8 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-extrabold text-[#0D0A08] transition hover:brightness-110">
              Join the conversation <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl xl:max-w-[1400px] 2xl:max-w-[1680px] flex-col items-center justify-between gap-3 text-xs text-[#B8AA98] sm:flex-row">
          <Logo asLink={false} className="text-sm" />
          <p>For the takes, the feels, and the group chat debates.</p>
        </div>
      </footer>
    </main>
  );
}
