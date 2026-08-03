import { NextRequest, NextResponse } from "next/server";
import { defaultAdminSettings, featuredPlaylists, genres, musicCatalog, searchCatalog, topArtists, type MusicItem } from "@/lib/music-data";

const bucket = new Map<string, { count: number; resetAt: number }>();

const sanitize = (value: string) => value.replace(/[<>"'`;(){}]/g, "").slice(0, 90);

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = bucket.get(ip);
  if (!current || current.resetAt < now) {
    bucket.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 80;
}

function parseDuration(value?: string) {
  if (!value) return 210;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 210;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours) return `${hours}:${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function compactViews(value?: string) {
  const views = Number(value ?? 0);
  if (!views) return undefined;
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}K`;
  return String(views);
}

type SearchPayload = {
  items?: Array<{ id?: { videoId?: string } }>;
};

type VideosPayload = {
  items?: Array<{
    id: string;
    snippet?: {
      title?: string;
      channelTitle?: string;
      publishedAt?: string;
      thumbnails?: { high?: { url?: string }; medium?: { url?: string }; default?: { url?: string } };
    };
    contentDetails?: { duration?: string };
    statistics?: { viewCount?: string };
  }>;
};

async function searchOfficialProvider(query: string): Promise<MusicItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || !query.trim()) return [];

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `${query} official music`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoCategoryId", "10");
  searchUrl.searchParams.set("maxResults", "24");
  searchUrl.searchParams.set("regionCode", "ID");
  searchUrl.searchParams.set("relevanceLanguage", "id");
  searchUrl.searchParams.set("safeSearch", "none");
  searchUrl.searchParams.set("key", key);

  const searchResponse = await fetch(searchUrl, { next: { revalidate: 120 } });
  if (!searchResponse.ok) return [];
  const searchPayload = (await searchResponse.json()) as SearchPayload;
  const ids = (searchPayload.items ?? []).map((item) => item.id?.videoId).filter(Boolean) as string[];
  if (!ids.length) return [];

  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("part", "snippet,contentDetails,statistics");
  videosUrl.searchParams.set("id", ids.join(","));
  videosUrl.searchParams.set("key", key);

  const videosResponse = await fetch(videosUrl, { next: { revalidate: 120 } });
  if (!videosResponse.ok) return [];
  const videosPayload = (await videosResponse.json()) as VideosPayload;

  return (videosPayload.items ?? []).map((item, index) => {
    const seconds = parseDuration(item.contentDetails?.duration);
    const year = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt).getFullYear() : new Date().getFullYear();
    return {
      id: `live-${item.id}`,
      title: item.snippet?.title?.replace(/\s*\[[^\]]*\]|\s*\([^)]*official[^)]*\)/gi, "").slice(0, 90) || "Untitled Track",
      artist: item.snippet?.channelTitle?.replace(/ - Topic$/i, "") || "Unknown Artist",
      album: "Live Catalog",
      cover: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
      duration: formatDuration(seconds),
      seconds,
      year,
      genre: "Pop",
      mood: "Search",
      youtubeId: item.id,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`,
      sectionTags: ["Search", "Live Catalog", index < 6 ? "Viral Now" : "Rekomendasi"],
      color: index % 2 ? "#18ff9b" : "#00FF88",
      description: "Metadata dari katalog resmi yang dimuat server-side.",
      source: "Official Stream" as const,
      lyricsAvailable: false,
      views: compactViews(item.statistics?.viewCount),
    };
  });
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi sebentar." }, { status: 429 });
  }

  const query = sanitize(request.nextUrl.searchParams.get("q") ?? "");
  const tag = sanitize(request.nextUrl.searchParams.get("tag") ?? "");
  const localTracks = query ? searchCatalog(query) : musicCatalog;
  let liveTracks: MusicItem[] = [];

  if (query) {
    liveTracks = await searchOfficialProvider(query).catch(() => []);
  }

  let tracks = liveTracks.length ? liveTracks : localTracks;
  if (tag) {
    tracks = tracks.filter((track) => track.sectionTags.includes(tag) || track.genre.toLowerCase() === tag.toLowerCase());
  }

  const merged = query && liveTracks.length ? [...liveTracks, ...localTracks.filter((track) => !liveTracks.some((live) => live.youtubeId === track.youtubeId))] : tracks;

  return NextResponse.json(
    {
      app: "MyMusik",
      developedBy: "BimzOfficial",
      legalNotice:
        "MyMusik menampilkan metadata kurasi dan pemutaran resmi di dalam web. Aplikasi tidak mengunduh, menyimpan ulang, atau mendistribusikan katalog musik pihak ketiga.",
      tracks: merged,
      playlists: featuredPlaylists,
      artists: topArtists,
      genres,
      settings: defaultAdminSettings,
      liveSearch: Boolean(process.env.YOUTUBE_API_KEY),
    },
    {
      headers: {
        "Cache-Control": query ? "public, s-maxage=120, stale-while-revalidate=300" : "public, s-maxage=300, stale-while-revalidate=600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
