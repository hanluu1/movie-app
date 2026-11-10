'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, FilmIcon, UserIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Header } from './header';
import { BottomTabBar } from './bottom-tab-bar';
import { CreatePostModal } from '@/features/posts/modals/new-post-modal';
import { SignInPrompt } from '@/components/ui/sign-in-prompt';
import { useAuthUser } from '@/hooks/use-auth-user';
import { supabase } from '@/lib/supabase/client';
import { BRAND_COLOR } from '@/lib/moods';

interface ShellProfile {
  username: string;
  avatar_url: string | null;
}

interface ShellContextValue {
  user: ReturnType<typeof useAuthUser>['user'];
  profile: ShellProfile | null;
  // Opens the composer, or the sign-in prompt for signed-out users
  openComposer: () => void;
  // Returns true when signed in; otherwise shows the sign-in prompt for `action`
  requireAuth: (action: string) => boolean;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell () {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <AppShell>');
  return ctx;
}

interface AppShellProps {
  children: ReactNode;
  // Sticky panel shown to the right of the content on xl screens
  rightRail?: ReactNode;
  // `feed` keeps a centred ~620px column; `wide` lets content (poster grids etc.) use the full width
  width?: 'feed' | 'wide';
  // Tints the ambient background glow (e.g. the selected feeling)
  glowColor?: string;
  onPostCreated?: () => void;
  // When set, the mobile Mood tab runs this instead of linking to Discover
  onMood?: () => void;
  moodActive?: boolean;
}

const NAV_ITEMS = [
  { href: '/community', label: 'Yap feed', Icon: HomeIcon },
  { href: '/discover', label: 'Discover', Icon: FilmIcon },
  { href: '/my-profiles', label: 'My profile', Icon: UserIcon },
];

export function AppShell ({
  children,
  rightRail,
  width = 'feed',
  glowColor = BRAND_COLOR,
  onPostCreated,
  onMood,
  moodActive,
}: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuthUser();
  const [profile, setProfile] = useState<ShellProfile | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [authPromptAction, setAuthPromptAction] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  const requireAuth = (action: string) => {
    if (user) return true;
    setAuthPromptAction(action);
    return false;
  };

  const openComposer = () => {
    if (requireAuth('share your take')) setShowComposer(true);
  };

  const gridCols = width === 'feed'
    ? `lg:grid-cols-[220px_minmax(0,620px)] lg:justify-center ${rightRail ? 'xl:grid-cols-[240px_minmax(0,620px)_300px]' : ''}`
    : `lg:grid-cols-[220px_minmax(0,1fr)] ${rightRail ? 'xl:grid-cols-[240px_minmax(0,1fr)_300px]' : ''}`;

  return (
    <ShellContext.Provider value={{ user, profile, openComposer, requireAuth }}>
      <div className="relative min-h-screen bg-[#0D0A08] font-dm-sans text-[#EEEAE2]">

        {/* Ambient mesh glow */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full opacity-20 blur-[120px] transition-colors duration-700"
            style={{ background: glowColor }}
          />
          <div className="absolute -bottom-48 -right-32 h-[520px] w-[520px] rounded-full bg-[#9B6BFF] opacity-10 blur-[140px]" />
          <div className="absolute right-1/4 top-1/3 h-[360px] w-[360px] rounded-full bg-[#FF4D9D] opacity-[0.06] blur-[120px]" />
        </div>
        <div aria-hidden className="film-grain pointer-events-none fixed inset-0 z-[1]" />

        <Header variant="dark" />

        <div className={`relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-6 px-4 pb-28 pt-6 lg:pb-16 ${gridCols}`}>

          {/* Left rail */}
          <aside className="sticky top-24 hidden self-start lg:block">
            <nav aria-label="Sections" className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`press flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${
                      active ? 'bg-white/10 text-white' : 'text-[#B8AA98] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" style={active ? { color: BRAND_COLOR } : undefined} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={openComposer}
              className="press mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-[#0D0A08]"
              style={{
                background: 'linear-gradient(135deg, #FFD83D, #F5A623 60%, #FF5A36)',
                boxShadow: '0 0 24px rgba(245,166,35,0.35)',
              }}
            >
              <PlusIcon className="h-4 w-4" strokeWidth={3} />
              New yap
            </button>
          </aside>

          <main className="min-w-0">{children}</main>

          {rightRail && <aside className="sticky top-24 hidden self-start xl:block">{rightRail}</aside>}
        </div>

        <BottomTabBar onYap={openComposer} onMood={onMood} moodActive={moodActive} />

        <CreatePostModal
          isOpen={showComposer}
          onClose={() => setShowComposer(false)}
          onCreated={() => {
            setShowComposer(false);
            onPostCreated?.();
          }}
        />

        <SignInPrompt
          isOpen={authPromptAction !== null}
          onClose={() => setAuthPromptAction(null)}
          action={authPromptAction ?? undefined}
        />
      </div>
    </ShellContext.Provider>
  );
}
