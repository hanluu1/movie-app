// Calls our own server proxy instead of TMDB directly (keeps the key server-side)
async function tmdbFetch (path: string) {
  const res = await fetch(`/api/tmdb?path=${encodeURIComponent(path)}`);
  return res.json();
}

export interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
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
    const data = await tmdbFetch('/trending/movie/week');
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
    const data = await tmdbFetch('/trending/tv/week');
    return (data.results || []).slice(0, 8);
  } catch {
    return [];
  }
}

const YEAR_SUFFIX_RE = /^(.+?)\s+(\d{4})$/;
const CURRENT_YEAR = new Date().getFullYear();

export async function searchMoviesAndTv (query: string): Promise<Movie[]> {
  if (!query) return [];

  try {
    const match = YEAR_SUFFIX_RE.exec(query.trim());
    const searchTerm = match ? match[1] : query;
    const year = match ? match[2] : null;

    const movieParams = new URLSearchParams({ query: searchTerm });
    const tvParams = new URLSearchParams({ query: searchTerm });
    if (year) {
      movieParams.set('primary_release_year', year);
      tvParams.set('first_air_date_year', year);
    }

    const [movieData, tvData] = await Promise.all([
      tmdbFetch(`/search/movie?${movieParams}`),
      tmdbFetch(`/search/tv?${tvParams}`),
    ]);

    const results: Movie[] = [...(movieData.results || []), ...(tvData.results || [])];

    return results.sort((a, b) => {
      const yearA = parseInt((a.release_date || a.first_air_date || '').slice(0, 4)) || 0;
      const yearB = parseInt((b.release_date || b.first_air_date || '').slice(0, 4)) || 0;
      if (yearA === CURRENT_YEAR && yearB !== CURRENT_YEAR) return -1;
      if (yearB === CURRENT_YEAR && yearA !== CURRENT_YEAR) return 1;
      return yearB - yearA;
    });
  } catch (error) {
    console.error('TMDB fetch error:', error);
    return [];
  }
}
