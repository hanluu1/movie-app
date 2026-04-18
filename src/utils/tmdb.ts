const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
}

export interface TrendingMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

export async function getTrendingMovies (): Promise<TrendingMovie[]> {
  try {
    const res = await fetch('https://api.themoviedb.org/3/trending/movie/week', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    const data = await res.json();
    return (data.results || []).slice(0, 8);
  } catch {
    return [];
  }
}

export interface TrendingTV {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  first_air_date: string;
}

export async function getTrendingTV (): Promise<TrendingTV[]> {
  try {
    const res = await fetch('https://api.themoviedb.org/3/trending/tv/week', {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });
    const data = await res.json();
    return (data.results || []).slice(0, 8);
  } catch {
    return [];
  }
}

export async function searchMoviesAndTv (query: string): Promise<Movie[]> {
  if (!query) return [];

  try {
    const endpoints = ['movie', 'tv'].map((type) =>
      fetch(`https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      }).then(res => res.json())
    );

    const [movieData, tvData] = await Promise.all(endpoints);
    return [...(movieData.results || []), ...(tvData.results || [])];
  } catch (error) {
    console.error('TMDB fetch error:', error);
    return [];
  }
}
