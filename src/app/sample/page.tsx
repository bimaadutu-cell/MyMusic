'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, Shuffle, Radio } from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { mockSongs } from '@/lib/musicApi';
import { useRouter } from 'next/navigation';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import AudioPlayer from '@/components/AudioPlayer';
import BottomNav from '@/components/BottomNav';

export default function SamplePage() {
  const router = useRouter();
  const { setCurrentSong, setIsPlaying, setQueue } = useMusicStore();

  const handlePlayAll = () => {
    const shuffled = [...mockSongs].sort(() => Math.random() - 0.5);
    setCurrentSong(shuffled[0]);
    setIsPlaying(true);
    setQueue(shuffled);
  };

  const handleShuffle = () => {
    const shuffled = [...mockSongs].sort(() => Math.random() - 0.5);
    setCurrentSong(shuffled[0]);
    setIsPlaying(true);
    setQueue(shuffled);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505] safe-area-top">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Sampel</h1>
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#00FF88]/20 to-[#00CC6A]/10 rounded-3xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-2">Jelajahi Musik</h2>
          <p className="text-gray-400 mb-4">Dengarkan sampel lagu dari berbagai genre</p>
          <div className="flex gap-3">
            <button
              onClick={handlePlayAll}
              className="flex-1 bg-[#00FF88] text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              Putar
            </button>
            <button
              onClick={handleShuffle}
              className="flex-1 bg-white/10 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Shuffle className="w-5 h-5" />
              Acak
            </button>
          </div>
        </motion.div>

        {/* Quick Picks */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Pilihan Cepat</h3>
          <div className="space-y-2">
            {mockSongs.slice(0, 8).map((song) => (
              <SongCard
                key={song.id}
                song={song}
                variant="horizontal"
                showViews
              />
            ))}
          </div>
        </section>
      </div>

      <MusicPlayer />
      <AudioPlayer />
      <BottomNav />
    </div>
  );
}