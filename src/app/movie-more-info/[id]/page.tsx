import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/layout';
import { notFound } from 'next/navigation';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const TMDB_HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json;charset=utf-8',
};

async function fetchMovieDetails (id: string) {
  for (const mediaType of ['movie', 'tv'] as const) {
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

export default async function MoviePage ({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let movie;
  try {
    movie = await fetchMovieDetails(id);
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
    <div className="min-h-screen bg-stone-50">
      <Header />

      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-red-600 font-medium mb-6 transition-colors duration-200 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to feed
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-0">

            {/* Poster */}
            <div className="sm:w-[220px] flex-shrink-0">
              {poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${poster_path}`}
                  alt={displayTitle}
                  width={220}
                  height={330}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: 330 }}
                />
              ) : (
                <div
                  className="w-full h-[330px] flex items-center justify-center text-stone-400 text-sm"
                  style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
                >
                  No poster
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 px-7 py-7">
              <h1
                className="text-red-600 leading-tight mb-2"
                style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: '2rem', letterSpacing: '-0.02em' }}
              >
                {displayTitle}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {year && <span className="text-stone-500 text-sm">{year}</span>}
                {year && <span className="text-stone-300 text-sm">·</span>}
                <span className="text-stone-500 text-sm">{mediaType === 'tv' ? 'TV Series' : 'Film'}</span>
                {number_of_seasons && (
                  <>
                    <span className="text-stone-300 text-sm">·</span>
                    <span className="text-stone-500 text-sm">{number_of_seasons} season{number_of_seasons > 1 ? 's' : ''}</span>
                  </>
                )}
                {rating && (
                  <>
                    <span className="text-stone-300 text-sm">·</span>
                    <span className="text-amber-500 font-semibold text-sm">★ {rating}</span>
                  </>
                )}
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {genres.map((g: any) => (
                    <span
                      key={g.id}
                      className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-full text-xs font-medium text-stone-600"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {overview && (
                <p className="text-stone-600 text-sm leading-relaxed mb-5" style={{ lineHeight: '1.75' }}>
                  {overview}
                </p>
              )}

              {/* Cast & director */}
              <div className="flex flex-col gap-2 pt-4 border-t border-stone-100">
                {director && (
                  <div className="text-sm text-stone-500">
                    <span className="font-semibold text-stone-700">
                      {mediaType === 'tv' ? 'Created by ' : 'Directed by '}
                    </span>
                    {director}
                  </div>
                )}
                {topCast.length > 0 && (
                  <div className="text-sm text-stone-500">
                    <span className="font-semibold text-stone-700">Starring </span>
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
