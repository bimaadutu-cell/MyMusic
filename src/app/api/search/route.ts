import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json([]);

  // VERCEL FIX: Menggunakan Promise.any agar API merespon dalam hitungan detik
  // Bypassing IP-Block dari Vercel saat melakukan scraping ke YouTube.
  const pipedInstances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.smnz.de",
    "https://piped-api.garudalinux.org"
  ];

  try {
    const videos = await Promise.any(pipedInstances.map(async (instance) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${instance}/search?q=${encodeURIComponent(q)}&filter=all`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Not ok");
      
      const data = await res.json();
      const items = data.items.filter((i: any) => i.type === "stream").slice(0, 20);
      if (items.length === 0) throw new Error("Empty");
      
      return items.map((v: any) => ({
        id: v.url.replace('/watch?v=', ''),
        title: v.title,
        artist: v.uploaderName,
        cover: v.thumbnail,
        duration: Math.floor(v.duration / 60) + ":" + (v.duration % 60).toString().padStart(2, '0'),
        seconds: v.duration,
        views: v.views
      }));
    }));
    return NextResponse.json(videos);
  } catch (e) {
    // FALLBACK: Invidious API
    const invidiousInstances = [
      "https://invidious.flokinet.to",
      "https://invidious.jing.rocks",
      "https://inv.tux.pizza"
    ];
    try {
      const invVideos = await Promise.any(invidiousInstances.map(async (inv) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${inv}/api/v1/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Not ok");
        
        const data = await res.json();
        const filtered = data.filter((v:any) => v.type === "video").slice(0, 20);
        if (filtered.length === 0) throw new Error("Empty");
        
        return filtered.map((v:any) => ({
          id: v.videoId,
          title: v.title,
          artist: v.author,
          cover: v.videoThumbnails?.find((t:any) => t.quality === "maxresdefault" || t.quality === "high")?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          duration: Math.floor(v.lengthSeconds / 60) + ":" + (v.lengthSeconds % 60).toString().padStart(2, '0'),
          seconds: v.lengthSeconds,
          views: v.viewCount
        }));
      }));
      return NextResponse.json(invVideos);
    } catch (err) {
      return NextResponse.json([]);
    }
  }
}
