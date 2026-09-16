import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { notFound } from 'next/navigation';

const API_KEY = process.env.TMDB_API_KEY;

const TMDB_HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json;charset=utf-8',
};

async function fetchMovieDetails (id: string, type?: string) {
  const typesToTry = (type === 'movie' || type === 'tv') ? [type] : (['movie', 'tv'] as const);
  for (const mediaType of typesToTry) {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}`;
    const res = await fetch(url, { headers: TMDB_HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) continue;

    const details = await res.json();
    const creditsRes = await fetch(`${url}/credits`, { headers: TMDB_HEADERS, next: { revalidate: 3600 } });
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };

    return {
      ...details,
      mediaType,
      cast: (credits.cast || []) as any[],
      crew: (credits.crew || []) as any[],
    };
  }
  return null;
}

export default async function MoviePage ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type?: string }> }) {
  const { id } = await params;
  const { type } = await searchParams;

  let movie;
  try {
    movie = await fetchMovieDetails(id, type);
  } catch {
    notFound();
  }
  if (!movie) notFound();

  const {
    title,
    name,
    overview,
    poster_path,
    release_date,
    first_air_date,
    genres = [],
    mediaType,
    cast,
    crew,
    vote_average,
    number_of_seasons,
  } = movie;

  const displayTitle = title || name;
  const year = (release_date || first_air_date || '').slice(0, 4);
  const director = (crew as any[]).find((c) => c.job === 'Director')?.name
    ?? (mediaType === 'tv' ? (crew as any[]).find((c) => c.job === 'Executive Producer')?.name : null)
    ?? null;
  const topCast: string[] = (cast as any[]).slice(0, 5).map((c) => c.name);
  const rating = vote_average ? Math.round(vote_average * 10) / 10 : null;

  return (
    <div className="font-dm-sans min-h-screen bg-[#FAF7F1] text-[#172526]">
      <Header />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6F8C88] hover:text-[#172526] transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to feed
        </Link>

        {/* Card */}
        <div className="bg-[#FFFDF8] border border-[#E8EEEA] rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row">

            {/* Poster */}
            <div className="sm:w-[200px] flex-shrink-0">
              {poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                  alt={displayTitle}
                  width={200}
                  height={300}
                  className="w-full h-full object-cover max-h-[300px]"
                />
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center text-[#6F8C88] text-sm bg-[#EEF2ED]">
                  No poster
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col gap-4">

              <div>
                <h1 className="font-plus-jakarta font-extrabold text-2xl text-[#172526] leading-snug mb-2">
                  {displayTitle}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#6F8C88]">
                  {year && <span>{year}</span>}
                  <span>·</span>
                  <span>{mediaType === 'tv' ? 'TV Series' : 'Film'}</span>
                  {number_of_seasons && (
                    <>
                      <span>·</span>
                      <span>{number_of_seasons} season{number_of_seasons > 1 ? 's' : ''}</span>
                    </>
                  )}
                  {rating && (
                    <>
                      <span>·</span>
                      <span className="text-amber-500 font-semibold">★ {rating}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g: any) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 bg-[#EEF2ED] rounded-full text-xs font-semibold text-[#2A4649]"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {overview && (
                <p className="text-[#3F5E5A] text-sm leading-relaxed">
                  {overview}
                </p>
              )}

              {/* Cast & director */}
              <div className="flex flex-col gap-2 pt-4 border-t border-[#E8EEEA] text-sm">
                {director && (
                  <div className="text-[#6F8C88]">
                    <span className="font-semibold text-[#172526]">
                      {mediaType === 'tv' ? 'Created by ' : 'Directed by '}
                    </span>
                    {director}
                  </div>
                )}
                {topCast.length > 0 && (
                  <div className="text-[#6F8C88]">
                    <span className="font-semibold text-[#172526]">Starring </span>
                    {topCast.join(', ')}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
