'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Play, Shuffle, MoreVertical, Radio, UserPlus } from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { useRouter } from 'next/navigation';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import AudioPlayer from '@/components/AudioPlayer';
import BottomNav from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export default function ArtistPage() {
  const router = useRouter();
  const { currentArtist, setCurrentSong, setIsPlaying, setQueue } = useMusicStore();

  // Fallback if no artist selected
  if (!currentArtist) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">Tidak ada artis yang dipilih</p>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-[#00FF88] text-black rounded-full font-medium"
        >
          Kembali ke Beranda
        </button>
        <BottomNav />
      </div>
    );
  }

  const handlePlayAll = () => {
    if (currentArtist.topSongs && currentArtist.topSongs.length > 0) {
      setCurrentSong(currentArtist.topSongs[0]);
      setIsPlaying(true);
      setQueue(currentArtist.topSongs);
    }
  };

  const handleShuffle = () => {
    if (currentArtist.topSongs && currentArtist.topSongs.length > 0) {
      const shuffled = [...currentArtist.topSongs].sort(() => Math.random() - 0.5);
      setCurrentSong(shuffled[0]);
      setIsPlaying(true);
      setQueue(shuffled);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header Image */}
      <div className="relative h-72">
        <img
          src={currentArtist.cover}
          alt={currentArtist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* More Button */}
        <button className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full backdrop-blur-sm">
          <MoreVertical className="w-6 h-6" />
        </button>

        {/* Artist Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl font-bold mb-2">{currentArtist.name}</h1>
          {currentArtist.subscribers && (
            <p className="text-gray-400">{currentArtist.subscribers} subscriber</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 px-6 py-4">
        <button
          onClick={handleShuffle}
          className="px-6 py-2 bg-white/10 rounded-full text-sm font-medium hover:bg-white/20 flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          Acak
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20">
          <Radio className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20">
          <UserPlus className="w-5 h-5" />
        </button>
        <button className="p-3 bg-white/10 rounded-full hover:bg-white/20 ml-auto">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Play Button */}
      <div className="px-6 mb-6">
        <button
          onClick={handlePlayAll}
          className="w-full py-3 bg-[#00FF88] text-black rounded-full font-semibold flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-black" />
          Putar
        </button>
      </div>

      {/* Sample Banner */}
      <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl">
        <p className="text-sm text-gray-300 mb-1">Ambil sampel ini</p>
        <p className="text-xs text-gray-400">Ketuk untuk melihat artis ini dan temukan favorit</p>
      </div>

      {/* Top Songs */}
      {currentArtist.topSongs && currentArtist.topSongs.length > 0 && (
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Lagu teratas</h2>
            <button className="text-[#00FF88] text-sm font-medium">Putar semua</button>
          </div>
          <div className="space-y-2">
            {currentArtist.topSongs.slice(0, 5).map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                variant="horizontal"
                index={index + 1}
                showIndex
              />
            ))}
          </div>
        </section>
      )}

      {/* Singles & EPs */}
      {currentArtist.singles && currentArtist.singles.length > 0 && (
        <section className="px-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Single & EP</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {currentArtist.singles.map((single) => (
              <div key={single.id} className="flex-shrink-0 w-36">
                <div className="aspect-square rounded-xl overflow-hidden mb-2">
                  <img
                    src={single.cover}
                    alt={single.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm font-medium truncate">{single.title}</p>
                <p className="text-xs text-gray-500">{single.year}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      {currentArtist.description && (
        <section className="px-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tentang</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {currentArtist.description}
          </p>
        </section>
      )}

      <MusicPlayer />
      <AudioPlayer />
      <BottomNav />
    </div>
  );
}