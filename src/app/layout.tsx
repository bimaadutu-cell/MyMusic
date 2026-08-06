import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyMusik — Streaming Musik",
  description: "Streaming musik dengan UI modern, PWA, dan performa tinggi.",
  manifest: "/manifest.json",
  themeColor: "#030303",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyMusik"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#030303] text-white antialiased touch-manipulation overscroll-none overflow-hidden">{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`}} /></body>
    </html>
  );
}
