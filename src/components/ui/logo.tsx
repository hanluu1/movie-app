import Link from 'next/link';

interface LogoProps {
  // Size/colour for the "Reel" half comes from the caller; the "Emotion" accent is always the violet-to-pink gradient
  className?: string;
  shimmer?: boolean;
  // Render a plain span when the logo sits inside another link
  asLink?: boolean;
}

export function Logo ({ className = 'text-xl sm:text-2xl', shimmer = false, asLink = true }: LogoProps) {
  const classes = `logo-link font-plus-jakarta font-extrabold tracking-tight text-[#F1EEFF] ${className}`;
  const content = (
    <>
      Reel<span className={shimmer ? 'shimmer-text' : 'gradient-text'}>Emotion</span>
    </>
  );

  return asLink
    ? <Link href="/" className={classes}>{content}</Link>
    : <span className={classes}>{content}</span>;
}
