import { Song, Artist, SearchResult } from '@/types';

// YouTube Music API Integration
const YOUTUBE_MUSIC_API = 'https://music.youtube.com/youtubei/v1';
const INNERTUBE_API_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30'; // Public API key for YouTube Music

// Cache untuk hasil pencarian
const searchCache = new Map<string, { results: SearchResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

// CORS Proxy untuk thumbnail
const CORS_PROXIES = [
  'https://images.weserv.nl/?url=',
  'https://wsrv.nl/?url=',
];

export function getProxiedImageUrl(originalUrl: string): string {
  if (!originalUrl) return '/default-cover.png';
  
  // Jika sudah menggunakan proxy, jangan proses lagi
  if (originalUrl.includes('weserv.nl') || originalUrl.includes('wsrv.nl')) {
    return originalUrl;
  }
  
  // Encode URL untuk proxy
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${CORS_PROXIES[0]}${encodedUrl}&w=600&h=600&fit=cover`;
}

// Interface untuk hasil pencarian YouTube
interface YouTubeSearchResult {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: string;
  views?: string;
}

// Fungsi pencarian YouTube Music
export async function searchYouTubeMusic(query: string): Promise<SearchResult> {
  // Cek cache dulu
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }

  try {
    const response = await fetch(`${YOUTUBE_MUSIC_API}/search?key=${INNERTUBE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20230701.01.00',
          },
        },
        query: query,
        params: 'EgWKAQIIAWoQEAMQBBAJEAoQCRADEAQQDw%3D%3D', // Filter untuk music only
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from YouTube Music');
    }

    const data = await response.json();
    const results = parseYouTubeMusicResults(data);
    
    // Simpan ke cache
    searchCache.set(query, { results, timestamp: Date.now() });
    
    return results;
  } catch (error) {
    console.error('YouTube Music search error:', error);
    // Fallback ke pencarian lokal
    return searchLocalSongs(query);
  }
}

// Parse hasil dari YouTube Music
function parseYouTubeMusicResults(data: any): SearchResult {
  const songs: Song[] = [];
  const artists: Artist[] = [];

  try {
    const contents = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    for (const section of contents) {
      // Parse video/music items
      const musicShelf = section.musicShelfRenderer || section.itemSectionRenderer;
      if (!musicShelf) continue;

      const items = musicShelf.contents || [];

      for (const item of items) {
        const videoRenderer = item.musicResponsiveListItemRenderer;
        if (!videoRenderer) continue;

        const videoId = videoRenderer.playlistItemData?.videoId || 
                       videoRenderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId;

        if (!videoId) continue;

        // Extract title
        const titleRuns = videoRenderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
        const title = titleRuns?.[0]?.text || 'Unknown Title';

        // Extract artist
        const artistRuns = videoRenderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
        const artist = artistRuns?.find((run: any) => run.navigationEndpoint)?.text || 
                      artistRuns?.[0]?.text || 'Unknown Artist';

        // Extract thumbnail
        const thumbnails = videoRenderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
        const thumbnail = thumbnails[thumbnails.length - 1]?.url || '';

        // Extract duration
        const durationText = videoRenderer.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const duration = durationText || '0:00';

        // Extract views
        const viewText = videoRenderer.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[2]?.text;
        const views = viewText?.replace(/[^0-9KM]/g, '') || '0';

        songs.push({
          id: videoId,
          title: title,
          artist: artist,
          album: title,
          cover: getProxiedImageUrl(thumbnail),
          duration: duration,
          durationSeconds: parseDuration(duration),
          videoId: videoId,
          views: views,
          genre: 'Unknown',
          lyrics: [],
        });
      }
    }

    // Extract unique artists
    const artistMap = new Map<string, Artist>();
    songs.forEach(song => {
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          id: `artist-${song.artist}`,
          name: song.artist,
          cover: song.cover,
          topSongs: [],
        });
      }
      const artist = artistMap.get(song.artist)!;
      if (artist.topSongs!.length < 5) {
        artist.topSongs!.push(song);
      }
    });

    return {
      songs: songs.slice(0, 20),
      artists: Array.from(artistMap.values()).slice(0, 10),
      albums: [],
      playlists: [],
    };
  } catch (error) {
    console.error('Parse error:', error);
    return { songs: [], artists: [], albums: [], playlists: [] };
  }
}

// Fallback pencarian lokal
function searchLocalSongs(query: string): SearchResult {
  const { mockSongs, mockArtists } = require('./musicApi');
  const lowerQuery = query.toLowerCase();
  
  const songs = mockSongs.filter((s: Song) => 
    s.title.toLowerCase().includes(lowerQuery) ||
    s.artist.toLowerCase().includes(lowerQuery)
  );
  
  const artists = mockArtists.filter((a: Artist) => 
    a.name.toLowerCase().includes(lowerQuery)
  );

  return { songs, artists, albums: [], playlists: [] };
}

function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// Dapatkan audio URL untuk streaming
export function getAudioUrl(videoId: string): string {
  // Menggunakan ytdl-core atau similar service via API
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0`;
}

// Fungsi untuk mendapatkan lirik
export async function getLyrics(videoId: string, title: string, artist: string): Promise<string[]> {
  try {
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`);
    const data = await response.json();
    
    if (data && data.length > 0 && data[0].syncedLyrics) {
      return parseLRC(data[0].syncedLyrics);
    }
    return [];
  } catch (error) {
    console.error('Lyrics fetch error:', error);
    return [];
  }
}

function parseLRC(lrc: string): string[] {
  return lrc.split('\n')
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        return match[4].trim();
      }
      return '';
    })
    .filter(text => text);
}

// Get trending songs dari YouTube Music
export async function getTrendingSongs(): Promise<Song[]> {
  try {
    const result = await searchYouTubeMusic('trending music 2024 2025');
    return result.songs.slice(0, 10);
  } catch (error) {
    return [];
  }
}

// Get new releases
export async function getNewReleases(): Promise<Song[]> {
  try {
    const result = await searchYouTubeMusic('new releases 2024 2025');
    return result.songs.slice(0, 10);
  } catch (error) {
    return [];
  }
}