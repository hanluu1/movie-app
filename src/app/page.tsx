'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import LandingPage from './landing/page';

export default function Home () {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/discover');
      else setLoading(false);
    });
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#FAF7F1]" />;
  return <LandingPage />;
}
