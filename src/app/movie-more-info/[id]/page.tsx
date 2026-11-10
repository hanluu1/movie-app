import Image from 'next/image';
import { AppShell } from '@/components/layout';
import { notFound } from 'next/navigation';
import { MovieCommunityPosts } from '@/features/posts/components/movie-community-posts';
import { BackButton } from '@/components/ui/back-button';

interface CastMember { name: string }
interface CrewMember { name: string; job: string }
interface Genre { id: number; name: string }

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
      cast: (credits.cast || []) as CastMember[],
      crew: (credits.crew || []) as CrewMember[],
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
  const director = (crew as CrewMember[]).find((c) => c.job === 'Director')?.name
    ?? (mediaType === 'tv' ? (crew as CrewMember[]).find((c) => c.job === 'Executive Producer')?.name : null)
    ?? null;
  const topCast: string[] = (cast as CastMember[]).slice(0, 5).map((c) => c.name);
  const rating = vote_average ? Math.round(vote_average * 10) / 10 : null;

  const posterUrl = poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : null;

  return (
    <AppShell width="wide">
      <BackButton />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {posterUrl && (
            <Image src={posterUrl} alt="" fill sizes="900px" className="scale-125 object-cover opacity-40 blur-3xl" />
          )}
          <div className="absolute inset-0 bg-[#0D0A08]/70" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#F5A623] opacity-25 blur-[100px]" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#9B6BFF] opacity-20 blur-[100px]" />
          <div className="film-grain absolute inset-0" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 p-5 sm:flex-row sm:p-8">
          {/* Poster */}
          <div className="mx-auto w-[180px] flex-shrink-0 sm:mx-0 sm:w-[220px]">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={displayTitle}
                width={220}
                height={330}
                priority
                className="h-auto w-full rounded-2xl border border-white/15 object-cover shadow-[0_20px_60px_-15px_rgba(245,166,35,0.45)]"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm text-[#B8AA98]">
                No poster
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <h1 className="font-plus-jakarta text-3xl font-extrabold leading-tight text-[#EEEAE2] sm:text-5xl">
              {displayTitle}
            </h1>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2">
              {year && (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[#EEEAE2]">{year}</span>
              )}
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[#EEEAE2]">
                {mediaType === 'tv' ? 'TV Series' : 'Film'}
              </span>
              {number_of_seasons && (
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-[#EEEAE2]">
                  {number_of_seasons} season{number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              {rating && (
                <span className="rounded-full bg-[#F5A623]/15 px-3 py-1 text-xs font-black text-[#F5A623]">★ {rating}</span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g: Genre) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-[#B8AA98]"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            {overview && (
              <p className="text-sm leading-relaxed text-[#EEEAE2]/90 sm:text-base">{overview}</p>
            )}

            {/* Cast & director */}
            {(director || topCast.length > 0) && (
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
                {director && (
                  <div className="text-[#B8AA98]">
                    <span className="font-bold text-[#EEEAE2]">
                      {mediaType === 'tv' ? 'Created by ' : 'Directed by '}
                    </span>
                    {director}
                  </div>
                )}
                {topCast.length > 0 && (
                  <div className="text-[#B8AA98]">
                    <span className="font-bold text-[#EEEAE2]">Starring </span>
                    {topCast.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <MovieCommunityPosts
        movieId={Number(id)}
        movieTitle={displayTitle}
        posterPath={poster_path ?? null}
        mediaType={mediaType}
      />
    </AppShell>
  );
}
