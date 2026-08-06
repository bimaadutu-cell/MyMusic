import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  // ALGORITMA PENYELESAIAN BACKGROUND PLAY MATI:
  // Jika pakai YTDL, URL googlevideo akan mengunci IP Server (Vercel). Saat HP kamu memutar, Google menolaknya (403 Forbidden).
  // Akibatnya saat layar mati, HP gagal membuffer chunk selanjutnya dan lagu MATI.
  // SOLUSI: Gunakan URL Proxy dari Piped API yang meredirect stream audio secara global tanpa IP Lock.
  
  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.smnz.de",
    "https://piped-api.garudalinux.org"
  ];

  for (const instance of instances) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${instance}/streams/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        const audioStreams = data.audioStreams;
        if (audioStreams && audioStreams.length > 0) {
          // Cari audio dengan bitrate terbaik (M4A/WebM)
          const bestAudio = audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
          if (bestAudio && bestAudio.url) {
            return NextResponse.json({ url: bestAudio.url });
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback stabil Invidious jika semua Piped sedang sibuk
  const fallbackUrl = `https://invidious.flokinet.to/latest_version?id=${id}&itag=140`;
  return NextResponse.json({ url: fallbackUrl });
}
