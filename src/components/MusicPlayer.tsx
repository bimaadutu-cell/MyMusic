'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Volume2, VolumeX, Heart, ListMusic, ChevronDown,
  Share2, Mic2, Cast, MoreVertical, X,
  ArrowLeft
} from 'lucide-react';
import { useMusicStore } from '@/store/useMusicStore';
import { formatTime, cn } from '@/lib/utils';
import { getProxiedImageUrl, translateLyric } from '@/lib/youtubeMusicApi';
import AudioPlayer from './AudioPlayer';

export default function MusicPlayer() {
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationLang, setTranslationLang] = useState<'id' | 'en'>('id');

  const {
    currentSong,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    isShuffle,
    repeatMode,
    favorites,
    togglePlay,
    setVolume,
    setCurrentTime,
    nextSong,
    previousSong,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    removeFromQueue,
  } = useMusicStore();

  // Update lyric index based on current time
  useEffect(() => {
    if (!currentSong?.lyrics) return;
    
    const index = currentSong.lyrics.findIndex((lyric, i) => {
      const nextLyric = currentSong.lyrics![i + 1];
      return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
    });
    
    if (index !== -1 && index !== currentLyricIndex) {
      setCurrentLyricIndex(index);
      if (lyricsRef.current) {
        const lyricElement = lyricsRef.current.children[index] as HTMLElement;
        if (lyricElement) {
          lyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, currentSong, currentLyricIndex]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    // The actual seeking is handled by the AudioPlayer component
  };

  const handleShare = async () => {
    if (!currentSong) return;
    
    const shareData = {
      title: currentSong.title,
      text: `Dengarkan "${currentSong.title}" oleh ${currentSong.artist} di MyMusik`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
    }
    setShowShare(false);
  };

  if (!currentSong) return null;

  const favorite = isFavorite(currentSong.id);
  const hasLyrics = currentSong.lyrics && currentSong.lyrics.length > 0;

  return (
    <>
      {/* Audio Player Component */}
      <AudioPlayer />

      {/* Mini Player */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-[72px] left-0 right-0 z-40"
          >
            <div 
              className="mx-2 bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <div className="flex items-center p-2 gap-3">
                <img
                  src={getProxiedImageUrl(currentSong.cover)}
                  alt={currentSong.title}
                  className={cn(
                    "w-12 h-12 rounded-lg object-cover",
                    isPlaying && "animate-spin-slow"
                  )}
                  style={{ animationDuration: '20s' }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">{currentSong.title}</h4>
                  <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(currentSong); }}
                    className="p-2"
                  >
                    <Heart className={cn("w-5 h-5", favorite ? "fill-[#00FF88] text-[#00FF88]" : "text-gray-400")} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
                  </button>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="h-1 bg-gray-700">
                <motion.div
                  className="h-full bg-[#00FF88]"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#050505]"
          >
            {/* Background Blur */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(${getProxiedImageUrl(currentSong.cover)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px)',
              }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-4">
              <button onClick={() => setIsExpanded(false)} className="p-2">
                <ChevronDown className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center gap-4">
                <button onClick={() => setShowShare(true)}>
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button>
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-4">
              {/* Album Art */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-72 h-72 mb-8"
              >
                <motion.img
                  src={getProxiedImageUrl(currentSong.cover)}
                  alt={currentSong.title}
                  className={cn(
                    "w-full h-full rounded-2xl object-cover shadow-2xl",
                    isPlaying && "animate-spin-slow"
                  )}
                  style={{ animationDuration: '20s' }}
                />
                <div 
                  className="absolute inset-0 rounded-2xl opacity-50 blur-2xl -z-10"
                  style={{ backgroundImage: `url(${getProxiedImageUrl(currentSong.cover)})`, backgroundSize: 'cover' }}
                />
              </motion.div>

              {/* Song Info */}
              <div className="w-full mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">{currentSong.title}</h2>
                <p className="text-gray-400">{currentSong.artist}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => toggleFavorite(currentSong)}
                  className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2"
                >
                  <Heart className={cn("w-4 h-4", favorite ? "fill-[#00FF88] text-[#00FF88]" : "text-white")} />
                  <span className="text-sm text-white">52 rb</span>
                </button>
                <button
                  onClick={() => setShowLyrics(true)}
                  className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2"
                >
                  <Mic2 className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">Lirik</span>
                </button>
                <button className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2">
                  <span className="text-sm text-white">312</span>
                </button>
                <button
                  onClick={() => setShowQueue(true)}
                  className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2"
                >
                  <ListMusic className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">Simpan</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full mb-6">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${duration > 0 ? (currentTime / duration) * 100 : 0}%, #333 ${duration > 0 ? (currentTime / duration) * 100 : 0}%)`
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={toggleShuffle}
                  className={cn("p-2", isShuffle && "text-[#00FF88]")}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={previousSong} className="p-2">
                  <SkipBack className="w-8 h-8 fill-white" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black ml-1" />
                  )}
                </button>
                <button onClick={nextSong} className="p-2">
                  <SkipForward className="w-8 h-8 fill-white" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={cn("p-2 relative", repeatMode !== 'none' && "text-[#00FF88]")}
                >
                  <Repeat className="w-5 h-5" />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold">1</span>
                  )}
                </button>
              </div>

              {/* Volume & Cast */}
              <div className="flex items-center gap-4 mt-6">
                <button onClick={() => setIsMuted(!isMuted)}>
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-gray-700 rounded-full"
                />
                <button>
                  <Cast className="w-5 h-5" />
                </button>
              </div>

              {/* Mix Info */}
              <div className="mt-8 text-center">
                <p className="text-gray-400 text-sm">Mix {currentSong.title}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics Modal */}
      <AnimatePresence>
        {showLyrics && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[60] bg-[#050505]/95"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button onClick={() => setShowLyrics(false)}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="font-semibold">Lirik</h3>
              <button onClick={() => setShowLyrics(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div 
              ref={lyricsRef}
              className="p-6 h-[calc(100vh-80px)] overflow-y-auto"
            >
              {hasLyrics ? (
                <div className="space-y-4">
                  {currentSong.lyrics!.map((line, index) => (
                    <motion.p
                      key={index}
                      className={cn(
                        "text-lg transition-all duration-300",
                        index === currentLyricIndex 
                          ? "text-white font-bold text-xl scale-105" 
                          : "text-gray-500"
                      )}
                    >
                      {line.text}
                      {showTranslation && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-[#00FF88] mt-1"
                        >
                          {translateLyric(line.text, translationLang)}
                        </motion.p>
                      )}
                    </motion.p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Mic2 className="w-16 h-16 mb-4 opacity-50" />
                  <p>Lirik tidak tersedia</p>
                </div>
              )}
            </div>

            {/* Translation Toggle */}
            <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={() => { setShowTranslation(false); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm",
                  !showTranslation ? "bg-white text-black" : "bg-white/10 text-white"
                )}
              >
                Original
              </button>
              <button
                onClick={() => { setShowTranslation(true); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm",
                  showTranslation ? "bg-[#00FF88] text-black" : "bg-white/10 text-white"
                )}
              >
                Terjemahan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Modal */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[60] bg-[#050505]"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button onClick={() => setShowQueue(false)}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="font-semibold">Antrian ({queue.length})</h3>
              <button onClick={() => setShowQueue(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
              {queue.map((song, index) => (
                <div
                  key={song.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl mb-2",
                    song.id === currentSong?.id ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <img 
                    src={getProxiedImageUrl(song.cover)} 
                    alt={song.title} 
                    className="w-12 h-12 rounded-lg object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", song.id === currentSong?.id && "text-[#00FF88]")}>
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>
                  <button
                    onClick={() => removeFromQueue(index)}
                    className="p-2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}