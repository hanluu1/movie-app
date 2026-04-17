'use client';

import Link from 'next/link';

const features = [
  { icon: '🎬', title: 'Your Voice Matters', desc: 'Every review counts. Share your perspective without getting lost in a sea of content.' },
  { icon: '🔥', title: 'Real-Time Updates', desc: 'See what others are watching right now. Your reviews sync across all devices instantly.' },
  { icon: '🎯', title: 'Clean & Fast', desc: 'No ads, no distractions. Just a beautiful interface focused on movies and meaningful conversations.' },
  { icon: '💬', title: 'Build Together', desc: 'Help shape this community from day one. Your feedback directly influences what we build.' },
  { icon: '📱', title: 'Works Everywhere', desc: 'Beautiful on desktop, perfect on mobile. Take your movie journal wherever you go.' },
  { icon: '⚡', title: 'Privacy First', desc: "Your data is yours. No tracking, no selling your information. Just movies." },
];

const valueProps = [
  { icon: '🚀', title: 'Fresh Start', desc: "No legacy baggage. We're building exactly what movie lovers need, nothing more." },
  { icon: '⚡', title: 'No Ads, Ever', desc: "Your attention isn't for sale. We're building a sustainable platform, not a billboard." },
  { icon: '🎨', title: 'You Shape It', desc: 'Early members directly influence features. This is your platform as much as ours.' },
];


export default function LandingPage () {
  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
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
            ✨ New platform launching
          </div>

          <h1
            className="font-archivo-black leading-[1.1] mb-6 tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', animation: 'slideUp 0.8s ease-out 0.2s both' }}
          >
            Share Your{' '}
            <span className="bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent">
              Movie Moments
            </span>
            {' '}That Matter
          </h1>

          <p
            className="text-stone-600 mb-12 leading-relaxed"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', animation: 'slideUp 0.8s ease-out 0.4s both' }}
          >
            A fresh space for genuine movie discussions. No algorithms, no clutter. Just you and fellow film lovers.
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
                Be an Early Member
              </button>
            </Link>
            <button
              onClick={scrollToFeatures}
              className="w-full sm:w-auto bg-white text-stone-900 border-2 border-stone-200 px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:border-red-600 hover:text-red-600 hover:-translate-y-0.5"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-8 max-w-7xl mx-auto">
        <h2
          className="font-archivo-black text-center mb-16 tracking-tight"
          style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
        >
          Built for genuine movie lovers
        </h2>
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {features.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white p-10 rounded-2xl border border-stone-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(28,25,23,0.1)] hover:border-red-600"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-4xl mb-6"
                style={{ background: 'linear-gradient(135deg, #FEE2E2, #FED7AA)' }}
              >
                {icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{title}</h3>
              <p className="text-stone-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1C1917, #292524)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #DC2626, transparent)' }} />
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="font-archivo-black text-white mb-6 tracking-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
          >
            Why ReelEmotions?
          </h2>
          <p className="text-xl text-stone-400 mb-12 leading-relaxed">Built different from the ground up</p>
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {valueProps.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
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
          Ready to be part of this?
        </h2>
        <p className="text-xl text-stone-600 mb-10 max-w-xl mx-auto">
          Join as a founding member and help build the movie community you&apos;ve always wanted.
        </p>
        <Link href="/login">
          <button
            className="text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EA580C)', boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}
          >
            Sign up now
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 text-center" style={{ background: '#1C1917' }}>
        <span className="font-archivo-black text-2xl bg-gradient-to-br from-red-600 to-orange-600 bg-clip-text text-transparent">
          REELEMOTIONS
        </span>
        <p className="text-stone-400 mt-4">© 2026 ReelEmotions. Share your movie moments.</p>
      </footer>

    </div>
  );
}
