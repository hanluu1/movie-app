# ReelEmotion

A full-stack movie and TV community where people discover what to watch by feeling, read real reactions, and share how a film or series stayed with them. No star ratings — just honest reactions.

**[Live Demo →](https://reel-emotions.vercel.app/)**
_

---

## Features

- **Mood Discovery** — browse movies and TV shows by feelings such as “Mind-bending,” “Comforting,” and “Broke my heart”
- **Movie Search** — debounced search across movies, TV shows, and community reactions via the TMDB API
- **Community Reactions** — create, edit, delete, and upvote reactions with live like counts via Supabase Realtime subscriptions
- **Comment Threads** — discuss reactions inline without leaving the community feed
- **Movie Details** — view overviews, genres, cast, directors, ratings, and related community reactions
- **Trending Films and Series** — explore what is popular worldwide this week
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
yarn install
```

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

Then open `.env.local` and add your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
```

Start the dev server:

```bash
yarn dev
```

