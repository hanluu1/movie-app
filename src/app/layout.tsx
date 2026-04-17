import type { Metadata } from "next";
import { Geist, Geist_Mono, Anton_SC, Archivo_Black, DM_Sans } from "next/font/google";
import "./styles.css";

const anton = Anton_SC({ weight: '400', subsets: ['latin'], variable: '--font-anton' });
const archivoblack = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo-black' });
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
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${archivoblack.variable} ${dmSans.variable} antialiased`}

      >
        {children}
      </body>
    </html>
  );
}
