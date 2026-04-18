'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/auth-js';
import { supabase } from '@/lib/supabaseClient';
import LandingPage from '@/modules/home/landing/LandingPage';
import DiscoverPage from '@/modules/home/discover/DiscoverPage';

export default function Home () {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-stone-50" />;
  if (!user) return <LandingPage />;
  return <DiscoverPage />;
}
