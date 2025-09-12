**🎬 Reel Emotion**
Reel Emotions is a full-stack movie review web app that allows users to search for movies, post reviews, upvote helpful content, and organize their personal movie lists. Built with a strong focus on responsive UI, seamless user interactions, and clean design, Reel Emotions delivers a polished front-end experience powered by modern frontend technologies.

**🌟 Live Demo**
🔗 Visit Reel Emotions: Comming soon

**✨ Features**
🎨 Frontend Highlights 
- Built with Next.js and Tailwind CSS for fast performance and responsive design.
- Dynamic Search Experience with debounced input and instant results.
- Detailed Movie Pages including posters, descriptions, release info, and community reviews.
- Interactive Review System
    - Users can add, edit, delete, and upvote reviews.
    - Reviews are sorted by most helpful (upvotes) or most recent.
- My movies Dashboard
    - Users can organize movies into Watched, To-Watch, or view All with smooth tabbed filtering.
    - Uses a consistent UI component design for movie cards across the app.
- Optimized for mobile and desktop with responsive layouts.

**🧠 Frontend Stack**
- Framework: Next.js
- Styling: Tailwind CSS 
- Icons: Heroicon
- Forms & Validation: React Hooks + Custom form handlers

**🔐 Authentication**
- Currently integrated with Supabase Auth for secure login and session management.
- Protected routes ensure only logged-in users can post and manage reviews.
- In progress: migrating to a custom REST API backend to replace Supabase for full control over authentication and data flow.

**🗄️ Backend & Database** 
- Supabase (current)
    - Stores movie reviews and upvotes
    - Handles user data and auth
    - Tracks watchlists (watched/ watching/ to-watch)

- Custom REST API (coming soon)
    - Will handle authentication, data flow, and business logic internally
    - Provides more flexibility and scalability for future features

**🧪 Coming Soon**
- Full migration to custom REST API backend for complete backend control