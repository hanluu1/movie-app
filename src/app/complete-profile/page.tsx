'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import FormField from '@/components/ui/FormField';

export default function CompleteProfilePage () {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

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
        if (profileData?.username) { router.push('/'); return; }
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
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'An error occurred');
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-stone-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md" style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}>
        <h2 className="text-2xl font-bold mb-4">Complete your profile</h2>
        <p className="text-sm text-stone-600 mb-6">Choose a username so other users can find and mention you.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Username" placeholder="your-username" value={username} onChange={e => setUsername(e.target.value)} required />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => router.push('/')} className="flex-1 py-3 rounded-xl border">Skip</button>
            <button type="submit" className="flex-1 py-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg,#DC2626,#EA580C)' }}>{loading ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
