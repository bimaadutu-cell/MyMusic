import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MyMusik - Streaming Musik Modern",
  description: "Streaming Musik Modern by BimzOfficial. Dengarkan musik favoritmu dengan kualitas terbaik.",
  keywords: ["musik", "streaming", "lagu", "mp3", "online", "mymusik", "bimzofficial"],
  authors: [{ name: "BimzOfficial" }],
  creator: "BimzOfficial",
  publisher: "BimzOfficial",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyMusik",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://mymusik.app",
    title: "MyMusik - Streaming Musik Modern",
    description: "Streaming Musik Modern by BimzOfficial",
    siteName: "MyMusik",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyMusik - Streaming Musik Modern",
    description: "Streaming Musik Modern by BimzOfficial",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00FF88",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="MyMusik" />
        <meta name="msapplication-TileColor" content="#00FF88" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#050505" media="(prefers-color-scheme: dark)" />
        <meta name="background-color" content="#050505" />
        <link rel="preconnect" href="https://images.weserv.nl" />
        <link rel="dns-prefetch" href="https://images.weserv.nl" />
      </head>
      <body className={`${inter.className} antialiased bg-[#050505] text-white min-h-screen`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}