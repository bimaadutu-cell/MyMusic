'use client';

import { motion } from 'framer-motion';
import { Play, MoreVertical, Clock } from 'lucide-react';
import { Song } from '@/types';
import { useMusicStore } from '@/store/useMusicStore';
import { cn, formatViews } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/youtubeMusicApi';

interface SongCardProps {
  song: Song;
  variant?: 'default' | 'compact' | 'horizontal' | 'large';
  index?: number;
  showIndex?: boolean;
  showViews?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function SongCard({
  song,
  variant = 'default',
  index,
  showIndex = false,
  showViews = false,
  className,
  onClick,
}: SongCardProps) {
  const { currentSong, isPlaying, setCurrentSong, setIsPlaying, addToQueue } = useMusicStore();
  const isCurrentSong = currentSong?.id === song.id;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (isCurrentSong) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  if (variant === 'horizontal') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
          isCurrentSong ? "bg-white/10" : "hover:bg-white/5",
          className
        )}
      >
        {(showIndex || showViews) && (
          <div className="w-8 text-center text-sm text-gray-400">
            {showViews ? formatViews(song.views || '0') : index}
          </div>
        )}
        
        <div className="relative w-14 h-14 flex-shrink-0">
          <img
            src={getProxiedImageUrl(song.cover)}
            alt={song.title}
            className="w-full h-full rounded-lg object-cover"
          />
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[#00FF88] rounded-full"
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium truncate",
            isCurrentSong ? "text-[#00FF88]" : "text-white"
          )}>
            {song.title}
          </h4>
          <p className="text-sm text-gray-400 truncate">{song.artist}</p>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
          className="p-2 text-gray-400 hover:text-white"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          "flex-shrink-0 w-32 cursor-pointer",
          className
        )}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
          <img
            src={getProxiedImageUrl(song.cover)}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="w-10 h-10 bg-[#00FF88] rounded-full flex items-center justify-center">
              <Play className="w-5 h-5 text-black ml-0.5" />
            </div>
          </motion.div>
        </div>
        <h4 className="text-white text-sm font-medium truncate">{song.title}</h4>
        <p className="text-gray-400 text-xs truncate">{song.artist}</p>
      </motion.div>
    );
  }

  if (variant === 'large') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "flex-shrink-0 w-40 cursor-pointer",
          className
        )}
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg">
          <img
            src={getProxiedImageUrl(song.cover)}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs font-medium">{song.artist}</p>
          </div>
        </div>
        <h4 className="text-white text-sm font-medium truncate px-1">{song.title}</h4>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors",
        isCurrentSong ? "bg-white/10" : "hover:bg-white/5",
        className
      )}
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <img
          src={getProxiedImageUrl(song.cover)}
          alt={song.title}
          className="w-full h-full rounded-xl object-cover"
        />
        {isCurrentSong && isPlaying && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[#00FF88] rounded-full"
                  animate={{ height: [4, 16, 4] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-semibold truncate",
          isCurrentSong ? "text-[#00FF88]" : "text-white"
        )}>
          {song.title}
        </h4>
        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
        {showViews && (
          <p className="text-xs text-gray-500 mt-0.5">{formatViews(song.views || '0')} pemutaran</p>
        )}
      </div>
      
      <button
        onClick={(e) => { e.stopPropagation(); addToQueue(song); }}
        className="p-2 text-gray-400 hover:text-white"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </motion.div>
  );
}