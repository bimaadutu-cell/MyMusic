'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Heart, Clock, ListMusic, MoreVertical, Play, X, Check } from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { useRouter } from 'next/navigation';
import { Song, Playlist } from '@/types';
import MusicPlayer from '@/components/MusicPlayer';
import BottomNav from '@/components/BottomNav';

export default function LibraryPage() {
  const router = useRouter();
  const { 
    favorites, 
    playlists, 
    recentlyPlayed, 
    createPlaylist, 
    deletePlaylist,
    setCurrentSong, 
    setIsPlaying, 
    setQueue,
    user 
  } = useMusicStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeTab, setActiveTab] = useState<'playlists' | 'favorites' | 'history'>('playlists');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handlePlaySong = (song: Song, songs?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (songs) {
      setQueue(songs);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505] safe-area-top">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">Koleksi</h1>
          </div>
          <button className="p-2">
            <Plus className="w-6 h-6" onClick={() => setShowCreateModal(true)} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {[
            { id: 'playlists', label: 'Playlist', count: playlists.length },
            { id: 'favorites', label: 'Favorit', count: favorites.length },
            { id: 'history', label: 'Riwayat', count: recentlyPlayed.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[#00FF88] text-black font-medium' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* Playlists Tab */}
          {activeTab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {playlists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListMusic className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-500 mb-4">Belum ada playlist</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-[#00FF88] text-black rounded-full font-medium"
                  >
                    Buat Playlist
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {playlists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-[#00FF88]/20 to-[#00CC6A]/20 rounded-lg flex items-center justify-center">
                        <ListMusic className="w-8 h-8 text-[#00FF88]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
                        <p className="text-sm text-gray-400">{playlist.songs.length} lagu</p>
                      </div>
                      <button
                        onClick={() => deletePlaylist(playlist.id)}
                        className="p-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-500">Belum ada lagu favorit</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favorites.map((song, index) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handlePlaySong(song, favorites)}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer"
                    >
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{song.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <button className="p-2">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {recentlyPlayed.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-500">Belum ada riwayat pemutaran</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentlyPlayed.map((item, index) => (
                    <motion.div
                      key={`${item.song.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handlePlaySong(item.song, recentlyPlayed.map(r => r.song))}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl cursor-pointer"
                    >
                      <img
                        src={item.song.cover}
                        alt={item.song.title}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">{item.song.title}</h4>
                        <p className="text-sm text-gray-400 truncate">{item.song.artist}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.playedAt).toLocaleDateString('id-ID')}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Playlist Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Buat Playlist Baru</h2>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Nama playlist"
                className="w-full bg-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF88]/50 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-3 bg-[#00FF88] text-black rounded-xl font-medium disabled:opacity-50"
                >
                  Buat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MusicPlayer />
      <BottomNav />
    </div>
  );
}