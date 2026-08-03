import { NextRequest, NextResponse } from "next/server";
import { musicCatalog, searchCatalog, type MusicItem } from "@/lib/music-data";

const memoryCache = new Map<string, { at: number; tracks: MusicItem[]; provider: string }>();
const bucket = new Map<string, { count: number; resetAt: number }>();

const PIPED_HOSTS = ["pipedapi.kavin.rocks", "pipedapi.adminforge.de", "api.piped.private.coffee", "pipedapi.reallyaweso.me", "pipedapi.drgns.space"];
const INVIDIOUS_HOSTS = ["inv.nadeko.net", "yewtu.be", "inv.tux.pizza", "invidious.f5.si", "vid.puffyan.us"];

const sanitize = (value: string) => value.replace(/[<>"'`;(){}]/g, "").slice(0, 120);

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
  return fetch(url, { signal: controller.signal, headers: { "User-Agent": "MyMusik/1.2 (PWA)" } }).finally(() => clearTimeout(timer));
}

const formatViews = (views?: number) => {
  if (!views || views < 100) return undefined;
  if (views >= 1_000_000) return `${Math.round(views / 1_000_000)} jt pemutaran`;
  if (views >= 1_000) return `${Math.round(views / 1_000)} rb pemutaran`;
  return `${views} pemutaran`;
};

const extractVideoId = (url?: string) => {
  if (!url) return "";
  const match = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? "";
};

type PipedItem = { url?: string; title?: string; uploaderName?: string; thumbnail?: string; duration?: number; views?: number };
type InvidiousItem = { type?: string; videoId?: string; title?: string; author?: string; lengthSeconds?: number; viewCount?: number; videoThumbnails?: Array<{ url?: string; quality?: string }> };

async function searchPiped(query: string): Promise<MusicItem[]> {
  for (const host of PIPED_HOSTS) {
    try {
      const response = await timeoutFetch(`https://${host}/search?q=${encodeURIComponent(query)}&filter=music_songs`, 4200);
      if (!response.ok) continue;
      const payload = (await response.json()) as { items?: PipedItem[] };
      const items = (payload.items ?? []).filter((item) => extractVideoId(item.url));
      if (!items.length) continue;
      return items.slice(0, 24).map((item, index) => buildItem({
        videoId: extractVideoId(item.url),
        title: item.title ?? "Tanpa Judul",
        artist: item.uploaderName ?? "Artis Tidak Dikenal",
        seconds: item.duration ?? 0,
        views: item.views,
        thumb: `https://i.ytimg.com/vi/${extractVideoId(item.url)}/hqdefault.jpg`,
        index,
      }));
    } catch {
      continue;
    }
  }
  return [];
}

async function searchInvidious(query: string): Promise<MusicItem[]> {
  for (const host of INVIDIOUS_HOSTS) {
    try {
      const response = await timeoutFetch(`https://${host}/api/v1/search?q=${encodeURIComponent(`${query} official audio`)}&type=video`, 4200);
      if (!response.ok) continue;
      const payload = (await response.json()) as InvidiousItem[];
      const items = payload.filter((item) => item.type === "video" && item.videoId);
      if (!items.length) continue;
      return items.slice(0, 24).map((item, index) => buildItem({
        videoId: item.videoId ?? "",
        title: item.title ?? "Tanpa Judul",
        artist: item.author ?? "Artis Tidak Dikenal",
        seconds: item.lengthSeconds ?? 0,
        views: item.viewCount,
        thumb: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
        index,
      }));
    } catch {
      continue;
    }
  }
  return [];
}

function buildItem(input: { videoId: string; title: string; artist: string; seconds: number; views?: number; thumb: string; index: number }): MusicItem {
  const cleanTitle = input.title.replace(/\s*\[[^\]]*\]/g, "").replace(/\s*\([^)]*(official|video|musik|music)[^)]*\)/gi, "").trim().slice(0, 90) || input.title;
  const seconds = input.seconds > 0 ? input.seconds : 200;
  return {
    id: `live-${input.videoId}`,
    title: cleanTitle,
    artist: input.artist.replace(/ - Topic$/i, "").trim() || input.artist,
    album: "Live Catalog",
    cover: input.thumb,
    duration: `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`,
    seconds,
    year: new Date().getFullYear(),
    genre: "Pop",
    mood: "Search",
    youtubeId: input.videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${input.videoId}`,
    sectionTags: ["Search", input.index < 8 ? "Viral Now" : "Rekomendasi"],
    color: "#ff0000",
    description: "Metadata langsung dari layanan streaming resmi.",
    source: "Official Stream",
    lyricsAvailable: false,
    views: formatViews(input.views),
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Terlalu banyak permintaan." }, { status: 429 });

  const query = sanitize(request.nextUrl.searchParams.get("q") ?? "").trim();
  if (!query) return NextResponse.json({ tracks: [], provider: "none" });

  const cacheKey = query.toLowerCase();
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 300_000) {
    return NextResponse.json({ tracks: cached.tracks, provider: cached.provider }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300", "X-Content-Type-Options": "nosniff" } });
  }

  let tracks = await searchPiped(query);
  let provider = tracks.length ? "live-music" : "";

  if (!tracks.length) {
    tracks = await searchInvidious(query);
    provider = tracks.length ? "live-video" : "";
  }

  if (!tracks.length) {
    tracks = searchCatalog(query);
    provider = tracks.length ? "local" : "none";
  }

  if (provider.startsWith("live")) {
    const localExtras = searchCatalog(query).filter((track) => !tracks.some((t) => t.youtubeId === track.youtubeId));
    tracks = [...tracks, ...localExtras].slice(0, 30);
  }

  memoryCache.set(cacheKey, { at: Date.now(), tracks, provider });

  return NextResponse.json(
    {
      tracks,
      provider,
      legalNotice: "Hasil pencarian menampilkan metadata dari layanan streaming resmi dan diputar melalui pemutar resmi di dalam web.",
      catalogSize: musicCatalog.length,
    },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300", "X-Content-Type-Options": "nosniff" } },
  );
}
