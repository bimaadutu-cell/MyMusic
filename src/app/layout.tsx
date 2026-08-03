import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const appName = "MyMusik";
const description = "MyMusik adalah PWA streaming musik modern dengan pencarian lagu lengkap, player premium, dan lirik, developed by BimzOfficial.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mymusik.local"),
  applicationName: appName,
  title: {
    default: `${appName} | Streaming Musik Modern`,
    template: `%s | ${appName}`,
  },
  description,
  keywords: ["MyMusik", "PWA musik", "streaming musik", "BimzOfficial", "musik Indonesia", "official stream", "music app"],
  authors: [{ name: "BimzOfficial" }],
  creator: "BimzOfficial",
  publisher: "BimzOfficial",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icons/mymusik-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/mymusik-logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon.svg"],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: appName,
    title: `${appName} - Streaming Musik Modern`,
    description,
    images: [{ url: "/images/mymusik-og.png", width: 1200, height: 630, alt: "MyMusik Neon Digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} - Streaming Musik Modern`,
    description,
    images: ["/images/mymusik-og.png"],
  },
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF0000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#050505] text-white antialiased">
        <ErrorBoundary>{children}</ErrorBoundary>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
