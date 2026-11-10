'use client';

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppShell } from '@/components/layout';
import { BRAND_COLOR, FEELING_LIST, getFeeling } from '@/lib/moods';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CameraIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { PostCard } from '@/features/posts';

type Post = {
  id: string;
  title: string;
  content: string;
  movie_title: string | null;
  movie_image: string | null;
  movie_id: number | null;
  media_type: string | null;
  mood?: string[] | null;
  upvotes: number;
  created_at: string;
  comment_count?: number;
};

type Profile = {
  id: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
};


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
  const [loaded, setLoaded] = useState(false);
  const [feelingFilter, setFeelingFilter] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, created_at, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }

    const { data: postData } = await supabase
      .from('posts')
      .select(
        'id, title, content, movie_title, movie_image, movie_id, media_type, mood, upvotes, created_at, comments(count)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (postData) {
      setPosts(
        postData.map((p) => ({
          ...p,
          comment_count:
            (p.comments as unknown as { count: number }[])?.[0]?.count ?? 0,
        }))
      );

      setTotalReactions(
        postData.reduce((sum, p) => sum + (p.upvotes ?? 0), 0)
      );
    }

    setLoaded(true);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !profile) return;

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(path);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: publicUrl } : prev
      );
    } finally {
      setUploading(false);
    }
  };

  const memberYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;

  const { counts, tagged, top } = useMemo(() => {
    const c: Record<string, number> = {};
    let t = 0;

    for (const p of posts) {
      const f = getFeeling(p.mood?.[0]);

      if (!f) continue;
      c[f.key] = (c[f.key] ?? 0) + 1;
      t += 1;
    }

    const best = FEELING_LIST.reduce<(typeof FEELING_LIST)[number] | null>(
      (acc, f) => ((c[f.key] ?? 0) > (acc ? c[acc.key] ?? 0 : 0) ? f : acc),
    null
    );

    return { counts: c, tagged: t, top: best };
  }, [posts]);

  const visiblePosts = feelingFilter
    ? posts.filter((p) => getFeeling(p.mood?.[0])?.key === feelingFilter)
    : posts;

  const glow = top?.color ?? BRAND_COLOR;

  return (
    <AppShell width="feed" glowColor={glow} onPostCreated={load}>
      {/* Profile header */}
      <section className="flex flex-col items-center text-center">
        <div className="group relative">
          <div
            className="rounded-full p-[3px]"
            style={{
              background: 'linear-gradient(135deg,#FFD83D,#F5A623 60%,#FF5A36)',
              boxShadow: `0 0 48px ${glow}55`,
            }}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile photo"
              className="press relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#0D0A08] bg-[#1c1612] font-plus-jakarta text-3xl font-extrabold text-[#EEEAE2] sm:h-32 sm:w-32"
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              ) : (
                profile ? getInitials(profile.username) : ''
              )}

              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <CameraIcon className="h-7 w-7 text-white" />
              </span>
            </button>
          </div>

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#F5A623] border-t-transparent motion-reduce:animate-none" />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <h1 className="mt-4 font-plus-jakarta text-3xl font-extrabold leading-tight sm:text-4xl">
          {profile?.username ?? <span className="skeleton inline-block h-9 w-40 rounded-full align-middle" />}
        </h1>

        <p className="mt-1 text-sm text-[#B8AA98]">
          {profile ? `@${profile.username}` : ''}
          {memberYear ? ` · yapping since ${memberYear}` : ''}
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="press mt-4 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2 text-sm font-bold text-[#EEEAE2] backdrop-blur-md transition-colors hover:border-[#F5A623]/60 hover:bg-white/[0.08] disabled:opacity-60"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit profile photo
        </button>

        {/* Stats */}
        <div className="mt-6 grid w-full grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-2 py-3 backdrop-blur-md">
            <p className="font-plus-jakarta text-2xl font-extrabold text-[#F5A623]">{posts.length}</p>
            <p className="mt-0.5 text-xs text-[#B8AA98]">{posts.length === 1 ? 'yap' : 'yaps'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-2 py-3 backdrop-blur-md">
            <p className="font-plus-jakarta text-2xl font-extrabold text-[#F5A623]">{totalReactions}</p>
            <p className="mt-0.5 text-xs text-[#B8AA98]">likes received</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-2 py-3 backdrop-blur-md">
            <p className="font-plus-jakarta text-2xl font-extrabold" style={{ color: top?.color ?? '#EEEAE2' }}>
              {top ? top.emoji : '—'}
            </p>
            <p className="mt-0.5 text-xs text-[#B8AA98]">{top ? `top: ${top.label}` : 'top feeling'}</p>
          </div>
        </div>
      </section>

      {/* Feeling fingerprint */}
      {tagged > 0 && (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#B8AA98]">
            Your feeling fingerprint
          </p>

          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
            role="img"
            aria-label={FEELING_LIST.filter((f) => counts[f.key])
              .map((f) => `${f.label} ${counts[f.key]}`)
              .join(', ')}
          >
            {FEELING_LIST.filter((f) => counts[f.key]).map((f) => (
              <div
                key={f.key}
                style={{ width: `${(counts[f.key] / tagged) * 100}%`, background: f.color }}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {FEELING_LIST.filter((f) => counts[f.key]).map((f) => (
              <span
                key={f.key}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{ background: `${f.color}22`, color: f.color }}
              >
                {f.emoji} {f.label} {counts[f.key]}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="mt-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#EEEAE2] bg-[#EEEAE2] px-3.5 py-1.5 text-xs font-bold text-[#0D0A08]">
            My yaps
          </span>

          {FEELING_LIST.filter((f) => counts[f.key]).map((f) => {
            const on = feelingFilter === f.key;

            return (
              <button
                key={f.key}
                onClick={() => setFeelingFilter(on ? null : f.key)}
                aria-pressed={on}
                className="press rounded-full border px-3 py-1.5 text-xs font-bold transition-all"
                style={
                  on
                    ? { background: `${f.color}33`, borderColor: f.color, color: f.color }
                    : { borderColor: 'rgba(255,255,255,0.15)', color: '#B8AA98' }
                }
              >
                {f.emoji} {f.label}
              </button>
            );
          })}
        </div>

        {!loaded ? (
          <div className="flex flex-col gap-4">
            <div className="skeleton h-40 rounded-3xl" />
            <div className="skeleton h-40 rounded-3xl" />
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center backdrop-blur-md">
            <p className="font-plus-jakarta text-lg font-extrabold text-[#EEEAE2]">
              No yaps yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#B8AA98]">
              When something you watch stays with you, this is where your
              feelings will live.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                username={profile?.username}
                avatarUrl={profile?.avatar_url}
                movieTitle={post.movie_title}
                movieImage={post.movie_image}
                movieId={post.movie_id}
                mediaType={post.media_type}
                mood={post.mood}
                postTitle={post.title}
                postContent={post.content}
                createdAt={post.created_at}
                upvotes={post.upvotes}
                commentCount={post.comment_count ?? 0}
                canLike={false}
                hideAvatar
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
