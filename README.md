# **🎬 Reel Emotion**
Reel Emotions is a movie review web app that lets users to search for movies, share reviews, upvote helpful content, and organize their personal movie watchlists in clean, responsive interface.

## 🌟 Live Demo
🔗 Visit Reel Emotions: https://reel-emotions.vercel.app/

## ✨ Features

### 🎨 Frontend Highlights 
- Built with Next.js and Tailwind CSS for fast performance and responsive design.
- Dynamic movie search with debounced input and instant results.
- Detailed movie pages including posters, descriptions, release info, and community reviews.
- Mobile-first layouts optimized for both desktop and mobile devices

### 📝 Interactive Review System
- Users can add, edit, delete, and upvote reviews.
- Reviews are sorted by most helpful (upvotes) or most recent.
- Real-time UI updates for a seamless user experience

### 🎥 My Movies Dashboard
- Organize movies into Watched, To-Watch, or All
- Smooth tab-based filtering with consistent movie card components
- Centralized hub for managing personal movie lists

## 🏗️ Architecture 

- **Client:** Next.js (React) with a component-based UI styled using Tailwind CSS
- **Application Layer:** Next.js API Routes and Server Actions handling data fetching, mutations, and authorization
- **Backend Services:** Supabase (PostgreSQL database and Auth) and an external Movie API for film metadata
- **Deployment:** Hosted on Vercel with edge-optimized routing, caching, and serverless execution


## 🔄 Data Flow

### Feature Flow A
1. User performs an action in the UI
2. Request is validated and sent to the server
3. Server processes logic and updates the database
4. Updated data is returned and rendered in the UI

### Authentication Flow
1. User signs up or logs in
2. Authentication service issues a secure session
3. Session state controls access to protected routes and data

### Data Management Flow
1. Authenticated users submit data changes
2. Server validates permissions
3. Database is updated and queried
4. UI reflects changes instantly

## 🧠 Tech Stack
- **Frontend:** Next.js, tailwind CSS
- **Backend:** Nex.js API Routes & Server Actions
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth 
- **Deployment:** Vercel