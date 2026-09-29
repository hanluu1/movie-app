'use client';

import { useRef, useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostResult {
  id: string;
  title: string;
  movie_title: string | null;
  username: string | null;
}

interface UserResult {
  id: string;
  username: string;
}

interface Props {
  variant?: 'floating' | 'inline';
  dark?: boolean;
  onSelect?: () => void;
  excludeRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  resultsClassName?: string;
  autoFocus?: boolean;
}

export function AppSearch ({ variant = 'floating', dark = false, onSelect, excludeRef, className, resultsClassName, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) { setPosts([]); setUsers([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      const term = `%${query.trim()}%`;
      const [postsRes, usersRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id, title, movie_title, profiles(username)')
          .or(`title.ilike.${term},movie_title.ilike.${term}`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', term)
          .limit(3),
      ]);
      const rawPosts = (postsRes.data ?? []) as { id: string; title: string; movie_title: string | null; profiles: { username: string } | { username: string }[] | null }[];
      setPosts(rawPosts.map(p => ({
        id: p.id,
        title: p.title,
        movie_title: p.movie_title,
        username: Array.isArray(p.profiles) ? (p.profiles[0]?.username ?? null) : (p.profiles?.username ?? null),
      })));
      setUsers((usersRes.data as UserResult[]) ?? []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (variant !== 'floating') return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !excludeRef?.current?.contains(e.target as Node)
      ) {
        setQuery(''); setPosts([]); setUsers([]); setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [variant, excludeRef]);

  const clear = () => {
    setQuery(''); setPosts([]); setUsers([]); setOpen(false);
    onSelect?.();
  };

  const hasResults = posts.length > 0 || users.length > 0;

  const inputClass = dark
    ? 'w-full pl-9 pr-4 py-2 border border-[#2A2520] rounded-full text-sm text-[#F2EDE4] bg-[#1A1714] transition-all focus:outline-none focus:border-[#C8956A]/50 placeholder:text-[#887a6e]'
    : variant === 'floating'
      ? 'w-full pl-9 pr-4 py-2 border border-[#E8EEEA] rounded-full text-sm text-[#172526] bg-white transition-all focus:outline-none focus:border-[#2A4649] focus:ring-2 focus:ring-[#2A4649]/10 placeholder:text-[#6F8C88]'
      : 'w-full pl-9 pr-4 py-2.5 border border-[#E8EEEA] rounded-full text-sm text-[#172526] bg-[#F9F6EF] transition-all focus:outline-none focus:border-[#2A4649] focus:ring-2 focus:ring-[#2A4649]/10 placeholder:text-[#6F8C88]';

  return (
    <div ref={containerRef} className={`${className ?? ''}`}>
      <div className="relative">
        <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${dark ? 'text-[#887a6e]' : 'text-[#6F8C88]'}`} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search a movie, feeling, or person..."
          autoFocus={autoFocus}
          className={inputClass}
          onKeyDown={e => {
            if (e.key === 'Escape') clear();
            if (e.key === 'Enter' && query.trim()) {
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              clear();
            }
          }}
        />
      </div>

      {open && hasResults && (
        <div className={variant === 'floating'
          ? `absolute top-full mt-2 left-0 right-0 rounded-2xl shadow-lg overflow-hidden z-50 border ${dark ? 'bg-[#111009] border-[#2A2520]' : 'bg-[#FFFDF8] border-[#E8EEEA]'}`
          : `mt-2 rounded-2xl shadow-lg overflow-hidden border ${dark ? 'bg-[#111009] border-[#2A2520]' : 'bg-[#FFFDF8] border-[#E8EEEA]'} ${resultsClassName ?? ''}`
        }>

          {posts.length > 0 && (
            <div>
              <p className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`}>Reactions</p>
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  onClick={clear}
                  className={`flex flex-col px-4 py-2.5 transition-colors ${dark ? 'hover:bg-[#1A1714]' : 'hover:bg-[#EEF2ED]'}`}
                >
                  <span className={`text-sm font-semibold line-clamp-1 ${dark ? 'text-[#F2EDE4]' : 'text-[#172526]'}`}>{post.title}</span>
                  <span className={`text-xs mt-0.5 ${dark ? 'text-[#6A5E50]' : 'text-[#6F8C88]'}`}>
                    {post.username && `by ${post.username}`}
                    {post.movie_title && ` · ${post.movie_title}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {users.length > 0 && (
            <div className={posts.length > 0 ? `border-t ${dark ? 'border-[#2A2520]' : 'border-[#E8EEEA]'}` : ''}>
              <p className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-[#4A4038]' : 'text-[#6F8C88]'}`}>People</p>
              {users.map(user => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  onClick={clear}
                  className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors ${dark ? 'hover:bg-[#1A1714]' : 'hover:bg-[#EEF2ED]'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#2A4649] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm font-semibold ${dark ? 'text-[#F2EDE4]' : 'text-[#172526]'}`}>@{user.username}</span>
                </Link>
              ))}
            </div>
          )}

          <div className={`px-4 py-2.5 border-t ${dark ? 'border-[#2A2520]' : 'border-[#E8EEEA]'}`}>
            <button
              onClick={() => { router.push(`/search?q=${encodeURIComponent(query.trim())}`); clear(); }}
              className={`text-xs font-semibold hover:opacity-70 transition-opacity ${dark ? 'text-[#C8956A]' : 'text-[#2A4649]'}`}
            >
              See all reactions for &ldquo;{query}&rdquo; →
            </button>
          </div>

        </div>
      )}

      {open && !hasResults && query.trim() && (
        <div className={variant === 'floating'
          ? `absolute top-full mt-2 left-0 right-0 rounded-2xl shadow-lg z-50 px-4 py-4 border ${dark ? 'bg-[#111009] border-[#2A2520]' : 'bg-[#FFFDF8] border-[#E8EEEA]'}`
          : `mt-2 rounded-2xl shadow-lg px-4 py-4 border ${dark ? 'bg-[#111009] border-[#2A2520]' : 'bg-[#FFFDF8] border-[#E8EEEA]'} ${resultsClassName ?? ''}`
        }>
          <p className={`text-sm ${dark ? 'text-[#6A5E50]' : 'text-[#6F8C88]'}`}>No reactions found for &ldquo;{query}&rdquo; — be the first to write one.</p>
        </div>
      )}
    </div>
  );
}
