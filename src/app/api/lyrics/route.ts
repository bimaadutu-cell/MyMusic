import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json(null);

    const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    
    if (data && data.length > 0) {
      return NextResponse.json({
        synced: data[0].syncedLyrics,
        plain: data[0].plainLyrics || "Lirik tidak ditemukan untuk lagu ini.",
      });
    }
    return NextResponse.json({ plain: "Lirik tidak ditemukan." });
  } catch (error) {
    return NextResponse.json({ plain: "Gagal memuat lirik." });
  }
}
