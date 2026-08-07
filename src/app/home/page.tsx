'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, Play, ChevronRight, Clock, TrendingUp } from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { mockSongs, mockArtists, getQuickPicks, getMoodCategories } from '@/lib/musicApi';
import { getTrendingSongs, getNewReleases } from '@/lib/youtubeMusicApi';
import { Song, Artist } from '@/types';
import SongCard from '@/components/SongCard';
import ArtistCard from '@/components/ArtistCard';
import MusicPlayer from '@/components/MusicPlayer';
import AudioPlayer from '@/components/AudioPlayer';
import BottomNav from '@/components/BottomNav';
import InstallPrompt from '@/components/InstallPrompt';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'relax', name: 'Bersantai', color: 'bg-blue-500' },
  { id: 'happy', name: 'Senang', color: 'bg-yellow-500' },
  { id: 'sad', name: 'Sedih', color: 'bg-purple-500' },
  { id: 'romance', name: 'Romansa', color: 'bg-red-500' },
  { id: 'travel', name: 'Perjalanan', color: 'bg-teal-500' },
  { id: 'energy', name: 'Energi', color: 'bg-orange-500' },
];

export default function HomePage() {
  const router = useRouter();
  const { user, recentlyPlayed, setCurrentSong, setIsPlaying, setQueue, setCurrentArtist } = useMusicStore();
  const [greeting, setGreeting] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

const setScrollRef = (key: string) => (el: HTMLDivElement | null) => {
  scrollRefs.current[key] = el;
};

  useEffect(() => {
    // Check if first time
    const hasSeenPremium = localStorage.getItem('mymusik-premium-seen');
    if (!hasSeenPremium) {
      setShowPremiumModal(true);
      localStorage.setItem('mymusik-premium-seen', 'true');
    }

    // Set greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat pagi');
    else if (hour < 17) setGreeting('Selamat siang');
    else if (hour < 20) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');

    // Load data from YouTube Music API
    const loadData = async () => {
      try {
        const [trending, releases] = await Promise.all([
          getTrendingSongs(),
          getNewReleases()
        ]);
        if (trending.length > 0) setTrendingSongs(trending);
        if (releases.length > 0) setNewReleases(releases);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
    setQuickPicks(getQuickPicks());
    setArtists(mockArtists);
  }, []);

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    // Generate mix based on song
    const mix = generateMix(song);
    setQueue([song, ...mix]);
  };

  const generateMix = (basedOn: Song): Song[] => {
    // Get songs with similar genre or artist
    const similar = mockSongs.filter(s => 
      s.id !== basedOn.id && 
      (s.genre === basedOn.genre || s.artist === basedOn.artist)
    );
    
    // Fill with random songs if needed
    const mix = [...similar];
    while (mix.length < 15) {
      const random = mockSongs[Math.floor(Math.random() * mockSongs.length)];
      if (!mix.find(s => s.id === random.id) && random.id !== basedOn.id) {
        mix.push(random);
      }
    }
    
    return mix.slice(0, 15);
  };

  const scroll = (section: string, direction: 'left' | 'right') => {
    const ref = scrollRefs.current[section];
    if (ref) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 safe-area-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">M</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">MyMusik</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/search')}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10"
            >
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#00FF88] rounded-full" />
            </button>
            <button className="w-10 h-10 rounded-full overflow-hidden">
              <img 
                src={user?.picture || '/default-avatar.png'} 
                alt={user?.name || 'User'} 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="px-4 py-1.5 bg-white/10 rounded-full text-sm whitespace-nowrap hover:bg-white/20 transition-colors"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-4">
        {/* Greeting */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          {greeting}, {user?.name?.split(' ')[0] || 'Guest'}
        </motion.h1>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Diputar Terbaru</h2>
            <div 
              ref={setScrollRef('recent')}
              className="flex gap-3 overflow-x-auto hide-scrollbar pb-2"
            >
              {recentlyPlayed.slice(0, 10).map((item) => (
                <SongCard
                  key={item.song.id}
                  song={item.song}
                  variant="large"
                  onClick={() => handlePlaySong(item.song)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Quick Picks */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pilihan Cepat</h2>
            <button className="text-[#00FF88] text-sm flex items-center gap-1">
              Putar semua <Play className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {quickPicks.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                variant="horizontal"
                showViews
                onClick={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>

        {/* Trending Songs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Lagu Teratas</h2>
            <button className="text-gray-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {trendingSongs.slice(0, 5).map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                variant="horizontal"
                index={index + 1}
                showIndex
                onClick={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">2026 sejauh ini: lagu-lagu terpopuler</h2>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-4 mb-4">
            <p className="text-lg font-semibold mb-2">2026</p>
            <p className="text-sm text-gray-300 mb-4">Lagu-lagu terbaru tahun ini</p>
            <div className="flex items-center gap-2">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
            <div 
              ref={setScrollRef('new')}
              className="flex gap-3 overflow-x-auto hide-scrollbar"
            >
            {newReleases.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                variant="compact"
                onClick={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>

        {/* Popular Artists */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Artis Populer</h2>
            <div 
              ref={setScrollRef('artists')}
              className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
            >
            {artists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                variant="circular"
                onClick={() => {
                  setCurrentArtist(artist);
                  router.push('/artist');
                }}
              />
            ))}
          </div>
        </section>

        {/* More Trending */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Trending Sekarang</h2>
          <div className="grid grid-cols-2 gap-3">
            {trendingSongs.slice(5, 11).map((song) => (
              <SongCard
                key={song.id}
                song={song}
                variant="compact"
                onClick={() => handlePlaySong(song)}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Premium Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 max-w-sm w-full border border-[#00FF88]/20"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-xl font-bold text-center mb-2">Uji coba Premium di MyMusik</h2>
              <p className="text-gray-400 text-center text-sm mb-6">
                Nikmati musik tanpa iklan, putar di latar belakang, dan kualitas audio premium.
              </p>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full bg-[#00FF88] hover:bg-[#00CC6A] text-black font-semibold py-3 rounded-xl mb-3"
              >
                Mulai Uji Coba Gratis
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full text-gray-400 hover:text-white py-2 text-sm"
              >
                Nanti saja
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MusicPlayer />
      <AudioPlayer />
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}