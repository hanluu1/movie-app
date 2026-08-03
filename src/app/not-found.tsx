import Link from 'next/link';
import { Header } from '@/components/layout';

export default function NotFound () {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
        <h2 className="font-archivo-black text-3xl text-red-600">404</h2>
        <p className="text-stone-500 text-sm">We couldn&apos;t find that page.</p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 rounded-lg font-bold text-sm text-white bg-gradient-to-br from-red-600 to-orange-600 shadow-[0_2px_8px_rgba(220,38,38,0.2)] transition-all duration-200 hover:-translate-y-px"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}
