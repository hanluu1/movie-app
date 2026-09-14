'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CameraIcon } from '@heroicons/react/24/outline';

type Post = {
  id: string;
  title: string;
  content: string;
  movie_title: string | null;
  movie_image: string | null;
  upvotes: number;
  created_at: string;
};

type Profile = {
  id: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
};

function formatDate (iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials (username: string) {
  const parts = username.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : username.slice(0, 2).toUpperCase();
}

export default function MyProfilePage () {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalReactions, setTotalReactions] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, created_at, avatar_url')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      const { data: postData } = await supabase
        .from('posts')
        .select('id, title, content, movie_title, movie_image, upvotes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (postData) {
        setPosts(postData);
        setTotalReactions(postData.reduce((sum, p) => sum + (p.upvotes ?? 0), 0));
      }
    };
    init();
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) { console.error(uploadError); return; }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
    } finally {
      setUploading(false);
    }
  };

  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;

  return (
    <div className="font-dm-sans flex flex-col min-h-screen w-full bg-[#FAF7F1] text-[#172526]">
      <Header showSearch={true} />

      <div className="flex flex-col w-full max-w-5xl mx-auto px-7 py-7">

        {/* Profile section */}
        <div className="flex items-center gap-6 mb-10">

          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-[#2A4649] font-bold text-2xl text-white relative"
              disabled={uploading}
            >
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" sizes="80px" />
              ) : (
                profile ? getInitials(profile.username) : ''
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
            </button>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div>
            <h2 className="font-plus-jakarta font-extrabold text-2xl text-[#172526]">{profile?.username ?? '—'}</h2>
            <p className="text-sm text-[#6F8C88] mt-1">
              @{profile?.username ?? '—'}{memberYear ? ` · Member since ${memberYear}` : ''}
            </p>
            <div className="flex gap-8 mt-3">
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-[#2A4649]">{posts.length}</span>
                <span className="text-xs text-[#6F8C88] mt-0.5">posts</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-xl text-[#2A4649]">{totalReactions}</span>
                <span className="text-xs text-[#6F8C88] mt-0.5">reactions received</span>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-10 text-[#6F8C88] text-sm">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-[#FFFDF8] border border-[#E8EEEA] rounded-2xl p-5 hover:border-[#2A4649]/30 transition-colors cursor-pointer flex flex-col"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                <div className="flex gap-4 mb-4">
                  <div className="relative w-[56px] h-[84px] rounded-lg overflow-hidden bg-[#EEF2ED] border border-[#E8EEEA] flex-shrink-0">
                    {post.movie_image && (
                      <Image src={post.movie_image} alt={post.movie_title ?? ''} fill className="object-cover" sizes="56px" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base text-[#172526] leading-snug line-clamp-2">{post.movie_title}</div>
                    <div className="text-sm text-[#6F8C88] mt-1">{formatDate(post.created_at)}</div>
                  </div>
                </div>
                <div className="font-plus-jakarta font-extrabold text-lg text-[#172526] mb-2 leading-snug">{post.title}</div>
                <p className="text-sm text-[#3F5E5A] leading-relaxed line-clamp-3 flex-1">{post.content}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E8EEEA]">
                  <span className="text-xs text-[#6F8C88]">{post.upvotes} felt the same</span>
                  <span className="text-sm text-[#2A4649] font-semibold">Read more →</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
