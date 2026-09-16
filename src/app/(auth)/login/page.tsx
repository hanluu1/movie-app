'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getRedirect } from '@/utils/getRedirect';
import GoogleIcon from '@/components/ui/google-icon';
import FormField from '@/components/ui/form-field';
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
          if (profileData?.username) router.push(getRedirect());
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
      router.push(`/complete-profile?redirect=${encodeURIComponent(getRedirect())}`);
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
    <div className="font-dm-sans min-h-screen bg-[#FAF7F1] flex items-center justify-center p-6">

      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-plus-jakarta font-extrabold text-2xl tracking-tight text-[#172526]">
              ReelEmotions
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#FFFDF8] border border-[#E8EEEA] rounded-3xl p-8 shadow-[0_8px_32px_rgba(23,37,38,0.06)]">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-plus-jakarta font-extrabold text-2xl tracking-tight text-[#172526] mb-1">
              {isLogin ? 'Welcome back' : 'Join ReelEmotions'}
            </h1>
            <p className="text-sm text-[#6F8C88]">
              {isLogin
                ? 'Sign in to share and discover reactions.'
                : 'Share how movies make you feel.'}
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 border border-[#E8EEEA] bg-white rounded-xl font-semibold text-sm text-[#172526] transition-all hover:border-[#2A4649] hover:shadow-sm flex items-center justify-center gap-2.5 mb-6"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E8EEEA]" />
            <span className="text-xs text-[#6F8C88] font-medium">or</span>
            <div className="flex-1 h-px bg-[#E8EEEA]" />
          </div>

          {/* Form */}
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
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 text-white font-semibold rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-md bg-[#2A4649] mt-1"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-sm text-[#6F8C88]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-[#2A4649] font-semibold hover:opacity-70 transition-opacity"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-xs text-[#6F8C88]">
          <Link href="/discover" className="hover:text-[#2A4649] transition-colors">
            ← Back to discover
          </Link>
        </p>

      </div>
    </div>
  );
}
