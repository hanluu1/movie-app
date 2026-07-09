# Reel Emotions

A full-stack movie review platform where users can discover trending films, write and upvote reviews, comment on posts, and manage a personal watchlist.

**[Live Demo →](https://reel-emotions.vercel.app/)**
_

---

## Features

- **Movie Search** — debounced search across movies and TV shows via the TMDB API, with year filtering and instant results
- **Community Reviews** — create, edit, delete, and upvote reviews with live like counts via Supabase Realtime subscriptions
- **Comment Threads** — discuss reviews inline without leaving the feed
- **Watchlist** — track movies as Watched, Watching, or To-Watch with per-user persistence
- **Trending Sidebar** — weekly trending movies and TV shows with ranking badges and ratings
- **Authentication** — email/password and Google OAuth with a profile completion flow

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database & Auth | Supabase (PostgreSQL + Auth) |
| Movie Data | TMDB API |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [TMDB API](https://developer.themoviedb.org) key

### Installation

```bash
git clone https://github.com/hanluu1/movie-app.git
cd movie-app
npm install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example 

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
