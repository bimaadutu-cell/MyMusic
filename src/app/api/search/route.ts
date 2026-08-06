import { NextResponse } from "next/server";
import yts from "yt-search";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json([]);

    const r = await yts(q);
    const videos = r.videos.slice(0, 20).map((v: any) => ({
      id: v.videoId,
      title: v.title,
      artist: v.author.name,
      cover: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      duration: v.timestamp,
      seconds: v.seconds,
      views: v.views,
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([]);
  }
}
