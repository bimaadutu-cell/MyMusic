import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  // VERCEL ROBUST RESOLVER: Menggunakan Promise.any agar jika satu server down/lelet, 
  // API akan langsung mengembalikan respon server yang tercepat tanpa harus kena limit Vercel (10s).
  
  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.smnz.de",
    "https://piped-api.garudalinux.org"
  ];

  try {
    const url = await Promise.any(instances.map(async (instance) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${instance}/streams/${id}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error("Not ok");
      
      const data = await res.json();
      const audioStreams = data.audioStreams;
      if (audioStreams && audioStreams.length > 0) {
        const bestAudio = audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        if (bestAudio && bestAudio.url) return bestAudio.url;
      }
      throw new Error("No URL found");
    }));
    
    return NextResponse.json({ url });
  } catch (e) {
    // Fallback absolut
    return NextResponse.json({ url: `https://invidious.flokinet.to/latest_version?id=${id}&itag=140` });
  }
}
