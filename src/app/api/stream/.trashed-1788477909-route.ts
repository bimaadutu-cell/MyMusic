import { NextRequest, NextResponse } from "next/server";

const PIPED_HOSTS = ["pipedapi.kavin.rocks", "pipedapi.adminforge.de", "api.piped.private.coffee", "pipedapi.reallyaweso.me", "pipedapi.drgns.space"];
const INVIDIOUS_HOSTS = ["inv.nadeko.net", "yewtu.be", "inv.tux.pizza", "invidious.f5.si"];

const cache = new Map<string, { at: number; url: string; title: string; provider: string }>();
const bucket = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string) {
  const now = Date.now();
  const current = bucket.get(ip);
  if (!current || current.resetAt < now) {
    bucket.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 60;
}

function timeoutFetch(url: string, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal, headers: { "User-Agent": "MyMusik/2.0" } }).finally(() => clearTimeout(timer));
}

type PipedStreams = { title?: string; audioStreams?: Array<{ url?: string; mimeType?: string; bitrate?: number }> };
type InvidiousVideo = { title?: string; adaptiveFormats?: Array<{ url?: string; type?: string; bitrate?: string | number }> };

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });

  const id = (request.nextUrl.searchParams.get("id") ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 16);
  if (!id) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const cached = cache.get(id);
  if (cached && Date.now() - cached.at < 600_000) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  }

  for (const host of PIPED_HOSTS) {
    try {
      const response = await timeoutFetch(`https://${host}/streams/${id}`, 5000);
      if (!response.ok) continue;
      const payload = (await response.json()) as PipedStreams;
      const streams = (payload.audioStreams ?? []).filter((s) => s.url);
      if (!streams.length) continue;
      streams.sort((a, b) => {
        const mp4 = (m?: string) => (m?.includes("audio/mp4") ? 1 : 0);
        return mp4(b.mimeType) - mp4(a.mimeType) || (b.bitrate ?? 0) - (a.bitrate ?? 0);
      });
      const result = { at: Date.now(), url: streams[0].url as string, title: payload.title ?? "", provider: "piped" };
      cache.set(id, result);
      return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
    } catch {
      continue;
    }
  }

  for (const host of INVIDIOUS_HOSTS) {
    try {
      const response = await timeoutFetch(`https://${host}/api/v1/videos/${id}`, 5000);
      if (!response.ok) continue;
      const payload = (await response.json()) as InvidiousVideo;
      const formats = (payload.adaptiveFormats ?? []).filter((f) => f.url && f.type?.startsWith("audio/"));
      if (!formats.length) continue;
      formats.sort((a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0));
      let url = formats[0].url as string;
      if (url.startsWith("/")) url = `https://${host}${url}`;
      const result = { at: Date.now(), url, title: payload.title ?? "", provider: "invidious" };
      cache.set(id, result);
      return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ url: null, title: "", provider: "none" }, { status: 404 });
}
