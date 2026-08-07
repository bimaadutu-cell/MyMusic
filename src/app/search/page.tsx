'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, X, Clock, TrendingUp, Mic } from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { searchYouTubeMusic, getProxiedImageUrl } from '@/lib/youtubeMusicApi';
import { Song, Artist } from '@/types';
import SongCard from '@/components/SongCard';
import ArtistCard from '@/components/ArtistCard';
import MusicPlayer from '@/components/MusicPlayer';
import AudioPlayer from '@/components/AudioPlayer';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { debounce } from '@/lib/utils';
import { mockSongs } from '@/lib/musicApi';

const trendingSearches = [
  'bergema selamanya',
  'astaga bercanda',
  'sesi potret',
  'sorry justin bieber',
  'penyangkalan',
  'utara selatan',
];

export default function SearchPage() {
  const router = useRouter();
  const { searchHistory, addSearchHistory, clearSearchHistory, setCurrentSong, setIsPlaying, setQueue } = useMusicStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ songs: Song[]; artists: Artist[] }>({ songs: [], artists: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const performSearch = useCallback(
    debounce(async (searchQuery: any) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const searchResults = await searchYouTubeMusic(searchQuery);
          setResults({
            songs: searchResults.songs,
            artists: searchResults.artists,
          });
          addSearchHistory(searchQuery);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults({ songs: [], artists: [] });
        setShowResults(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Add similar songs to queue
    const similar = mockSongs.filter(s => 
      s.id !== song.id && (s.genre === song.genre || s.artist === song.artist)
    ).slice(0, 10);
    setQueue([song, ...similar]);
  };

  const handleSearchClick = (term: string) => {
    setQuery(term);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505] safe-area-top">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari lagu, artis, atau album"
              className="w-full bg-white/10 rounded-full py-2.5 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF88]/50"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
          
          <button className="p-2">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-2">
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {isSearching ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF88]" />
                </div>
              ) : (
                <>
                  {/* Songs Results */}
                  {results.songs.length > 0 && (
                    <section className="mb-6">
                      <h2 className="text-lg font-semibold mb-3">Lagu</h2>
                      <div className="space-y-2">
                        {results.songs.map((song) => (
                          <SongCard
                            key={song.id}
                            song={song}
                            variant="horizontal"
                            onClick={() => handlePlaySong(song)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Artists Results */}
                  {results.artists.length > 0 && (
                    <section className="mb-6">
                      <h2 className="text-lg font-semibold mb-3">Artis</h2>
                      <div className="space-y-2">
                        {results.artists.map((artist) => (
                          <ArtistCard
                            key={artist.id}
                            artist={artist}
                            onClick={() => router.push('/artist')}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {results.songs.length === 0 && results.artists.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Tidak ada hasil untuk "{query}"</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Search History */}
              {searchHistory.length > 0 && (
                <section className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Riwayat Pencarian</h2>
                    <button 
                      onClick={clearSearchHistory}
                      className="text-[#00FF88] text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchClick(term)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm hover:bg-white/10"
                      >
                        <Clock className="w-4 h-4 text-gray-500" />
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending Searches */}
              <section>
                <h2 className="text-lg font-semibold mb-3">Sedang Populer</h2>
                <div className="space-y-1">
                  {trendingSearches.map((term, index) => (
                    <motion.button
                      key={term}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearchClick(term)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="flex-1">{term}</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden">
                        <img 
                          src={mockSongs[index % mockSongs.length]?.cover} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MusicPlayer />
      <AudioPlayer />
      <BottomNav />
    </div>
  );
}