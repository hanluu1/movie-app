'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import GoogleIcon from '@/components/icons/GoogleIcon';
import FormField from '@/components/ui/FormField';


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
        router.push('/');
      }
    });
    return () => { listener.subscription.unsubscribe(); };
  }, [router]);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); return; }
    if (!data.user) { setError('User not found'); return; }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    if (profileError) { console.error('Profile fetch error:', profileError.message); return; }
    if (!profileData) {
      const { error: insertError } = await supabase.from('profiles').insert([{ id: data.user.id, username }]);
      if (insertError) { console.error('Profile insert error:', insertError.message); }
    }
  };

  const handleSignup = async () => {
    if (!username.trim()) { setError('Username is required.'); return; }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); return; }
    alert('Signup successful!');
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
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const switchMode = () => { setIsLogin(prev => !prev); setError(''); };

  return (
    <div
      className="font-dm-sans min-h-screen flex items-center justify-center p-8 bg-stone-50"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[480px] overflow-hidden"
        style={{ boxShadow: '0 24px 48px rgba(28,25,23,0.12)' }}
      >

        {/* Header */}
        {isLogin ? (
          <div
            className="px-6 sm:px-12 pt-12 pb-8 text-center"
            style={{ background: 'linear-gradient(135deg, #1C1917, #292524)' }}
          >
            <div className="font-archivo-black text-[1.75rem] tracking-tight bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
              REELEMOTIONS
            </div>
            <h1 className="font-archivo-black text-[1.75rem] text-white mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-stone-400 text-[0.95rem]">Sign in to your account</p>
          </div>
        ) : (
          <div
            className="px-6 sm:px-12 pt-12 pb-8 text-center"
            style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
          >
            <div className="font-archivo-black text-[1.75rem] tracking-tight bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
              REELEMOTIONS
            </div>
            <h1 className="font-archivo-black text-[1.75rem] tracking-tight mb-2" style={{ color: '#7C2D12' }}>
              Become a Founding Member
            </h1>
            <p className="text-[0.95rem]" style={{ color: '#92400E' }}>Join early and influence other users</p>
          </div>
        )}

        {/* Body */}
        <div className="px-6 sm:px-12 pt-10 pb-12">

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              hint={!isLogin ? 'At least 8 characters' : undefined}
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-4 text-white font-bold rounded-xl text-[1rem] transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative text-center my-6 text-[0.85rem] text-stone-500">
            <div className="absolute top-1/2 left-0 w-[40%] h-px bg-stone-200" />
            <span className="relative bg-white px-2">or continue with</span>
            <div className="absolute top-1/2 right-0 w-[40%] h-px bg-stone-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-[0.875rem] border-2 border-stone-200 bg-white rounded-xl font-semibold text-[0.9rem] transition-all duration-300 hover:border-red-600 hover:bg-stone-50 flex items-center justify-center gap-2"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>

          {/* Toggle */}
          <p className="text-center mt-6 text-[0.9rem] text-stone-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={switchMode}
              className="text-red-600 font-semibold hover:text-orange-600 transition-colors duration-300"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
