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

function interleaveById<T extends { id: number }> (...arrays: T[][]): T[] {
  const seen = new Set<number>();
  const result: T[] = [];
  const maxLen = Math.max(...arrays.map(a => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of arrays) {
      const item = arr[i];
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
  }
  return result;
}

export async function getTrendingMovies (): Promise<TrendingMovie[]> {
  try {
    const [en, ko, ja, zh] = await Promise.all([
      tmdbFetch('/trending/movie/week?language=en-US'),
      tmdbFetch('/discover/movie?sort_by=popularity.desc&with_original_language=ko'),
      tmdbFetch('/discover/movie?sort_by=popularity.desc&with_original_language=ja'),
      tmdbFetch('/discover/movie?sort_by=popularity.desc&with_original_language=zh'),
    ]);
    return interleaveById(
      (en.results || []).slice(0, 8),
      (ko.results || []).slice(0, 8),
      (ja.results || []).slice(0, 8),
      (zh.results || []).slice(0, 8),
    );
  } catch {
    return [];
  }
}

export async function getMoviesByGenre (genreId: number): Promise<TrendingMovie[]> {
  try {
    const [en, ko, ja, zh] = await Promise.all([
      tmdbFetch(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&with_original_language=en`),
      tmdbFetch(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&with_original_language=ko`),
      tmdbFetch(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&with_original_language=ja`),
      tmdbFetch(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&with_original_language=zh`),
    ]);
    return interleaveById(
      (en.results || []).slice(0, 6),
      (ko.results || []).slice(0, 6),
      (ja.results || []).slice(0, 6),
      (zh.results || []).slice(0, 6),
    );
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
    const [en, ko, ja, zh] = await Promise.all([
      tmdbFetch('/trending/tv/week?language=en-US'),
      tmdbFetch('/discover/tv?sort_by=popularity.desc&with_original_language=ko'),
      tmdbFetch('/discover/tv?sort_by=popularity.desc&with_original_language=ja'),
      tmdbFetch('/discover/tv?sort_by=popularity.desc&with_original_language=zh'),
    ]);
    return interleaveById(
      (en.results || []).slice(0, 8),
      (ko.results || []).slice(0, 8),
      (ja.results || []).slice(0, 8),
      (zh.results || []).slice(0, 8),
    );
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
