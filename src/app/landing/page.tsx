'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRightIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { searchMoviesAndTv, searchTvShows, type Movie, type TrendingTV } from '@/lib/tmdb/client';

const FEATURED_REACTIONS = [
  {
    search: 'Queen of Tears',
    mediaType: 'tv' as const,
    region: 'K-DRAMA',
    username: 'soojin.exe',
    initials: 'SE',
    time: '2h ago',
    quote: 'I came for the rich people problems and stayed for the emotional damage.',
    emoji: '😭',
    likes: 2.4,
    replies: 186,
  },
  {
    search: 'The Bear',
    mediaType: 'tv' as const,
    region: 'US SERIES',
    username: 'film bro retired',
    initials: 'FR',
    time: '5h ago',
    quote: 'Every episode is just somebody yelling “behind” while my blood pressure leaves the chat.',
    emoji: '🔥',
    likes: 1.8,
    replies: 94,
  },
  {
    search: 'Hidden Love',
    mediaType: 'tv' as const,
    region: 'C-DRAMA',
    username: 'plotwist princess',
    initials: 'PP',
    time: '1d ago',
    quote: 'The butterflies are cute but the episode count is personally attacking my sleep schedule.',
    emoji: '🫠',
    likes: 1.2,
    replies: 71,
  },
];

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

