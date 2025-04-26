'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZWIyMjIxMzFmNTI0MDcxZGIyYjI3MjRjMDlhNTdhNCIsIm5iZiI6MTc0NTU2MTE1MC42MDE5OTk4LCJzdWIiOiI2ODBiMjYzZTc3OGI0NjI2NzM5ZDNjY2UiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.TiGNwww1D3a15vLc0FXuuCY2F2Wir1REQVucQYMM6f8";


export default function MovieDetail() {
    const { id } = useParams();
    interface Movie {
        title: string;
        release_date: string;
        overview: string;
        poster_path: string;
    }

    const [movie, setMovie] = useState<Movie | null>(null);
    const [cast, setCast] = useState([]);

    useEffect(() => {
        async function fetchMovie() {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}`, {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          });
          const data = await res.json();
          setMovie(data);
        }
    
        async function fetchCast() {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits`, {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          });
          const data = await res.json();
          setCast(data.cast || []);
        }
    
        fetchMovie();
        fetchCast();
      }, [id]);

    if (!movie) return <div>Loading...</div>;

    return (
        <div className="p-6">
        <h1 className="text-4xl font-bold mb-4">{movie.title} ({movie.release_date?.split('-')[0]})</h1>
        <div className="flex flex-row justify-start mb-4 gap-10">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className=" max-w-50 max-h-96" />
            <div className='flex flex-col justify-start'>
            <p className=''>{movie.overview}</p>
            <p>
                Cast: {cast.slice(0, 10).map((member) => member.name).join(', ')}
            </p>
            <button className="bg-green-500 max-w-40 text-white px-4 py-2 rounded-lg">Post Your thought</button>
            </div>
            
        </div>
        
        </div>
    );
}
