import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/w500/**', // Match the specific path for TMDB images
      },
      {
        protocol: 'https',
        hostname: 'about.netflix.com',
        port: '',
        pathname: '/**', // Allow all paths under about.netflix.com
      },
      {
        protocol: 'https',
        hostname: 'awbhkclqydtvwbtbirhv.supabase.co',
        pathname: '/storage/v1/object/public/post-images/**',
      },
    ],
  },
  
};

export default nextConfig;
