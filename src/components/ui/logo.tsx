import Link from 'next/link';

interface LogoProps {
  // Size/colour for the "Reel" half comes from the caller; the "Emotion" accent is always brand amber
  className?: string;
  shimmer?: boolean;
  // Render a plain span when the logo sits inside another link
  asLink?: boolean;
}

export function Logo ({ className = 'text-xl sm:text-2xl', shimmer = false, asLink = true }: LogoProps) {
  const classes = `font-plus-jakarta font-extrabold tracking-tight text-[#EEEAE2] ${className}`;
  const content = (
    <>
      Reel<span className={shimmer ? 'shimmer-text' : 'text-[#F5A623]'}>Emotion</span>
    </>
  );

  return asLink
    ? <Link href="/" className={classes}>{content}</Link>
    : <span className={classes}>{content}</span>;
}
