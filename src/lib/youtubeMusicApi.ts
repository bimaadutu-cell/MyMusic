import { Song, Artist, SearchResult } from '@/types';

// Using a reliable YouTube Music API approach
const YTMUSIC_API_BASE = 'https://yt.lemnoslife.com';
const INVIDIOUS_INSTANCES = [
  'https://vid.puffyan.us',
  'https://inv.riverside.rocks',
  'https://invidious.snopyta.org',
  'https://y.com.sb',
];

// Cache for search results
const searchCache = new Map<string, { results: SearchResult; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Get proxied image URL with fallback
export function getProxiedImageUrl(originalUrl: string | undefined): string {
  if (!originalUrl || originalUrl === '') {
    return '/default-cover.png';
  }
  
  // If already proxied, return as is
  if (originalUrl.includes('weserv.nl') || originalUrl.includes('wsrv.nl')) {
    return originalUrl;
  }
  
  // Use weserv.nl as image proxy
  try {
    const encodedUrl = encodeURIComponent(originalUrl);
    return `https://wsrv.nl/?url=${encodedUrl}&w=600&h=600&fit=cover&output=webp`;
  } catch {
    return '/default-cover.png';
  }
}

// Search YouTube Music
export async function searchYouTubeMusic(query: string): Promise<SearchResult> {
  if (!query.trim()) {
    return { songs: [], artists: [], albums: [], playlists: [] };
  }

  // Check cache
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }

  try {
    // Try multiple Invidious instances
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const response = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&region=ID`,
          { 
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const results = parseInvidiousResults(data);
        
        // Cache results
        searchCache.set(query, { results, timestamp: Date.now() });
        return results;
      } catch (err) {
        console.warn(`Instance ${instance} failed:`, err);
        continue;
      }
    }

    // Fallback to local search
    return searchLocalFallback(query);
  } catch (error) {
    console.error('Search error:', error);
    return searchLocalFallback(query);
  }
}

// Parse Invidious API results
function parseInvidiousResults(data: any[]): SearchResult {
  const songs: Song[] = [];
  const artists: Map<string, Artist> = new Map();

  if (!Array.isArray(data)) {
    return { songs: [], artists: [], albums: [], playlists: [] };
  }

  for (const item of data) {
    if (item.type !== 'video') continue;

    const videoId = item.videoId;
    const title = item.title || 'Unknown Title';
    const author = item.author || 'Unknown Artist';
    const thumbnail = item.videoThumbnails?.[0]?.url || '';
    const lengthSeconds = item.lengthSeconds || 0;
    const viewCount = item.viewCount || 0;

    const song: Song = {
      id: videoId,
      title: title,
      artist: author,
      album: title,
      cover: getProxiedImageUrl(thumbnail),
      duration: formatDuration(lengthSeconds),
      durationSeconds: lengthSeconds,
      videoId: videoId,
      views: formatViews(viewCount),
      genre: 'Unknown',
      lyrics: [],
    };

    songs.push(song);

    // Collect unique artists
    if (!artists.has(author)) {
      artists.set(author, {
        id: `artist-${author.replace(/\s+/g, '-').toLowerCase()}`,
        name: author,
        cover: getProxiedImageUrl(thumbnail),
        topSongs: [song],
      });
    } else {
      const artist = artists.get(author)!;
      if (artist.topSongs!.length < 5) {
        artist.topSongs!.push(song);
      }
    }
  }

  return {
    songs: songs.slice(0, 20),
    artists: Array.from(artists.values()).slice(0, 10),
    albums: [],
    playlists: [],
  };
}

// Local fallback search
function searchLocalFallback(query: string): SearchResult {
  const { mockSongs, mockArtists } = require('./musicApi');
  const lowerQuery = query.toLowerCase();
  
  const songs = mockSongs.filter((s: Song) => 
    s.title.toLowerCase().includes(lowerQuery) ||
    s.artist.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
  
  const artists = mockArtists.filter((a: Artist) => 
    a.name.toLowerCase().includes(lowerQuery)
  );

  return { songs, artists, albums: [], playlists: [] };
}

// Get audio stream URL
export async function getAudioStreamUrl(videoId: string): Promise<string | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const response = await fetch(
        `${instance}/api/v1/videos/${videoId}`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) continue;

      const data = await response.json();
      
      // Find best audio format
      const audioFormats = data.adaptiveFormats?.filter((f: any) => 
        f.type?.startsWith('audio/')
      );

      if (audioFormats && audioFormats.length > 0) {
        // Sort by bitrate, highest first
        audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
        return audioFormats[0].url;
      }
    } catch (err) {
      console.warn(`Audio fetch failed for ${instance}:`, err);
      continue;
    }
  }
  return null;
}

// Get trending songs
export async function getTrendingSongs(): Promise<Song[]> {
  try {
    const result = await searchYouTubeMusic('trending music 2024');
    return result.songs.slice(0, 10);
  } catch {
    const { getTrendingSongs: getLocalTrending } = require('./musicApi');
    return getLocalTrending();
  }
}

// Get new releases
export async function getNewReleases(): Promise<Song[]> {
  try {
    const result = await searchYouTubeMusic('new releases 2024 2025');
    return result.songs.slice(0, 10);
  } catch {
    const { getNewReleases: getLocalNew } = require('./musicApi');
    return getLocalNew();
  }
}

// Format duration
function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format views
function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

// Get lyrics from LRCLIB
export async function getLyrics(title: string, artist: string): Promise<Array<{time: number, text: string}>> {
  try {
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) return [];

    const data = await response.json();
    
    if (data && data.length > 0 && data[0].syncedLyrics) {
      return parseLRC(data[0].syncedLyrics);
    }
    return [];
  } catch {
    return [];
  }
}

function parseLRC(lrc: string): Array<{time: number, text: string}> {
  const lines: Array<{time: number, text: string}> = [];
  
  lrc.split('\n').forEach(line => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0'));
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();
      
      if (text) {
        lines.push({ time, text });
      }
    }
  });
  
  return lines;
}

export function translateLyric(text: string, targetLang: 'id' | 'en'): string {
  const translations: Record<string, Record<string, string>> = {
    en: {
      'You gotta go and get angry': 'Kau harus pergi dan marah',
      'You know I try': 'Kau tahu aku mencoba',
      'Sorry': 'Maaf',
      'Love': 'Cinta',
      'Baby': 'Sayang',
    },
    id: {
      'Pusing': 'Dizzy',
      'Cinta': 'Love',
      'Rindu': 'Miss',
      'Sayang': 'Dear',
    }
  };
  
  for (const [key, value] of Object.entries(translations[targetLang] || {})) {
    if (text.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return `[${targetLang}] ${text}`;
}