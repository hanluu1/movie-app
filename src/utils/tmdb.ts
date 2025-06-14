const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export interface Movie {
  id: number;
  title: string;
  name: string;
  overview: string;
  poster_path: string;
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
