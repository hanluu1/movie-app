import { NextRequest, NextResponse } from 'next/server';

// No NEXT_PUBLIC_ prefix → stays on the server, never shipped to the browser
const API_KEY = process.env.TMDB_API_KEY;

export async function GET (req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ error: 'Missing "path" query parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.themoviedb.org/3${path}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
      next: { revalidate: 3600 }, // cache TMDB responses for 1 hour
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 502 });
  }
}
