'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import FormField from '@/components/ui/form-field';
import { getRedirect } from '@/utils/getRedirect';

export default function CompleteProfilePage () {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Carries the pre-login destination through the OAuth round trip.

  useEffect(() => {
    let handled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (handled) return;

      if (session?.user) {
        handled = true;
        const user = session.user;
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();
        if (profileData?.username) { router.push(getRedirect()); return; }
        const meta = (user.user_metadata || {}) as Record<string, string>;
        const suggested = meta.username || meta.name || (user.email ? user.email.split('@')[0] : '');
        setUsername((suggested || '').substring(0, 32));
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        handled = true;
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Username is required'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Not authenticated'); setLoading(false); return; }
      // Upsert profile row with chosen username
      const { error: upsertError } = await supabase.from('profiles').upsert({ id: user.id, username }, { onConflict: 'id' });
      if (upsertError) { setError(upsertError.message); setLoading(false); return; }
      router.push(getRedirect());
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-dm-sans flex min-h-screen items-center justify-center bg-[#07051A] text-sm font-semibold text-[#B3A9D6]">
        Loading…
      </div>
    );
  }

  return (
    <div className="font-dm-sans relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07051A] p-6">
      <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-[#FF4D9D]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#9B6BFF]/20 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md">
        <h2 className="mb-2 font-plus-jakarta text-3xl font-extrabold tracking-tight text-[#F1EEFF]">
          Pick your <span className="shimmer-text">handle</span>
        </h2>
        <p className="mb-6 text-sm text-[#B3A9D6]">Choose a username so other users can find and mention you.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Username" placeholder="your-username" value={username} onChange={e => setUsername(e.target.value)} required />
          {error && (
            <div role="alert" className="rounded-2xl border border-[#FF5A36]/40 bg-[#FF5A36]/10 px-4 py-2.5 text-sm text-[#FFB4A3]">{error}</div>
          )}
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={() => router.push(getRedirect())} className="press flex-1 rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-[#F1EEFF]">Skip</button>
            <button type="submit" style={{ background: 'linear-gradient(135deg,#A78BFA,#7C3AED 60%,#5B21B6)' }} className="press flex-1 rounded-full py-3 text-sm font-extrabold text-white hover:brightness-110">{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
