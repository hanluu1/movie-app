'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getRedirect } from '@/utils/getRedirect';
import GoogleIcon from '@/components/ui/google-icon';
import FormField from '@/components/ui/form-field';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function AuthPage () {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const user = session.user;
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (profileError) console.error('Profile fetch error:', profileError.message);
          if (profileData?.username) router.replace(getRedirect());
        } catch (err) {
          console.error('Error checking profile on sign-in:', err);
        }
      }
    });
    return () => { listener.subscription.unsubscribe(); };
  }, [router]);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); return; }
    if (!data.user) { setError('User not found'); return; }
    const { data: profileData, error: profileError } = await supabase
      .from('profiles').select('username').eq('id', data.user.id).maybeSingle();
    if (profileError) { console.error('Profile fetch error:', profileError.message); return; }
    if (!profileData?.username) {
      router.replace(`/complete-profile?redirect=${encodeURIComponent(getRedirect())}`);
      return;
    }
  };

  const handleSignup = async () => {
    if (!username.trim()) { setError('Username is required.'); return; }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) { setError(error.message); return; }
    alert('Signup successful! Check your email to confirm your account.');
    setIsLogin(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) { await handleLogin(); } else { await handleSignup(); }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/complete-profile?redirect=${encodeURIComponent(getRedirect())}`,
      },
    });
  };

  const switchMode = () => { setIsLogin(prev => !prev); setError(''); };

  return (
    <div className="font-dm-sans relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0D0A08] p-5">
      <div className="pointer-events-none absolute -left-24 -top-16 h-96 w-96 rounded-full bg-[#FF4D9D]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-[#9B6BFF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#F5A623]/15 blur-[120px]" />
      <div className="film-grain pointer-events-none fixed inset-0" />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <Logo shimmer className="text-4xl" />
          <p className="mt-2 text-sm text-[#B8AA98]">
            {isLogin ? 'Welcome back. The group chat missed you.' : 'Yap about what you watch. Tag how it hit.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-md sm:p-8">
          <div className="mb-6">
            <h1 className="mb-1 font-plus-jakarta text-2xl font-extrabold tracking-tight text-[#EEEAE2]">
              {isLogin ? 'Sign in' : 'Join ReelEmotion'}
            </h1>
            <p className="text-sm text-[#B8AA98]">
              {isLogin ? 'Share and discover reactions.' : 'Share how movies make you feel.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="press mb-6 flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-3 text-sm font-bold text-[#EEEAE2] transition-all hover:border-[#F5A623]/60 hover:bg-white/[0.1]"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="relative mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium text-[#B8AA98]">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <FormField
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            )}

            <FormField
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <FormField
              label="Password"
              type="password"
              placeholder={isLogin ? 'Enter your password' : 'At least 8 characters'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              hint={!isLogin ? 'At least 8 characters' : undefined}
            />

            {error && (
              <p role="alert" className="rounded-2xl border border-[#FF5A36]/40 bg-[#FF5A36]/10 px-4 py-2.5 text-sm text-[#FFB4A3]">
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{ background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)' }}
              className="press mt-1 w-full rounded-full py-3 text-sm font-extrabold text-[#0D0A08] transition-all hover:brightness-110"
            >
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#B8AA98]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="font-bold text-[#F5A623] transition-opacity hover:opacity-80"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#B8AA98]">
          <Link href="/" className="transition-colors hover:text-[#EEEAE2]">
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}
