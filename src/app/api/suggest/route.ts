import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    if (!q) return NextResponse.json([]);

    const res = await fetch(`http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return NextResponse.json(data[1] || []);
  } catch (error) {
    return NextResponse.json([]);
  }
}
