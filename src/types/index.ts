export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  cover: string;
  duration: string;
  durationSeconds: number;
  year?: string;
  genre?: string;
  views?: string;
  videoId?: string;
  audioUrl?: string;
  lyrics?: LyricLine[];
}

export interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

export interface Artist {
  id: string;
  name: string;
  cover: string;
  subscribers?: string;
  description?: string;
  topSongs?: Song[];
  albums?: Album[];
  singles?: Album[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  cover: string;
  year?: string;
  songs?: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover: string;
  songs: Song[];
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isPremium?: boolean;
  premiumTrial?: boolean;
}

export interface SearchResult {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface Mix {
  id: string;
  title: string;
  description: string;
  cover: string;
  songs: Song[];
  basedOn?: Song;
}

export interface PlayHistory {
  song: Song;
  playedAt: number;
  progress: number;
}

export interface AppState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  queue: Song[];
  history: PlayHistory[];
  favorites: Song[];
  playlists: Playlist[];
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  user: User | null;
}