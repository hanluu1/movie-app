'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

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

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);
  const handleLogin = async () => {
    const{ data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    }
    if (!data.user) {
      setError('User not found');
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .maybeSingle();
    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      return;
    }
    if (!profileData) {
      const { error: insertError } = await supabase.from('profiles').insert([
        { id: data.user?.id, username },
      ]);
      if (insertError) {
        console.error('Profile insert error:', insertError.message);
      }
    }

  };
  const handleSignup = async () => {
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      return;
    }

    alert('Signup successful!');
    setIsLogin(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      await handleLogin();
    } else {
      await handleSignup();
    }
  };

  
  return (
    <div className="flex flex-col gap-5 min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 items-center justify-center sm:flex-row sm:gap-20">    
      <div className="flex flex-col gap-2 items-center mb-8">
        <div className=" text-4xl text-gray-300 font-sans mb-1 sm:text-5xl">
          Welcome to
        </div>
        <div className="font-logo text-3xl tracking-tight text-white leading-none sm:text-4xl">
          ReelEmotions
        </div>
      </div>
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <div className='flex items-center justify-center text-white text-2xl mb-3'>
          Please {isLogin ? 'Log In to continue' : 'Sign Up'} 
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isLogin && (
            <input
              className="bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
          )}
          <input
            className="bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="bg-gray-800 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className=" bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        <p className="mt-6 text-sm text-gray-400 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-blue-400 hover:underline ml-1"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
