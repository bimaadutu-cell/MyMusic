import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Song, Playlist, PlayHistory, User, Artist } from '@/types';

interface MusicState {
  // Player State
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  
  // Queue
  queue: Song[];
  originalQueue: Song[];
  history: PlayHistory[];
  
  // Settings
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  
  // User Data
  user: User | null;
  favorites: Song[];
  playlists: Playlist[];
  recentlyPlayed: PlayHistory[];
  searchHistory: string[];
  
  // Current View
  currentArtist: Artist | null;
  currentMix: Song[] | null;
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsBuffering: (buffering: boolean) => void;
  
  // Queue Actions
  setQueue: (songs: Song[]) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextSong: () => Song | null;
  previousSong: () => Song | null;
  
  // Shuffle & Repeat
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  
  // Favorites
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;
  
  // Playlists
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  
  // History
  addToHistory: (song: Song, progress: number) => void;
  clearHistory: () => void;
  
  // Search History
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // User
  setUser: (user: User | null) => void;
  setPremium: (isPremium: boolean) => void;
  
  // Mix
  setCurrentMix: (songs: Song[] | null) => void;
  generateMix: (basedOn: Song, allSongs: Song[]) => Song[];
  
  // Artist
  setCurrentArtist: (artist: Artist | null) => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSong: null,
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      queue: [],
      originalQueue: [],
      history: [],
      isShuffle: false,
      repeatMode: 'none',
      user: null,
      favorites: [],
      playlists: [],
      recentlyPlayed: [],
      searchHistory: [],
      currentArtist: null,
      currentMix: null,
      
      // Setters
      setCurrentSong: (song) => {
        set({ currentSong: song, currentTime: 0 });
        if (song) {
          get().addToHistory(song, 0);
        }
      },
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      setCurrentTime: (time) => set({ currentTime: time }),
      
      setDuration: (duration) => set({ duration }),
      
      setIsBuffering: (buffering) => set({ isBuffering: buffering }),
      
      // Queue
      setQueue: (songs) => {
        set({ 
          queue: songs, 
          originalQueue: songs,
          currentMix: songs 
        });
      },
      
      addToQueue: (song) => set((state) => ({ 
        queue: [...state.queue, song] 
      })),
      
      removeFromQueue: (index) => set((state) => ({
        queue: state.queue.filter((_, i) => i !== index)
      })),
      
      clearQueue: () => set({ queue: [], originalQueue: [] }),
      
      nextSong: () => {
        const { queue, currentSong, repeatMode } = get();
        if (queue.length === 0) return null;
        
        if (repeatMode === 'one' && currentSong) {
          return currentSong;
        }
        
        const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
        const nextIndex = (currentIndex + 1) % queue.length;
        
        if (nextIndex === 0 && repeatMode === 'none') {
          return null;
        }
        
        const nextSong = queue[nextIndex];
        set({ currentSong: nextSong, currentTime: 0 });
        get().addToHistory(nextSong, 0);
        return nextSong;
      },
      
      previousSong: () => {
        const { queue, currentSong, history } = get();
        if (history.length > 1) {
          const prev = history[history.length - 2];
          set({ currentSong: prev.song, currentTime: prev.progress });
          return prev.song;
        }
        
        const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
        if (currentIndex > 0) {
          const prevSong = queue[currentIndex - 1];
          set({ currentSong: prevSong, currentTime: 0 });
          return prevSong;
        }
        return null;
      },
      
      // Shuffle & Repeat
      toggleShuffle: () => {
        set((state) => {
          const newShuffle = !state.isShuffle;
          if (newShuffle) {
            const shuffled = [...state.originalQueue].sort(() => Math.random() - 0.5);
            return { isShuffle: true, queue: shuffled };
          }
          return { isShuffle: false, queue: state.originalQueue };
        });
      },
      
      toggleRepeat: () => set((state) => {
        const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(state.repeatMode);
        return { repeatMode: modes[(currentIndex + 1) % 3] };
      }),
      
      // Favorites
      toggleFavorite: (song) => set((state) => {
        const exists = state.favorites.find(s => s.id === song.id);
        if (exists) {
          return { favorites: state.favorites.filter(s => s.id !== song.id) };
        }
        return { favorites: [...state.favorites, song] };
      }),
      
      isFavorite: (songId) => {
        return get().favorites.some(s => s.id === songId);
      },
      
      // Playlists
      createPlaylist: (name, description) => {
        const playlist: Playlist = {
          id: Date.now().toString(),
          name,
          description,
          cover: '/default-playlist.png',
          songs: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        set((state) => ({ playlists: [...state.playlists, playlist] }));
        return playlist;
      },
      
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      
      addToPlaylist: (playlistId, song) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId 
            ? { ...p, songs: [...p.songs, song], updatedAt: Date.now() }
            : p
        )
      })),
      
      removeFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === playlistId 
            ? { ...p, songs: p.songs.filter(s => s.id !== songId), updatedAt: Date.now() }
            : p
        )
      })),
      
      // History
      addToHistory: (song, progress) => set((state) => {
        const entry: PlayHistory = { song, playedAt: Date.now(), progress };
        const filtered = state.recentlyPlayed.filter(h => h.song.id !== song.id);
        return { 
          recentlyPlayed: [entry, ...filtered].slice(0, 50),
          history: [...state.history.slice(-19), entry]
        };
      }),
      
      clearHistory: () => set({ recentlyPlayed: [], history: [] }),
      
      // Search History
      addSearchHistory: (query) => set((state) => {
        const filtered = state.searchHistory.filter(q => q !== query);
        return { searchHistory: [query, ...filtered].slice(0, 10) };
      }),
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      // User
      setUser: (user) => set({ user }),
      
      setPremium: (isPremium) => set((state) => ({
        user: state.user ? { ...state.user, isPremium } : null
      })),
      
      // Mix
      setCurrentMix: (songs) => set({ currentMix: songs }),
      
      generateMix: (basedOn, allSongs) => {
        // Generate mix based on song genre/mood
        const similarSongs = allSongs.filter(s => 
          s.id !== basedOn.id && 
          (s.genre === basedOn.genre || s.artist === basedOn.artist)
        );
        
        // If not enough similar songs, add random songs
        const mix = [...similarSongs];
        while (mix.length < 15 && mix.length < allSongs.length) {
          const random = allSongs[Math.floor(Math.random() * allSongs.length)];
          if (!mix.find(s => s.id === random.id) && random.id !== basedOn.id) {
            mix.push(random);
          }
        }
        
        const shuffled = mix.sort(() => Math.random() - 0.5).slice(0, 15);
        set({ currentMix: shuffled });
        return shuffled;
      },
      
      // Artist
      setCurrentArtist: (artist) => set({ currentArtist: artist }),
    }),
    {
      name: 'mymusik-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        favorites: state.favorites,
        playlists: state.playlists,
        recentlyPlayed: state.recentlyPlayed,
        searchHistory: state.searchHistory,
        user: state.user,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      })
    }
  )
);