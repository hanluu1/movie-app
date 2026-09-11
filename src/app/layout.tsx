import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono, Archivo_Black, Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./styles.css";

const archivoblack = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo-black' });
const plusJakarta = Plus_Jakarta_Sans({ weight: ['700', '800'], subsets: ['latin'], variable: '--font-plus-jakarta' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReelEmotions",
  description: "Discover, Share, and Relive Your Movie Moments with ReelEmotions",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${archivoblack.variable} ${plusJakarta.variable} ${dmSans.variable} antialiased`}

      >
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
