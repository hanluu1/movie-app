
import Image from 'next/image';
import { Header } from '@/components';
import { notFound } from 'next/navigation';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

async function fetchMovieDetails (id: string) {
  const endpoints = [
    { type: 'movie', url: `https://api.themoviedb.org/3/movie/${id}` },
    { type: 'tv', url: `https://api.themoviedb.org/3/tv/${id}` },
  ];

  for (const { url } of endpoints) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (res.ok) {
      const details = await res.json();

      const creditsRes = await fetch(`${url}/credits`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };

      return {
        ...details,
        cast: credits.casts,
      };
    }
  }

  throw new Error('Movie or TV show not found');
}
export default async function MoviePage ({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = await params;
  const movie = await fetchMovieDetails(id);
  if (!movie) notFound();

  const {
    title,
    name,
    overview,
    poster_path,
    release_date,
    first_air_date,
    genres = [],
    movie_id,
  } = movie;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white transition-all duration-300">
      <Header showSearchIcon={false}/>
      
      <div className="flex flex-row bg-gray-900 border border-gray-700 rounded-2xl w-[90%] gap-4 mx-auto my-10 p-6">
        {poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
            alt={title || name}
            width={250}
            height={150}
            className="rounded shadow-md"
          />
        ) : (
          <div className="w-[300px] h-[450px] bg-gray-700 rounded flex items-center justify-center">
            <span>No Image</span>
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {title || name}
          </h1>
          {(release_date || first_air_date) && (
            <p className="text-sm text-gray-400 mb-4">
              Release Date: {release_date || first_air_date}
            </p>
          )}
          <div className="mb-4">
            {overview || 'No overview available.'}
          </div>   
          {genres.length > 0 && (
            <div className="flex flex-row gap-2 mb-2">
              <p className='font-bold'>Genres:</p>
              {genres.map((genre: any) => genre.name).join(', ')}
            </div>
          )}
          {movie.cast && movie.cast.length > 0 && (
            <div className='flex flex-row gap-2'>
              <div className="font-bold mb-2">Cast:</div>
              {movie.cast
                .slice(0, 5)
                .map((actor: any) => actor.name)
                .join(', ')}
            </div>
          )}
        </div> 
      </div>
    </div>
  );
}
