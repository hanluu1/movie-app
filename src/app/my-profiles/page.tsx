'use client';

import { supabase } from '@/lib/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/layout';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
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
          'id, title, content, movie_title, movie_image, movie_id, media_type, upvotes, created_at, comments(count)'
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
    };

    init();
  }, [router]);

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

  return (
    <div className="font-dm-sans flex min-h-screen w-full flex-col bg-[#161210] text-[#EEEAE2]">
      <Header variant="dark" showSearch={true} />

      <main className="mx-auto w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl flex flex-col px-6 lg:px-10 py-12">

        {/* Profile Header */}
        <section className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          <div className="flex items-start gap-7">

            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#272320] text-3xl font-bold text-[#EEEAE2] shadow-sm transition hover:shadow-md md:h-32 md:w-32"
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

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <CameraIcon className="h-7 w-7 text-white" />
                </div>
              </button>

              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#C8956A] border-t-transparent" />
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

            {/* Profile Info */}
            <div className="min-w-0 pt-1">
              <h1 className="font-plus-jakarta text-3xl font-extrabold tracking-tight text-[#EEEAE2]">
                {profile?.username ?? '—'}
              </h1>

              <p className="mt-2 text-base text-[#8C7E6E]">
                @{profile?.username ?? '—'}
                {memberYear ? ` · Member since ${memberYear}` : ''}
              </p>

              {/* Stats */}
              <div className="mt-7 flex items-center gap-8">
                <div>
                  <p className="font-plus-jakarta text-2xl font-extrabold text-[#C8956A]">
                    {posts.length}
                  </p>
                  <p className="mt-1 text-sm text-[#8C7E6E]">
                    {posts.length === 1 ? 'post' : 'posts'}
                  </p>
                </div>

                <div className="h-12 w-px bg-[#272320]" />

                <div>
                  <p className="font-plus-jakarta text-2xl font-extrabold text-[#C8956A]">
                    {totalReactions}
                  </p>
                  <p className="mt-1 text-sm text-[#8C7E6E]">
                    reactions received
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Action */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-fit items-center gap-2 rounded-full bg-[#1A1714] border border-[#272320] px-5 py-3 text-sm font-semibold text-[#C8B8A2] transition-colors hover:bg-[#272320] hover:text-[#EEEAE2]"
          >
            <PencilSquareIcon className="h-4 w-4" />
            Change photo
          </button>
        </section>

        {/* Divider */}
        <div className="mt-14 border-t border-[#272320]" />

        {/* Recent Reactions */}
        <section className="mt-8">
          <h2 className="font-plus-jakarta text-2xl font-extrabold text-[#EEEAE2]">
            Recent reactions
          </h2>

          {posts.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-[#272320] bg-[#111009] px-6 py-16 text-center">
              <p className="font-plus-jakarta text-lg font-bold text-[#EEEAE2]">
                No reactions yet
              </p>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#8C7E6E]">
                When something you watch stays with you, this is where your
                feelings will live.
              </p>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={profile?.username}
                  avatarUrl={profile?.avatar_url}
                  movieTitle={post.movie_title}
                  movieImage={post.movie_image}
                  movieId={post.movie_id}
                  mediaType={post.media_type}
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
      </main>
    </div>
  );
}
