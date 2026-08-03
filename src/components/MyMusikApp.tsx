"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoginGate, type AuthUser } from "@/components/LoginGate";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { YouTubePlayerBridge } from "@/components/YouTubePlayerBridge";
import { getTracksByTag, musicCatalog, topArtists, type MusicItem } from "@/lib/music-data";

type Toast = { id: number; message: string };
type Tab = "home" | "sampel" | "telusuri" | "koleksi";
type Persisted = { currentId: string; volume: number; position: number; favorites: string[]; recently: string[] };
type LyricLine = { t: number; text: string };
type LyricsState = { loading: boolean; lines: LyricLine[]; plain: string; missing: boolean };

const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const formatTime = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${(safe % 60).toString().padStart(2, "0")}`;
};

const unique = <T,>(items: T[]) => Array.from(new Set(items));

const hashNum = (seed: string, mod: number) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % mod;
};

const formatCount = (value: number) => (value >= 1000 ? `${Math.round(value / 100) / 10} jt` : `${value} rb`);

const parseLrc = (raw: string): LyricLine[] => {
  const lines: LyricLine[] = [];
  const stamp = /\[(\d+):(\d+)(?:[.:](\d+))?\]/g;
  for (const line of raw.split("\n")) {
    const times: number[] = [];
    let match: RegExpExecArray | null;
    stamp.lastIndex = 0;
    while ((match = stamp.exec(line))) {
      times.push(Number(match[1]) * 60 + Number(match[2]) + (match[3] ? Number(match[3].padEnd(3, "0").slice(0, 3)) / 1000 : 0));
    }
    const text = line.replace(stamp, "").trim();
    if (!text) continue;
    if (!times.length) times.push(lines.length ? lines[lines.length - 1].t + 5 : 0);
    for (const t of times) lines.push({ t, text });
  }
  return lines.sort((a, b) => a.t - b.t);
};

const I = {
  home: <path d="M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10" />,
  sampel: <path d="M4 5h10M4 12h10M4 19h6m4-11 6 4-6 4V8Z" />,
  telusuri: <path d="m20 20-3.5-3.5M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />,
  koleksi: <path d="M6 3h12v18l-6-4-6 4V3Z" />,
  bell: <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6m4 10a2 2 0 0 0 4 0" />,
  cast: <path d="M3 17a4 4 0 0 1 4 4M3 13a8 8 0 0 1 8 8M5 5h14a2 2 0 0 1 2 2v10M3 7V5h2" />,
  play: <path d="M7 4.5v15l13-7.5-13-7.5Z" />,
  pause: <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" />,
  prev: <path d="M18 5v14l-9-7 9-7ZM5.5 5h2v14h-2z" />,
  next: <path d="M6 5v14l9-7-9-7ZM16.5 5h2v14h-2z" />,
  shuffle: <path d="M3 7h4l10 10h4m0 0-3-3m3 3-3 3M3 17h4l3-3m4-4 3-3h4m0 0-3-3m3 3-3 3" />,
  repeat: <path d="M4 10a5 5 0 0 1 5-5h11m0 0-3-3m3 3-3 3m3 6a5 5 0 0 1-5 5H4m0 0 3 3m-3-3 3-3" />,
  up: <path d="m7 17 10-10m0 0H8m9 0v9" />,
  back: <path d="M19 12H5m0 0 6-6m-6 6 6 6" />,
  mic: <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Zm7 9a7 7 0 0 1-14 0m7 7v3" />,
  more: <path d="M12 6h.01M12 12h.01M12 18h.01" />,
  like: <path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2l-1 6a2 2 0 0 1-2 2H7" />,
  dislike: <path d="M17 13V4h3v9h-3Zm0 0-4 7a2 2 0 0 1-2-2v-3H6a2 2 0 0 1-2-2l1-6a2 2 0 0 1 2-2h10" />,
  quote: <path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3m10-10h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3" />,
  comment: <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />,
  save: <path d="M4 7h10m-3-3 3 3-3 3m9 4v9H6V6" />,
  share: <path d="M4 12v8h16v-8M12 3v13m0-13 4 4m-4-4-4 4" />,
  headphones: <path d="M4 14a8 8 0 0 1 16 0m-16 0v4a2 2 0 0 0 2 2h1v-6H5m15 0h-2v6h1a2 2 0 0 0 2-2v-4" />,
  video: <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm13 4 5-3v10l-5-3" />,
  down: <path d="m6 9 6 6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  wave: <path d="M4 12v0m4-4v8m4-12v16m4-10v4m4-6v8" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  translate: <path d="M4 5h8M8 3v2m1 0c-.5 4-3 7-5 8m2-5c1 3 3 5 5 6m2 1 4-9 4 9m-7-2h6" />,
};

function Icon({ d, className = "h-6 w-6", fill = false }: { d: keyof typeof I; className?: string; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={fill ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {I[d]}
    </svg>
  );
}

function RowItem({ track, onPlay, onMenu }: { track: MusicItem; onPlay: (track: MusicItem) => void; onMenu: (track: MusicItem) => void }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <button onClick={() => onPlay(track)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.cover} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-md bg-zinc-800 object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-white">{track.title}</span>
          <span className="block truncate text-sm text-zinc-400">{track.artist} • {track.year}{track.views ? ` • ${track.views}` : ""}</span>
        </span>
      </button>
      <button onClick={() => onMenu(track)} className="p-2 text-zinc-400 transition hover:text-white" aria-label="Opsi"><Icon d="more" className="h-5 w-5" /></button>
    </div>
  );
}

function Card({ track, onPlay, wide = false }: { track: MusicItem; onPlay: (track: MusicItem) => void; wide?: boolean }) {
  return (
    <button onClick={() => onPlay(track)} className={`shrink-0 text-left ${wide ? "w-64" : "w-40"}`}>
      <div className="overflow-hidden rounded-md bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.cover} alt="" loading="lazy" className="aspect-square w-full bg-zinc-800 object-cover" />
      </div>
      <p className="mt-2 truncate text-sm font-medium text-white">{track.title}</p>
      <p className="truncate text-xs text-zinc-400">Lagu • {track.artist}</p>
    </button>
  );
}

const LyricLines = memo(function LyricLines({ lines, active, registerRef }: { lines: LyricLine[]; active: number; registerRef: (index: number, el: HTMLParagraphElement | null) => void }) {
  return (
    <>
      {lines.map((line, index) => (
        <p key={`${line.t}-${index}`} ref={(el) => registerRef(index, el)} className={`py-3 text-2xl font-semibold leading-9 ${index === active ? "text-white" : "text-white/35"}`}>
          {line.text}
        </p>
      ))}
    </>
  );
});

function ArtistModal({ name, results, loading, onClose, onPlay }: { name: string; results: MusicItem[]; loading: boolean; onClose: () => void; onPlay: (track: MusicItem) => void }) {
  const header = results[0]?.cover ?? musicCatalog[0].cover;
  const subCount = formatCount(hashNum(name, 90000) / 1000 + 1);
  return (
    <motion.div className="fixed inset-0 z-[85] overflow-y-auto bg-[#030303] text-white" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} transition={{ duration: 0.28 }}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={header} alt="" className="h-[44vh] w-full bg-zinc-900 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/30 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <button onClick={onClose} aria-label="Kembali" className="text-white"><Icon d="back" className="h-7 w-7" /></button>
          <div className="flex items-center gap-4"><Icon d="sampel" className="h-6 w-6" /><Icon d="share" className="h-6 w-6" /></div>
        </div>
        <h2 className="absolute bottom-4 left-4 right-4 truncate text-5xl font-bold tracking-tight">{name}</h2>
      </div>

      <div className="flex items-center justify-between px-4 py-4">
        <button className="rounded-lg bg-white px-5 py-2.5 font-semibold text-black">Subscribe&nbsp; {subCount}</button>
        <div className="flex items-center gap-3">
          <button className="grid h-11 w-11 place-items-center rounded-full bg-white/10" aria-label="Radio artis"><Icon d="wave" className="h-5 w-5" /></button>
          <button onClick={() => results[0] && onPlay(results[0])} className="grid h-12 w-12 place-items-center rounded-full bg-white text-black" aria-label="Putar artis"><Icon d="play" className="h-6 w-6" fill /></button>
        </div>
      </div>

      <div className="mx-4 flex items-center justify-between rounded-xl bg-[#1f1f1f] p-4">
        <div>
          <p className="text-sm text-zinc-400">Ambil sampel ini</p>
          <p className="mt-1 text-[15px] font-medium">Ketuk untuk melihat artis ini dan temukan favorit</p>
        </div>
        <div className="flex -space-x-3">
          {(results.length ? results : musicCatalog).slice(0, 3).map((track) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={track.id} src={track.cover} alt="" className="h-14 w-10 rounded-md border-2 border-[#1f1f1f] bg-zinc-800 object-cover" />
          ))}
        </div>
      </div>

      <section className="mt-6 px-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Lagu teratas</h3>
          <button onClick={() => results[0] && onPlay(results[0])} className="rounded-lg border border-white/25 px-4 py-1.5 text-sm font-medium">Putar semua</button>
        </div>
        <div className="mt-3 space-y-1">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="shimmer h-12 w-12 rounded-md bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-4 w-2/3 rounded bg-zinc-800" />
                    <div className="shimmer h-3 w-1/3 rounded bg-zinc-800" />
                  </div>
                </div>
              ))
            : results.slice(0, 6).map((track, index) => (
                <div key={track.id} className={`flex items-center gap-3 rounded-xl px-1 py-2 ${index === 0 ? "bg-[#1f1f1f]" : ""}`}>
                  <button onClick={() => onPlay(track)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={track.cover} alt="" className="h-12 w-12 shrink-0 rounded-md bg-zinc-800 object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium">{track.title}</span>
                      <span className="block truncate text-sm text-zinc-400">{track.artist}{track.views ? ` • ${track.views}` : ""}</span>
                      <span className="block text-xs italic text-zinc-500">No. {index + 1} minggu ini</span>
                    </span>
                  </button>
                  <Icon d="more" className="h-5 w-5 text-zinc-400" />
                </div>
              ))}
        </div>
      </section>

      <section className="mt-6 px-4 pb-44">
        <h3 className="text-xl font-semibold">Single & EP</h3>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {(results.length ? results : musicCatalog).slice(0, 8).map((track) => (
            <button key={track.id} onClick={() => onPlay(track)} className="w-40 shrink-0 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.cover} alt="" className="aspect-square w-full rounded-md bg-zinc-800 object-cover" />
              <p className="mt-2 truncate text-sm font-medium">{track.title}</p>
              <p className="truncate text-xs text-zinc-400">Single • {track.year}</p>
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

export function MyMusikApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [current, setCurrent] = useState<MusicItem>(musicCatalog[0]);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(musicCatalog[0].seconds);
  const [seekTo, setSeekTo] = useState(0);
  const [seekVersion, setSeekVersion] = useState(0);
  const [volume, setVolume] = useState(85);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsState>({ loading: false, lines: [], plain: "", missing: false });
  const [translated, setTranslated] = useState("");
  const [translating, setTranslating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recently, setRecently] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [mixLabel, setMixLabel] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mixBusy = useRef(false);
  const lyricRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const [authed, setAuthed] = useState<AuthUser | null>(() => storage.get<AuthUser | null>("mymusik-auth", null));
  const [artistName, setArtistName] = useState<string | null>(null);
  const [artistResults, setArtistResults] = useState<MusicItem[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mixQueue, setMixQueue] = useState<MusicItem[]>([]);
  const mixQueueRef = useRef<MusicItem[]>([]);
  const currentIdRef = useRef(musicCatalog[0].youtubeId);
  const errorStreak = useRef(0);

  const trackMap = useMemo(() => new Map(musicCatalog.map((track) => [track.id, track])), []);
  const favoriteTracks = useMemo(() => favorites.map((id) => trackMap.get(id)).filter(Boolean) as MusicItem[], [favorites, trackMap]);
  const recentTracks = useMemo(() => recently.map((id) => trackMap.get(id)).filter(Boolean) as MusicItem[], [recently, trackMap]);

  const dailyArtists = useMemo(() => {
    const seen = new Set(topArtists.map((artist) => artist.name.toLowerCase()));
    const extra: Array<{ id: string; name: string; genre: string; monthlyListeners: string; image: string }> = [];
    for (const trackItem of musicCatalog) {
      const key = trackItem.artist.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      extra.push({ id: `cat-${trackItem.id}`, name: trackItem.artist, genre: trackItem.genre, monthlyListeners: trackItem.views ?? "Artis", image: trackItem.cover });
    }
    const pool = [...topArtists, ...extra];
    let seed = Math.floor(Date.now() / 86_400_000) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 8);
  }, []);
  const playerDuration = duration > 0 ? duration : current.seconds;
  const progress = playerDuration ? Math.min(100, (position / playerDuration) * 100) : 0;
  const activeLyric = useMemo(() => {
    let index = -1;
    lyrics.lines.forEach((line, i) => {
      if (line.t <= position + 0.4) index = i;
    });
    return index;
  }, [lyrics.lines, position]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 2800);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2400);
    const persisted = storage.get<Persisted | null>("mymusik-v2", null);
    if (persisted) {
      setFavorites(persisted.favorites ?? []);
      setRecently(persisted.recently ?? []);
      setVolume(persisted.volume ?? 85);
      const resume = trackMap.get(persisted.currentId);
      if (resume) {
        setCurrent(resume);
        setDuration(resume.seconds);
      }
    }
    return () => window.clearTimeout(timer);
  }, [trackMap]);

  useEffect(() => {
    storage.set<Persisted>("mymusik-v2", { currentId: current.id, volume, position, favorites, recently });
  }, [current.id, favorites, position, recently, volume]);

  useEffect(() => {
    currentIdRef.current = current.youtubeId;
  }, [current.youtubeId]);

  const runSearch = useCallback(async (term: string) => {
    const clean = term.trim();
    if (!clean) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(clean)}`);
      if (!response.ok) throw new Error("gagal");
      const payload = (await response.json()) as { tracks?: MusicItem[] };
      setResults(payload.tracks ?? []);
    } catch {
      const normalized = clean.toLowerCase();
      setResults(musicCatalog.filter((track) => [track.title, track.artist, track.album, track.genre].join(" ").toLowerCase().includes(normalized)));
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = window.setTimeout(() => runSearch(query), 200);
    return () => window.clearTimeout(handle);
  }, [query, runSearch]);

  const fetchLyrics = useCallback(async (track: MusicItem) => {
    setLyrics({ loading: true, lines: [], plain: "", missing: false });
    setTranslated("");
    try {
      let data: { syncedLyrics?: string; plainLyrics?: string } | null = null;
      const direct = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(track.artist)}&track_name=${encodeURIComponent(track.title)}`);
      if (direct.ok) data = (await direct.json().catch(() => null)) as { syncedLyrics?: string; plainLyrics?: string } | null;
      if (!data || (!data.syncedLyrics && !data.plainLyrics)) {
        const search = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${track.title} ${track.artist}`)}`);
        if (search.ok) {
          const arr = (await search.json().catch(() => null)) as Array<{ syncedLyrics?: string; plainLyrics?: string }> | null;
          data = Array.isArray(arr) ? arr[0] ?? null : null;
        }
      }
      if (data && (data.syncedLyrics || data.plainLyrics)) {
        const synced = data.syncedLyrics ? parseLrc(data.syncedLyrics) : [];
        const plain = data.plainLyrics ?? synced.map((line) => line.text).join("\n");
        const lines = synced.length ? synced : plain.split("\n").filter(Boolean).map((text, index) => ({ t: index * 6, text }));
        setLyrics({ loading: false, lines, plain, missing: false });
        return;
      }
      setLyrics({ loading: false, lines: [], plain: "", missing: true });
    } catch {
      setLyrics({ loading: false, lines: [], plain: "", missing: true });
    }
  }, []);

  async function prefetchMix(base: MusicItem, target = 15, extraQuery?: string) {
    try {
      const moodKeyword = base.mood && base.mood !== "Search" && base.mood !== "Viral" ? base.mood : "";
      const moodQuery = moodKeyword
        ? `${moodKeyword} ${isIndonesian(base) ? "lagu indonesia" : "western songs"} 2026`
        : isIndonesian(base)
          ? "lagu indonesia viral 2026"
          : "popular western songs 2026";
      const queries = [`${base.title} ${base.artist}`, `${base.artist} similar songs`, moodQuery];
      if (extraQuery) queries.push(extraQuery);
      const settled = await Promise.allSettled(
        queries.map(async (q) => {
          const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          if (!response.ok) return [] as MusicItem[];
          const payload = (await response.json()) as { tracks?: MusicItem[] };
          return payload.tracks ?? [];
        }),
      );
      const pool = settled.flatMap((item) => (item.status === "fulfilled" ? item.value : []));
      const seen = new Set([...mixQueueRef.current.map((p) => p.youtubeId), base.youtubeId, currentIdRef.current]);
      const additions = pool.filter((t) => (seen.has(t.youtubeId) ? false : (seen.add(t.youtubeId), true)));
      for (let i = additions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [additions[i], additions[j]] = [additions[j], additions[i]];
      }
      const merged = [...mixQueueRef.current, ...additions].slice(0, target);
      mixQueueRef.current = merged;
      setMixQueue(merged);
      if (extraQuery) toast(additions.length ? `+${additions.length} lagu ditambahkan ke mix` : "Tidak ada lagu baru yang cocok");
    } catch {
      /* mix kosong tidak fatal */
    }
  }

  const startTrack = useCallback((track: MusicItem, keepQueue = false) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast("Mode offline: riwayat & antarmuka tersedia, streaming butuh koneksi internet.");
    }
    setCurrent(track);
    setStarted(true);
    setPlaying(true);
    setPosition(0);
    setDuration(track.seconds);
    setSeekTo(0);
    setSeekVersion((value) => value + 1);
    setMixLabel("");
    setRecently((items) => unique([track.id, ...items.filter((id) => id !== track.id)]).slice(0, 20));
    if (!keepQueue) {
      mixQueueRef.current = [];
      setMixQueue([]);
      void prefetchMix(track);
    }
    void fetchLyrics(track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchLyrics, toast]);

  const play = useCallback((track: MusicItem) => startTrack(track, false), [startTrack]);

  const playAll = useCallback((tracks: MusicItem[]) => {
    if (tracks[0]) play(tracks[0]);
  }, [play]);

  const playRandom = useCallback(() => {
    play(musicCatalog[Math.floor(Math.random() * musicCatalog.length)]);
  }, [play]);

  const openArtist = useCallback(async (name: string, seedTitle?: string) => {
    setArtistName(name);
    setArtistLoading(true);
    setArtistResults([]);
    try {
      const query = seedTitle ? `${name} ${seedTitle}` : `${name} official`;
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("gagal");
      const payload = (await response.json()) as { tracks?: MusicItem[] };
      const all = payload.tracks ?? [];
      const normalized = name.toLowerCase();
      const byArtist = all.filter((track) => track.artist.toLowerCase().includes(normalized));
      const byTitle = all.filter((track) => track.title.toLowerCase().includes(normalized) && !byArtist.includes(track));
      const merged = [...byArtist, ...byTitle];
      setArtistResults((merged.length ? merged : all).slice(0, 12));
    } catch {
      setArtistResults(musicCatalog.filter((track) => track.artist.toLowerCase().includes(name.toLowerCase())));
    } finally {
      setArtistLoading(false);
    }
  }, []);

  const next = useCallback(() => {
    const index = musicCatalog.findIndex((track) => track.id === current.id);
    play(musicCatalog[(index + 1) % musicCatalog.length]);
  }, [current.id, play]);

  const previous = useCallback(() => {
    const index = musicCatalog.findIndex((track) => track.id === current.id);
    play(musicCatalog[(index - 1 + musicCatalog.length) % musicCatalog.length]);
  }, [current.id, play]);

  const seek = useCallback((seconds: number) => {
    const safe = Math.max(0, Math.min(seconds, playerDuration || current.seconds));
    setPosition(safe);
    setSeekTo(safe);
    setSeekVersion((value) => value + 1);
  }, [current.seconds, playerDuration]);

  const onProgress = useCallback((nextPosition: number, nextDuration: number) => {
    errorStreak.current = 0;
    if (nextDuration > 0) setDuration(nextDuration);
    setPosition(nextPosition);
  }, []);

  const handlePlayerError = useCallback((message: string) => {
    errorStreak.current += 1;
    if (errorStreak.current <= 3) {
      toast("Track tidak tersedia, melompat otomatis...");
      window.setTimeout(() => next(), 600);
    } else {
      toast(message);
    }
  }, [next, toast]);

  const shareApp = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "MyMusik", text: "Dengarkan musik gratis di MyMusik — Streaming Musik Modern oleh BimzOfficial", url });
        return;
      } catch {
        /* pengguna membatalkan */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(`Tautan publik disalin: ${url}`);
    } catch {
      toast(url);
    }
  }, [toast]);

  const isIndonesian = useCallback((track: MusicItem) => {
    return track.sectionTags.includes("Top Indonesia") || track.sectionTags.includes("Viral Now") || ["Dangdut", "Religi"].includes(track.genre) || /indonesia/i.test(track.artist + track.album);
  }, []);

  const autoMix = useCallback(async (base: MusicItem) => {
    if (mixBusy.current) return;
    mixBusy.current = true;
    try {
      const queries = isIndonesian(base)
        ? [`${base.title} ${base.artist} remix`, `${base.title} ${base.artist}`]
        : [`${base.title} ${base.artist}`, "top english pop hits 2026 Justin Bieber"];
      const settled = await Promise.allSettled(queries.map(async (q) => {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) return [] as MusicItem[];
        const payload = (await response.json()) as { tracks?: MusicItem[] };
        return payload.tracks ?? [];
      }));
      const pool = settled
        .flatMap((item) => (item.status === "fulfilled" ? item.value : []))
        .filter((track) => track.youtubeId !== base.youtubeId);
      const seen = new Set<string>();
      const deduped = pool.filter((track) => (seen.has(track.youtubeId) ? false : (seen.add(track.youtubeId), true)));
      const pick = deduped.length ? deduped[Math.floor(Math.random() * Math.min(deduped.length, 10))] : musicCatalog[Math.floor(Math.random() * musicCatalog.length)];
      setMixLabel(`Mix ${base.title}`);
      play(pick);
    } finally {
      mixBusy.current = false;
    }
  }, [isIndonesian, play]);

  const onEnded = useCallback(() => {
    if (repeat) {
      setSeekTo(0);
      setSeekVersion((value) => value + 1);
      setPlaying(true);
      return;
    }
    if (shuffle) {
      playRandom();
      return;
    }
    const queueNow = mixQueueRef.current;
    if (queueNow.length) {
      const [nextUp, ...rest] = queueNow;
      mixQueueRef.current = rest;
      setMixQueue(rest);
      setMixLabel(`Mix ${current.title}`);
      startTrack(nextUp, true);
      if (rest.length < 3) void prefetchMix(nextUp);
      return;
    }
    void autoMix(current);
  }, [autoMix, current, playRandom, repeat, shuffle, startTrack]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || !started) return;
      if (event.code === "Space") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, previous, started]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album, artwork: [{ src: current.cover, sizes: "512x512", type: "image/jpeg" }] });
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    try {
      navigator.mediaSession.setPositionState({ duration: playerDuration || current.seconds, position: Math.min(position, playerDuration || current.seconds), playbackRate: 1 });
    } catch {
      /* posisi tidak didukung */
    }
    navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", previous);
  }, [current, next, playing, position, previous, playerDuration]);

  useEffect(() => {
    const el = lyricRefs.current[activeLyric];
    if (el && lyricsOpen) el.scrollIntoView({ block: "center", behavior: "auto" });
  }, [activeLyric, lyricsOpen]);

  const toggleFavorite = (track: MusicItem) => {
    setFavorites((items) => {
      const exists = items.includes(track.id);
      toast(exists ? "Dihapus dari Koleksi" : "Disimpan ke Koleksi");
      return exists ? items.filter((id) => id !== track.id) : [track.id, ...items];
    });
  };

  const toggleLike = () => {
    setLikedIds((items) => {
      const exists = items.includes(current.id);
      toast(exists ? "Like dihapus" : "Kamu menyukai lagu ini");
      return exists ? items.filter((id) => id !== current.id) : [current.id, ...items];
    });
  };

  const translateLyrics = async () => {
    if (!lyrics.plain) {
      toast("Lirik belum tersedia untuk diterjemahkan.");
      return;
    }
    setTranslating(true);
    setTranslated("");
    try {
      const max = 1400;
      const chunks: string[] = [];
      let currentChunk = "";
      for (const line of lyrics.plain.split("\n")) {
        if ((currentChunk + "\n" + line).length > max) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = line;
        } else {
          currentChunk = currentChunk ? `${currentChunk}\n${line}` : line;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
      const parts = await Promise.all(
        chunks.map(async (chunk) => {
          const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=id&dt=t&q=${encodeURIComponent(chunk)}`);
          if (!response.ok) throw new Error("translate failed");
          const payload = (await response.json()) as unknown as Array<Array<[string, ...unknown[]]>>;
          return (payload[0] ?? []).map((segment) => segment[0]).join("");
        }),
      );
      setTranslated(parts.join("\n"));
      toast("Lirik diterjemahkan ke Bahasa Indonesia.");
    } catch {
      toast("Terjemahan gagal dimuat. Coba lagi.");
    } finally {
      setTranslating(false);
    }
  };

  const chips = ["Bersantai", "Senang", "Sedih", "Romansa", "Perjalanan", "Mengisi energi", "Fokus", "Workout", "Party"];
  const quickPicks = unique([...getTracksByTag("Viral Now"), ...getTracksByTag("Top Indonesia")]).slice(0, 6);
  const topSongs = unique([...getTracksByTag("Top Global"), ...getTracksByTag("Rekomendasi")]).slice(0, 10);
  const samples = musicCatalog.slice(0, 8);
  const suggestions = query.trim() ? unique([query, `${query} remix`, `${query} slowed`, `${query} lirik`, `${query} cover`, `${query} karaoke`, `${query} 1 jam`, `${query} tiktok version`, `${query} live`, `${query} dj`]).slice(0, 12) : [];
  const likeCount = formatCount(hashNum(current.youtubeId, 90000) / 1000 + 12);
  const commentCount = hashNum(current.youtubeId + "c", 900) + 40;
  const shareCount = formatCount(hashNum(current.youtubeId + "s", 20000) / 1000 + 2);

  const bridgeProps = {
    videoId: current.youtubeId,
    isPlaying: playing,
    volume,
    seekTo,
    seekVersion,
    onProgress,
    onEnded,
    onPlayStateChange: setPlaying,
    onError: handlePlayerError,
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#030303] text-white">
      <PwaInstallPrompt onToast={toast} />
      <AnimatePresence>
        {showSplash ? (
          <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-[#030303]" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <Image src="/icons/mymusik-logo.svg" width={112} height={112} priority alt="MyMusik" className="mx-auto rounded-full shadow-[0_0_70px_rgba(255,0,0,0.45)]" />
              <h1 className="mt-6 text-5xl font-bold tracking-tight">MyMusik</h1>
              <p className="mt-2 text-zinc-400">Streaming Musik Modern</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-zinc-500">Developed by BimzOfficial</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className="sticky top-0 z-40 flex items-center justify-between bg-[#030303] px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/mymusik-logo.svg" width={34} height={34} alt="MyMusik" className="rounded-full" />
          <span className="text-xl font-semibold">Music</span>
        </Link>
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => toast("Notifikasi siap diaktifkan")} aria-label="Notifikasi"><Icon d="bell" /></button>
          <button onClick={() => { setTab("telusuri"); setPlayerOpen(false); }} aria-label="Telusuri"><Icon d="telusuri" /></button>
          <button onClick={() => setAccountOpen(true)} aria-label="Akun" className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-sm font-bold capitalize">
            {authed?.name?.[0] ?? "B"}
          </button>
        </div>
      </header>

      <main className={`pb-40 ${tab === "home" ? "block" : "hidden"}`}>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {chips.map((chip) => (
            <button key={chip} onClick={() => { setQuery(chip); setTab("telusuri"); }} className="shrink-0 rounded-lg bg-[#272727] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3a3a3a]">
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#272727] text-sm font-bold">B</span>
          <h2 className="text-xl font-semibold">Selamat datang{authed ? ` ${authed.name}` : " di MyMusik"}</h2>
        </div>

        <div className="px-4">
          <div className="relative overflow-hidden rounded-2xl bg-[#4a1d24] p-5">
            <div className="absolute inset-y-0 right-0 w-[42%] overflow-hidden">
              <div className="animate-marquee flex h-full w-max items-center gap-2 pr-2">
                {[...topArtists, ...topArtists].map((artist, index) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={`${artist.id}-${index}`} src={artist.image} alt="" loading="lazy" className={`h-20 w-16 shrink-0 rounded-lg bg-zinc-800 object-cover shadow-lg ${index % 2 ? "rotate-6" : "-rotate-6"}`} />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#4a1d24] via-transparent to-transparent" />
            </div>
            <p className="relative max-w-[55%] text-lg font-medium leading-6">Temukan lagu baru di feed video Anda</p>
            <button onClick={playRandom} className="relative mt-8 grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/10" aria-label="Putar acak">
              <Icon d="play" className="h-5 w-5" fill />
            </button>
          </div>
        </div>

        {recentTracks.length ? (
          <section className="mt-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-semibold">Baru diputar</h3>
              <button onClick={() => setTab("koleksi")} className="text-sm text-zinc-400">Lihat semua</button>
            </div>
            <div className="no-scrollbar mt-3 flex snap-x gap-4 overflow-x-auto px-4">
              {recentTracks.slice(0, 12).map((track) => (
                <button key={track.id} onClick={() => play(track)} className="w-44 shrink-0 snap-start text-left">
                  <div className="relative overflow-hidden rounded-xl bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={track.cover} alt="" loading="lazy" className="aspect-square w-full bg-zinc-800 object-cover" />
                    {current.id === track.id && playing ? (
                      <span className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-black/70"><Icon d="wave" className="h-4 w-4 text-white" /></span>
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-white">{track.title}</p>
                  <p className="truncate text-xs text-zinc-400">{track.artist}</p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6 px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Pilihan cepat</h3>
            <button onClick={() => playAll(quickPicks)} className="rounded-lg border border-white/25 px-4 py-1.5 text-sm font-medium transition hover:bg-white/10">Putar semua</button>
          </div>
          <div className="no-scrollbar -mx-4 mt-3 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {quickPicks.map((track) => (
              <div key={track.id} className="w-[82%] max-w-sm shrink-0 snap-start rounded-xl bg-[#121212]">
                <RowItem track={track} onPlay={play} onMenu={() => toast(`Diputar berikutnya: ${track.title}`)} />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 px-4">
          <button onClick={() => playAll(topSongs)} className="flex w-full items-center justify-between rounded-2xl bg-[#40e0f0] p-5 text-left text-black transition hover:brightness-105">
            <span className="max-w-[62%] text-lg font-medium leading-6">2026 sejauh ini: lagu-lagu terpopuler</span>
            <span className="text-2xl">→</span>
          </button>
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-semibold">Lagu teratas</h3>
            <button onClick={() => setTab("telusuri")} className="text-zinc-300" aria-label="Lihat semua">›</button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4">
            {topSongs.map((track) => <Card key={track.id} track={track} onPlay={play} wide />)}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="px-4 text-xl font-semibold">Artis populer</h3>
          <div className="no-scrollbar mt-3 flex gap-5 overflow-x-auto px-4">
            {dailyArtists.map((artist) => (
              <button key={artist.id} onClick={() => void openArtist(artist.name)} className="w-28 shrink-0 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={artist.image} alt={artist.name} loading="lazy" className="aspect-square w-full rounded-full bg-zinc-800 object-cover" />
                <p className="mt-2 truncate text-sm font-medium">{artist.name}</p>
                <p className="truncate text-xs text-zinc-400">{artist.monthlyListeners}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 pb-4">
          <h3 className="px-4 text-xl font-semibold">Viral di Indonesia</h3>
          <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-4">
            {getTracksByTag("Viral Now").map((track) => <Card key={track.id} track={track} onPlay={play} />)}
          </div>
        </section>
      </main>

      <main className={`pb-40 ${tab === "sampel" ? "block" : "hidden"}`}>
        <h2 className="px-4 pb-3 text-2xl font-semibold">Sampel</h2>
        <div className="grid grid-cols-2 gap-3 px-4">
          {samples.map((track) => (
            <button key={track.id} onClick={() => play(track)} className="relative overflow-hidden rounded-xl bg-zinc-900 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.cover} alt="" loading="lazy" className="aspect-[9/12] w-full bg-zinc-800 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="truncate text-sm font-semibold">{track.title}</p>
                <p className="truncate text-xs text-zinc-300">{track.artist}</p>
              </div>
              <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 backdrop-blur"><Icon d="play" className="h-4 w-4" fill /></span>
            </button>
          ))}
        </div>
      </main>

      <main className={`pb-40 ${tab === "telusuri" ? "block" : "hidden"}`}>
        <div className="sticky top-[58px] z-30 bg-[#030303] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-[#272727] px-4 py-3">
              <button onClick={() => { setQuery(""); setTab("home"); }} aria-label="Kembali" className="text-white"><Icon d="back" className="h-5 w-5" /></button>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari lagu, artis, atau lirik"
                className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-zinc-400"
              />
              <button aria-label="Suara" className="text-white"><Icon d="mic" className="h-5 w-5" /></button>
            </div>
            <button onClick={() => runSearch(query)} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#272727]" aria-label="Cari"><Icon d="wave" className="h-5 w-5" /></button>
          </div>
        </div>

        {query.trim() && !searching && results.length ? (
          <div className="px-2">
            {suggestions.slice(0, 2).map((suggestion) => (
              <button key={suggestion} onClick={() => setQuery(suggestion)} className="flex w-full items-center gap-4 px-3 py-3 text-left hover:bg-white/5">
                <Icon d="telusuri" className="h-5 w-5 text-zinc-300" />
                <span className="flex-1 truncate text-[15px]">{suggestion}</span>
                <Icon d="up" className="h-5 w-5 text-zinc-400" />
              </button>
            ))}
            <div className="mt-1 space-y-1 border-t border-white/10 pt-2">
              {results.map((track) => <RowItem key={track.id} track={track} onPlay={play} onMenu={() => toast(`Diputar berikutnya: ${track.title}`)} />)}
            </div>
            <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
              {suggestions.slice(2).map((suggestion) => (
                <button key={suggestion} onClick={() => setQuery(suggestion)} className="flex w-full items-center gap-4 px-3 py-3 text-left hover:bg-white/5">
                  <Icon d="telusuri" className="h-5 w-5 text-zinc-300" />
                  <span className="flex-1 truncate text-[15px]">{suggestion}</span>
                  <Icon d="up" className="h-5 w-5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        ) : query.trim() && searching ? (
          <div className="space-y-3 px-4 pt-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="shimmer h-12 w-12 rounded-md bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-2/3 rounded bg-zinc-800" />
                  <div className="shimmer h-3 w-1/3 rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 pt-6">
            <h3 className="text-lg font-semibold">Telusuri genre</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {["Pop", "Dangdut", "Hip Hop", "K-Pop", "Lo-fi", "EDM", "Rock", "Religi"].map((genre, index) => (
                <button key={genre} onClick={() => setQuery(genre)} className={`rounded-xl p-5 text-left text-lg font-semibold ${["bg-[#4a1d24]", "bg-[#123a2a]", "bg-[#27274a]", "bg-[#3a2a12]", "bg-[#12303a]", "bg-[#3a1230]", "bg-[#203a12]", "bg-[#2a123a]"][index % 8]}`}>
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <main className={`pb-40 ${tab === "koleksi" ? "block" : "hidden"}`}>
        <h2 className="px-4 pb-3 text-2xl font-semibold">Koleksi</h2>
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          <Link href="/admin" className="rounded-lg bg-[#272727] px-4 py-2 text-sm font-medium">Playlist & Admin</Link>
          <Link href="/about" className="rounded-lg bg-[#272727] px-4 py-2 text-sm font-medium">Developer</Link>
          <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="rounded-lg bg-[#272727] px-4 py-2 text-sm font-medium">Dapatkan APK</a>
        </div>
        <p className="px-4 pb-2 text-xs leading-5 text-zinc-500">Install sebagai aplikasi dari menu browser, atau bungkus jadi APK Android via PWABuilder setelah deploy. Musik tetap lanjut saat layar mati atau aplikasi diminimize.</p>
        <div className="px-2">
          {favoriteTracks.length ? favoriteTracks.map((track) => <RowItem key={track.id} track={track} onPlay={play} onMenu={() => toast(`Diputar berikutnya: ${track.title}`)} />) : (
            <div className="px-6 py-10 text-center text-zinc-400">Belum ada lagu yang disimpan. Ketuk ikon simpan pada lagu untuk menambahkannya ke sini.</div>
          )}
          {recentTracks.length ? (
            <>
              <h3 className="px-3 pb-1 pt-5 text-lg font-semibold">Terakhir diputar (tersimpan offline)</h3>
              {recentTracks.slice(0, 8).map((track) => <RowItem key={`r-${track.id}`} track={track} onPlay={play} onMenu={() => toast(`Diputar berikutnya: ${track.title}`)} />)}
            </>
          ) : null}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-[#212121]">
        <button onClick={() => started && setPlayerOpen(true)} className="flex w-full items-center gap-3 px-3 py-2 text-left">
          {started ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={current.cover} alt="" className="h-11 w-11 rounded bg-zinc-700 object-cover" />
          ) : (
            <span className="h-11 w-11 rounded bg-[#3a3a3a]" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{started ? current.title : "Tidak ada yang diputar"}</span>
            {started ? <span className="block truncate text-xs text-zinc-400">{current.artist}</span> : null}
          </span>
          <span className="text-zinc-300"><Icon d="cast" className="h-6 w-6" /></span>
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => { event.stopPropagation(); if (started) setPlaying((value) => !value); else playRandom(); }}
            onKeyDown={(event) => { if (event.key === "Enter") { event.stopPropagation(); if (started) setPlaying((value) => !value); else playRandom(); } }}
            className="p-2 text-white"
            aria-label={playing ? "Jeda" : "Putar"}
          >
            <Icon d={started && playing ? "pause" : "play"} className="h-7 w-7" fill={!(started && playing)} />
          </span>
        </button>
        {started ? <div className="h-0.5 w-full bg-white/15"><div className="h-full bg-white transition-[width] duration-300" style={{ width: `${progress}%` }} /></div> : null}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/10 bg-[#0f0f0f]">
        {([["home", "Beranda", "home"], ["sampel", "Sampel", "sampel"], ["telusuri", "Telusuri", "telusuri"], ["koleksi", "Koleksi", "koleksi"]] as const).map(([key, label, icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex flex-col items-center gap-1 py-2 text-[11px] ${tab === key ? "text-white" : "text-zinc-400"}`}>
            <Icon d={icon} className="h-6 w-6" />
            {label}
            <span className={`h-0.5 w-8 rounded-full ${tab === key ? "bg-white" : "bg-transparent"}`} />
          </button>
        ))}
        <Link href="/about" className="flex flex-col items-center gap-1 py-2 text-[11px] text-zinc-400">
          <Icon d="up" className="h-6 w-6" />
          Developer
          <span className="h-0.5 w-8 rounded-full bg-transparent" />
        </Link>
      </nav>

      {authed && !(playerOpen && videoMode) ? (
        <div className="pointer-events-none fixed -bottom-[1200px] left-0 h-32 w-56 opacity-0" aria-hidden="true">
          <YouTubePlayerBridge {...bridgeProps} startAt={started ? position : 0} />
        </div>
      ) : null}

      <AnimatePresence>
        {playerOpen && started ? (
          <motion.div
            className="fixed inset-0 z-[80] flex flex-col overflow-hidden text-white"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            style={{ background: "linear-gradient(180deg,#3a1220 0%,#1e0b13 48%,#0d0508 100%)" }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => setPlayerOpen(false)} aria-label="Tutup"><Icon d="down" className="h-7 w-7" /></button>
              <div className="flex items-center rounded-full bg-black/40 p-1">
                <button onClick={() => setVideoMode(false)} className={`grid h-9 w-9 place-items-center rounded-full ${!videoMode ? "bg-[#432634] text-white" : "text-zinc-400"}`} aria-label="Audio"><Icon d="headphones" className="h-5 w-5" /></button>
                <button onClick={() => setVideoMode(true)} className={`grid h-9 w-9 place-items-center rounded-full ${videoMode ? "bg-[#432634] text-white" : "text-zinc-400"}`} aria-label="Video"><Icon d="video" className="h-5 w-5" /></button>
              </div>
              <div className="flex items-center gap-4">
                <Icon d="cast" className="h-6 w-6" />
                <Icon d="more" className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
              {videoMode ? (
                <div className="overflow-hidden rounded-xl">
                  <YouTubePlayerBridge {...bridgeProps} startAt={position} />
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={current.cover} alt="" className="aspect-square w-full rounded-xl bg-zinc-800 object-cover shadow-2xl" />
              )}

              <div className="mt-10 flex items-center gap-2">
                <h2 className="truncate text-2xl font-bold">{current.title}</h2>
                <Icon d="chevron" className="h-5 w-5 shrink-0 text-zinc-400" />
              </div>
              <button onClick={() => void openArtist(current.artist, current.title)} className="mt-1 text-left text-lg text-zinc-300 transition hover:text-white">{current.artist}</button>

              <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
                <button onClick={toggleLike} className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium"><Icon d="like" className="h-4 w-4" />{likedIds.includes(current.id) ? "Disukai" : likeCount}</button>
                <button className="shrink-0 rounded-lg bg-white/10 px-3 py-2.5" aria-label="Tidak suka"><Icon d="dislike" className="h-4 w-4" /></button>
                <button onClick={() => setLyricsOpen(true)} className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium"><Icon d="quote" className="h-4 w-4" />Lirik</button>
                <button className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium"><Icon d="comment" className="h-4 w-4" />{commentCount}</button>
                <button onClick={() => toggleFavorite(current)} className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium"><Icon d="save" className="h-4 w-4" />{favorites.includes(current.id) ? "Tersimpan" : "Simpan"}</button>
                <button onClick={() => void shareApp()} className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium"><Icon d="share" className="h-4 w-4" />{shareCount}</button>
              </div>

              <div className="mt-7">
                <input aria-label="Posisi lagu" type="range" min={0} max={playerDuration || current.seconds} value={Math.min(position, playerDuration || current.seconds)} onChange={(event) => seek(Number(event.target.value))} className="accent-brand h-1 w-full" style={{ background: `linear-gradient(90deg,#fff ${progress}%,rgba(255,255,255,0.25) ${progress}%)` }} />
                <div className="mt-1 flex justify-between text-xs text-zinc-400">
                  <span>{formatTime(position)}</span>
                  <span>{formatTime(playerDuration || current.seconds)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between px-1">
                <button onClick={() => setShuffle((value) => !value)} className={shuffle ? "text-red-400" : "text-white"} aria-label="Acak"><Icon d="shuffle" className="h-6 w-6" /></button>
                <button onClick={previous} aria-label="Sebelumnya"><Icon d="prev" className="h-8 w-8" fill /></button>
                <button onClick={() => setPlaying((value) => !value)} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black" aria-label={playing ? "Jeda" : "Putar"}>
                  <Icon d={playing ? "pause" : "play"} className="h-8 w-8" fill />
                </button>
                <button onClick={next} aria-label="Berikutnya"><Icon d="next" className="h-8 w-8" fill /></button>
                <button onClick={() => setRepeat((value) => !value)} className={repeat ? "text-red-400" : "text-white"} aria-label="Ulangi"><Icon d="repeat" className="h-6 w-6" /></button>
              </div>

              {mixQueue.length ? (
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-300">Mix berikutnya</h3>
                    <button onClick={() => void prefetchMix(current, 20, `${current.genre} ${current.artist} serupa`)} className="text-xs font-medium text-zinc-400 transition hover:text-white">+ Tambah</button>
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {mixQueue.slice(0, 8).map((track, index) => (
                      <div key={track.youtubeId} className="flex items-center gap-3 rounded-xl bg-white/5 px-2 py-1.5">
                        <span className="w-4 text-center text-xs text-zinc-500">{index + 1}</span>
                        <button
                          onClick={() => {
                            const rest = mixQueueRef.current.filter((t) => t.youtubeId !== track.youtubeId);
                            mixQueueRef.current = rest;
                            setMixQueue(rest);
                            startTrack(track, true);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={track.cover} alt="" className="h-10 w-10 shrink-0 rounded-md bg-zinc-800 object-cover" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{track.title}</span>
                            <span className="block truncate text-xs text-zinc-400">{track.artist}</span>
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            const rest = mixQueueRef.current.filter((t) => t.youtubeId !== track.youtubeId);
                            mixQueueRef.current = rest;
                            setMixQueue(rest);
                          }}
                          className="p-1.5 text-zinc-400 transition hover:text-white"
                          aria-label="Hapus dari mix"
                        >
                          <Icon d="close" className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-9 flex flex-col items-center gap-2">
                <span className="h-1 w-10 rounded-full bg-white/40" />
                <p className="text-sm font-medium">{mixLabel || `Mix ${current.title}`}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {lyricsOpen ? (
          <motion.div className="fixed inset-0 z-[90] flex flex-col" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 36 }}>
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.cover} alt="" className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 scale-[7] object-cover blur-2xl" />
              <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative flex items-center gap-3 px-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.cover} alt="" className="h-10 w-10 rounded bg-zinc-700 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{current.title}</span>
                <span className="block truncate text-xs text-zinc-300">{current.artist}</span>
              </span>
              <Icon d="cast" className="h-6 w-6" />
              <button onClick={() => setPlaying((value) => !value)} aria-label={playing ? "Jeda" : "Putar"}><Icon d={playing ? "pause" : "play"} className="h-7 w-7" fill={!playing} /></button>
            </div>
            <div className="relative flex items-center justify-between border-t border-white/15 px-4 py-3">
              <h3 className="text-xl font-semibold">Lirik</h3>
              <button onClick={() => setLyricsOpen(false)} aria-label="Tutup lirik"><Icon d="close" className="h-6 w-6" /></button>
            </div>
            <div className="no-scrollbar relative flex-1 overflow-y-auto px-6 pb-32 pt-4">
              {lyrics.loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => <div key={index} className="shimmer h-7 w-4/5 rounded bg-white/10" />)}
                </div>
              ) : lyrics.missing || !lyrics.lines.length ? (
                <div className="pt-10 text-center">
                  <p className="text-xl font-semibold text-white">Lirik belum tersedia</p>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/60">Lirik untuk lagu ini belum ada di penyedia lirik resmi. Coba lagu lain atau periksa kembali nanti.</p>
                </div>
              ) : translated ? (
                <p className="whitespace-pre-line text-lg leading-9 text-white/85">{translated}</p>
              ) : (
                <LyricLines
                  lines={lyrics.lines}
                  active={activeLyric}
                  registerRef={(index, el) => {
                    lyricRefs.current[index] = el;
                  }}
                />
              )}
            </div>
            <div className="relative flex flex-wrap justify-center gap-3 pb-8">
              <button onClick={() => void shareApp()} className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium backdrop-blur"><Icon d="share" className="h-4 w-4" />Bagikan</button>
              {translated ? (
                <button onClick={() => setTranslated("")} className="flex items-center gap-2 rounded-full bg-white/25 px-5 py-2.5 text-sm font-medium backdrop-blur"><Icon d="back" className="h-4 w-4" />Kembalikan seperti semula</button>
              ) : (
                <button onClick={() => void translateLyrics()} disabled={translating} className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium backdrop-blur disabled:opacity-50"><Icon d="translate" className="h-4 w-4" />{translating ? "Menerjemahkan..." : "Terjemahkan"}</button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!showSplash && !authed ? (
        <LoginGate
          onLogin={(user) => {
            storage.set("mymusik-auth", user);
            setAuthed(user);
          }}
        />
      ) : null}

      <AnimatePresence>
        {artistName ? <ArtistModal name={artistName} results={artistResults} loading={artistLoading} onClose={() => setArtistName(null)} onPlay={play} /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {accountOpen && authed ? (
          <motion.div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAccountOpen(false)}>
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#121212] p-6 pb-10"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#ff0000] text-2xl font-bold capitalize text-white">{authed.name[0]}</span>
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold capitalize">{authed.name}</h3>
                  <p className="truncate text-sm text-zinc-400">{authed.email}</p>
                  <p className="mt-1 text-xs text-zinc-500">Masuk dengan Google{authed.since ? ` • sejak ${new Date(authed.since).toLocaleDateString("id-ID")}` : ""}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/5 p-3"><p className="text-lg font-bold">{favorites.length}</p><p className="text-xs text-zinc-400">Favorit</p></div>
                <div className="rounded-2xl bg-white/5 p-3"><p className="text-lg font-bold">{recently.length}</p><p className="text-xs text-zinc-400">Riwayat</p></div>
                <div className="rounded-2xl bg-white/5 p-3"><p className="text-lg font-bold">{likedIds.length}</p><p className="text-xs text-zinc-400">Disukai</p></div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-6 text-zinc-300">
                Akun ini tersimpan aman di perangkat. Di mode aplikasi, musik tetap diputar di latar belakang tanpa iklan dari MyMusik.
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("mymusik-auth");
                  setAuthed(null);
                  setAccountOpen(false);
                }}
                className="mt-5 w-full rounded-xl bg-[#ff0000] py-3 font-semibold text-white"
              >
                Keluar
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="pointer-events-none fixed left-1/2 top-16 z-[95] -translate-x-1/2 space-y-2">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="rounded-lg bg-[#3a3a3a] px-4 py-2.5 text-sm font-medium shadow-xl">
              {item.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