export default function LandingPage () {
  const [featuredMedia, setFeaturedMedia] = useState<(TrendingTV | null)[]>([]);
  const [moodMedia, setMoodMedia] = useState<(Movie | TrendingTV | null)[]>([]);

  useEffect(() => {
    Promise.all(FEATURED_REACTIONS.map((reaction) => searchTvShows(reaction.search)))
      .then((results) => setFeaturedMedia(results.map((items, index) => {
        const expectedTitle = FEATURED_REACTIONS[index].search.trim().toLowerCase();
        return items.find((item) => item.name.trim().toLowerCase() === expectedTitle)
          ?? items[0]
          ?? null;
      })));
  }, []);

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
    <main className="min-h-screen overflow-hidden bg-[#0A0908] font-sans text-[#EEEAE2]">
      <style>{`
        @keyframes reel-float {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes reel-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .reel-float { animation: reel-float 5s ease-in-out infinite; }
        .reel-marquee { animation: reel-marquee 30s linear infinite; }
        .reel-marquee-wrap:hover .reel-marquee { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .reel-float, .reel-marquee { animation: none; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      {/* NAV */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="font-plus-jakarta text-xl font-extrabold tracking-tight sm:text-2xl">
          Reel<span className="text-[#C8956A]">Emotion</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#B9ADA1] sm:flex">
          <a href="#takes" className="transition hover:text-white">Community reactions</a>
          <a href="#browse-by-mood" className="transition hover:text-white">Browse by mood</a>
        </nav>
        <Link href="/login" className="rounded-full bg-[#EEEAE2] px-5 py-2.5 text-sm font-bold text-[#17110E] transition hover:bg-[#D9C9B7]">
          Sign up 
        </Link>
      </header>
      {/* HERO */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-5 pb-16 pt-14 text-center sm:px-8 sm:pt-20 lg:pb-20 lg:pt-24">
        <div className="pointer-events-none absolute left-[8%] top-24 hidden h-28 w-28 rounded-full bg-[#A95E3E]/10 blur-3xl lg:block" />
        <div className="pointer-events-none absolute right-[8%] top-40 hidden h-36 w-36 rounded-full bg-[#C8956A]/10 blur-3xl lg:block" />
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4B3427] bg-[#211711] px-4 py-2 text-xs font-bold tracking-wide text-[#E4B17F]">
          <FireIcon className="h-4 w-4" />
          MOVIE DISCOVERY + COMMUNITY TAKES
        </div>

        <h1 className="max-w-4xl font-plus-jakarta text-[clamp(2.8rem,7.5vw,6.4rem)] font-extrabold leading-[0.98] tracking-[-0.055em]">
          Find your next watch through <span className="text-[#D99A68]">real reactions.</span>
        </h1>

        <p className="mt-8 max-w-xl text-base leading-7 text-[#B8AAA0] sm:text-lg">
          Browse by mood, read what people actually felt, and share your own reaction when a movie gives you something to talk about.
        </p>

        <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link href="/community" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8956A] px-7 py-3.5 text-sm font-extrabold text-[#17110E] shadow-[0_8px_30px_rgba(200,149,106,0.12)] transition hover:-translate-y-0.5 hover:bg-[#D9A779]">
            See community reactions <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/discover" className="inline-flex items-center justify-center rounded-xl border border-[#44362D] bg-[#171310] px-7 py-3.5 text-sm font-bold text-[#EEEAE2] transition hover:border-[#C8956A]/70 hover:bg-[#211A15]">
            Discover movies & shows
          </Link>
        </div>

        {/* Floating reactions */}
        <div className="relative mt-10 hidden h-20 w-full max-w-3xl sm:block">
          <div className="reel-float absolute left-[2%] top-5 rounded-2xl border border-[#493528] bg-[#211711] px-4 py-2 text-sm font-bold text-[#E9C09A] shadow-lg">
            “LET HER COOK” 🍳
          </div>
          <div className="reel-float absolute left-[32%] top-0 rounded-2xl border border-[#493528] bg-[#18120F] px-4 py-2 text-sm font-bold text-[#D5C7BA] shadow-lg" style={{ animationDelay: '1.2s' }}>
            “NO BECAUSE SAME” 🤝
          </div>
          <div className="reel-float absolute right-[29%] top-7 rounded-2xl border border-[#493528] bg-[#211711] px-4 py-2 text-sm font-bold text-[#E9C09A] shadow-lg" style={{ animationDelay: '2.1s' }}>
            “THE ENDING???” 🫠
          </div>
          <div className="reel-float absolute right-[1%] top-2 rounded-2xl border border-[#493528] bg-[#18120F] px-4 py-2 text-sm font-bold text-[#D5C7BA] shadow-lg" style={{ animationDelay: '3s' }}>
            “I SAID WHAT I SAID” 🗣️
          </div>
        </div>
      </section>
      {/* COMMUNITY TAKES */}
      <section id="takes" className="border-y border-[#211A15] bg-[#100D0B]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C8956A]">Community reactions</p>
              <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">See what people felt.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#9E9083] sm:text-base">Real reactions from people watching the same movies and shows.</p>
            </div>
            <Link href="/community" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#D9A779] transition hover:text-[#F0C69D]">
              See all reactions <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURED_REACTIONS.map((post, index) => {
              const media = featuredMedia[index];
              const mediaType = 'tv';
              const mediaTitle = media?.name || post.search;
              const movieHref = media
                ? `/movie-more-info/${media.id}?type=${mediaType}`
                : '/discover';

              return (
                <article key={post.search} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#30241D] bg-[#17120F] transition duration-300 hover:-translate-y-1 hover:border-[#72513B]">
                  <Link href={movieHref} className="relative block h-56 overflow-hidden sm:h-64">
                    {media?.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                        alt={`${mediaTitle} poster`}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="h-full w-full object-cover object-center opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#2A1D15]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#17120F] via-[#17120F]/20 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-[#100D0B]/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-[#F0C69D] backdrop-blur-sm">
                      {post.region}
                    </span>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-plus-jakarta text-xl font-extrabold">{mediaTitle}</h3>
                      <p className="mt-1 text-xs font-medium text-[#C4B5A7]">Tap to see the movie or show</p>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D6A174] text-xs font-extrabold text-[#24170F]">{post.initials}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#EEEAE2]">@{post.username}</p>
                        <p className="text-xs text-[#84766A]">{post.time}</p>
                      </div>
                      <span className="ml-auto text-lg" aria-hidden="true">{post.emoji}</span>
                    </div>

                    <p className="flex-1 text-[15px] font-medium leading-6 text-[#E7DDD3]">“{post.quote}”</p>

                    <div className="mt-5 flex items-center gap-4 border-t border-[#30241D] pt-4 text-xs font-semibold text-[#B5A496]">
                      <span>♥ {post.likes}k felt this</span>
                      <span>·</span>
                      <span>{post.replies} replies</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-center text-[11px] text-[#65574B]">Featured reactions for a taste of the community.</p>
        </div>
      </section>


      {/* MOVIE DISCOVERY */}
      <section
        id="browse-by-mood"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20"
      >
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#C8956A]">
            BROWSE BY MOOD
          </p>

          <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find something that fits the moment.
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#9E9083] sm:text-base">
            Pick a feeling and find a movie or show to match it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOOD_FEATURES.map((item, index) => {
            const media = moodMedia[index];
            const mediaTitle = media
              ? ('title' in media ? media.title : media.name)
              : item.search;
            const posterPath = media?.poster_path;
            const mediaHref = media
              ? `/movie-more-info/${media.id}?type=${item.mediaType}`
              : `/discover?mood=${encodeURIComponent(item.mood)}`;

            return (
              <Link
                href={mediaHref}
                key={item.mood}
                className="group flex min-h-36 items-stretch gap-4 overflow-hidden rounded-2xl border border-[#34271F] bg-[#15100D] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#C8956A]/70 sm:min-h-40 sm:gap-5 sm:p-4"
              >
                <div className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-[#2A1D15] sm:h-32 sm:w-32">
                  {posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${posterPath}`}
                      alt={`${mediaTitle} poster`}
                      fill
                      sizes="128px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#2A1D15]" />
                  )}
                </div>

                <div className="min-w-0 flex flex-1 flex-col justify-center py-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D9A779]">
                    {item.mood}
                  </p>
                  <h3 className="mt-1 font-plus-jakarta text-base font-extrabold sm:text-lg">
                    {item.label}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#9E9083]">
                    {item.subtitle}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#F0C69D]">
                    {mediaTitle}
                    <ArrowUpRightIcon className="h-3.5 w-3.5 shrink-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* PLAYFUL MARQUEE */}
        <div className="reel-marquee-wrap mt-14 overflow-hidden border-y border-[#30231A] py-4">
          <div className="reel-marquee flex w-max gap-4">
            {[...Array(2)].flatMap(() => [
              'LET PEOPLE ENJOY THINGS ✦',
              'BUT THAT ENDING THO ✦',
              'I SAID WHAT I SAID ✦',
              'THE GROUP CHAT NEEDS THIS ✦',
            ]).map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="whitespace-nowrap font-plus-jakarta text-sm font-extrabold tracking-wide text-[#B58B67]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#4A3325] bg-[#21160F] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -left-12 -top-16 h-48 w-48 rounded-full bg-[#C8956A]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-8 h-56 w-56 rounded-full bg-[#A95E3E]/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3A2619] text-[#E3B081]">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#D9A779]">Your take belongs here</p>
            <h2 className="font-plus-jakarta text-3xl font-extrabold tracking-tight sm:text-5xl">Got a reaction? <span className="text-[#D99A68]">We’re listening.</span></h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#B8A393] sm:text-base">Share what you felt, find your people, and see what everyone’s watching. No essays required.</p>
            <div className="mt-8">
              <Link href="/community" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C8956A] px-7 py-3.5 text-sm font-extrabold text-[#17110E] transition hover:-translate-y-0.5 hover:bg-[#D9A779]">
                Join the conversation <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#211A15] px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-[#796B5F] sm:flex-row">
          <span className="font-plus-jakarta text-sm font-extrabold text-[#BBAA99]">ReelEmotion</span>
          <p>For the takes, the feels, and the group chat debates.</p>
        </div>
      </footer>
    </main>
  );
}
