import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new NextResponse("Missing ID", { status: 400 });

  // AKAR MASALAH: Vercel membatasi waktu eksekusi API (timeout 10 detik).
  // Jika kita memakai streaming proxy lewat Vercel, lagu akan otomatis MATI di background setelah 10 detik!
  // SOLUSI MUTLAK: Redirect langsung ke server streaming Audio yang sanggup melayani HTTP 206 Partial Content
  // tanpa batas waktu, sehingga OS HP (Android/iOS) bisa mendownload chunk di background tanpa terputus.
  
  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://api.piped.projectsegfau.lt"
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/streams/${id}`, { timeout: 4000 } as any);
      if (res.ok) {
        const data = await res.json();
        const audioStreams = data.audioStreams;
        if (audioStreams && audioStreams.length > 0) {
          // Ambil kualitas audio tertinggi m4a/webm
          const bestAudio = audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
          if (bestAudio && bestAudio.url) {
            // REDIRECT! HP klien akan mengunduh langsung dari CDN, bebas dari batasan Vercel.
            return NextResponse.redirect(bestAudio.url);
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback direct jika Piped API penuh
  return NextResponse.redirect(`https://invidious.asir.dev/latest_version?id=${id}&itag=140`);
}
