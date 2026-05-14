'use client';

import Link from 'next/link';
import { PencilSquareIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    Icon: PencilSquareIcon,
    title: 'Share What Moves You',
    desc: 'Write about movies that meant something to you. Not just "it was good" — but how it moved you. What stuck with you? What did it make you feel or remember?',
  },
  {
    Icon: UserGroupIcon,
    title: 'Find Your People',
    desc: "We connect you with others who loved or didn't love the same movies for similar reasons. When someone resonates with your perspective, you'll know.",
  },
  {
    Icon: SparklesIcon,
    title: 'Discover Together',
    desc: "See recommendations from people who actually get your taste. When they love something, there's a good chance you will too.",
  },
];

const examples = [
  {
    initials: 'MR',
    name: 'Marcus',
    role: 'Action enthusiast',
    movie: 'Shadow Warriors',
    text: 'As someone who grew up watching classic kung fu movies with my dad, this brought back so many memories. The fight choreography is incredible, but what surprised me most was the emotional depth. The final fight scene made me cry, not because of the action, but because of what it represented.',
    highlight: '✨ 18 people with similar taste connected with this',
  },
  {
    initials: 'SK',
    name: 'Sarah',
    role: 'Mystery lover',
    movie: 'Echoes of Tomorrow',
    text: "I'm obsessed with shows that trust their audience to piece things together, and this nails it. The non-linear storytelling might confuse some people, but I love puzzles. If you loved Dark or Severance, you'll appreciate how this show respects your intelligence.",
    highlight: '✨ 31 people found their taste match through this review',
  },
  {
    initials: 'HL',
    name: 'Han',
    role: 'Thriller fan',
    movie: 'The Midnight Archive',
    text: "This film hit me differently than I expected. The way it explores isolation reminded me of my own experiences during the pandemic. I loved how the director uses silence—there are these long, quiet moments that let you sit with the character's emotions.",
    highlight: '✨ 24 people resonated with this perspective',
  },
];

const valueProps = [
  { icon: '💭', title: 'Your Perspective Matters', desc: "This isn't about \"correct\" opinions. Share your unique take on films and find others who see movies the way you do." },
  { icon: '🤝', title: 'Real Connections', desc: "Connect with people through shared taste. When someone loves what you love for the same reasons, that's your movie soulmate." },
  { icon: '✨', title: 'Discover Your Way', desc: "Get recommendations from people who share your taste, not just what's trending." },
];


export default function LandingPage () {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-dm-sans bg-stone-50 text-stone-900 overflow-x-hidden">

      {/* Header */}
      <header className="fixed top-0 w-full px-8 py-6 flex justify-between items-center bg-stone-50/90 backdrop-blur-md border-b border-stone-200 z-50">
        <span className="font-archivo-black text-2xl tracking-tight bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent">
          REELEMOTIONS
        </span>
        <Link href="/login">
          <button className="bg-stone-900 text-white px-6 py-3 rounded-lg font-medium text-[0.95rem] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            Sign In
          </button>
        </Link>
      </header>

      {/* Hero */}
      <section className="min-h-screen pt-32 pb-16 px-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div
          className="absolute top-[-50%] right-[-20%] w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)', animation: 'float 20s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)', animation: 'float 15s ease-in-out infinite reverse' }}
        />

        <div className="max-w-4xl text-center relative z-10">
          <div
            className="inline-block px-4 py-2 mb-8 rounded-2xl text-sm font-semibold text-amber-800"
            style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', animation: 'slideDown 0.8s ease-out' }}
          >
            ✨ Find your movie tribe
          </div>

          <h1
            className="font-archivo-black leading-[1.1] mb-6 tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', animation: 'slideUp 0.8s ease-out 0.2s both' }}
          >
            Connect With People Who{' '}
            <span className="bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent">
              Get Your Taste
            </span>
          </h1>

          <p
            className="text-stone-600 mb-12 leading-relaxed"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', animation: 'slideUp 0.8s ease-out 0.4s both' }}
          >
            Find others who see films the way you do. Real people, real taste and {' '}
            <span className="whitespace-nowrap">beyond ratings.</span>
          </p>

          <div
            className="flex gap-4 justify-center flex-wrap"
            style={{ animation: 'slideUp 0.8s ease-out 0.6s both' }}
          >
            <Link href="/login" className="w-full sm:w-auto">
              <button
                className="w-full sm:w-auto text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}
              >
                Find Your Crowd
              </button>
            </Link>
            <button
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto bg-white text-stone-900 border-2 border-stone-200 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-red-600 hover:text-red-600 hover:-translate-y-0.5"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-archivo-black text-center mb-10 tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Built for genuine film lovers
          </h2>
          <div className="grid gap-12" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {steps.map(({ Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div
                  className="rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
                >
                  <Icon className="w-7 h-7" style={{ color: '#DC2626' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{title}</h3>
                <p className="text-stone-600 leading-relaxed text-[1.05rem]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Perspectives */}
      <section className="py-24 px-8 bg-stone-50">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-archivo-black text-center mb-4 tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Real perspectives, real connections
          </h2>
          <p className="text-center text-xl text-stone-600 mb-12 leading-relaxed">See how people share what movies mean to them</p>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {examples.map(({ initials, name, role, movie, text, highlight }) => (
              <div
                key={name}
                className="bg-white rounded-2xl p-8 border border-stone-200 transition-all duration-300 hover:shadow-xl hover:border-red-600"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)' }}
                  >
                    {initials}
                  </div>
                  <div>
                    <div className="font-bold">{name}</div>
                    <div className="text-sm text-stone-500">{role}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-red-600 mb-3">{movie}</div>
                <p className="text-stone-600 leading-relaxed italic mb-4">{text}</p>
                <div
                  className="px-4 py-3 rounded-lg text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)', color: '#7C2D12' }}
                >
                  {highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1C1917, #292524)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #DC2626, transparent)' }} />
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-archivo-black text-white text-center mb-4 tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Why join ReelEmotions?
          </h2>
          <p className="text-center text-xl text-stone-400 mb-12 leading-relaxed">A different kind of movie community</p>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {valueProps.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-10 rounded-2xl border transition-all duration-300 hover:-translate-y-1 text-center"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(220,38,38,0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-stone-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-8 text-center" style={{ background: 'linear-gradient(180deg, #FAFAF9 0%, white 100%)' }}>
        <h2 className="font-archivo-black mb-6 tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Find your movie tribe today
        </h2>
        <p className="text-xl text-stone-600 mb-10 max-w-xl mx-auto leading-relaxed">
          Join people who experience movies the way you do. Share your taste, make connections, discover together.
        </p>
        <Link href="/login">
          <button
            className="text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}
          >
            Start Connecting
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 text-center" style={{ background: '#1C1917' }}>
        <span className="font-archivo-black text-2xl bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent">
          REELEMOTIONS
        </span>
        <p className="text-stone-400 mt-4">© 2026 ReelEmotions. Connect through cinema.</p>
      </footer>

    </div>
  );
}
