'use client';

import { motion } from 'framer-motion';
import { Artist } from '@/types';
import { useMusicStore } from '@/store/useMusicStore';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/youtubeMusicApi';

interface ArtistCardProps {
  artist: Artist;
  variant?: 'default' | 'circular' | 'large';
  className?: string;
  onClick?: () => void;
}

export default function ArtistCard({
  artist,
  variant = 'default',
  className,
  onClick,
}: ArtistCardProps) {
  const { setCurrentArtist } = useMusicStore();

  const handleClick = () => {
    setCurrentArtist(artist);
    if (onClick) onClick();
  };

  if (variant === 'circular') {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className={cn(
          "flex flex-col items-center cursor-pointer flex-shrink-0 w-24",
          className
        )}
      >
        <div className="relative w-20 h-20 mb-2">
          <img
            src={getProxiedImageUrl(artist.cover)}
            alt={artist.name}
            className="w-full h-full rounded-full object-cover border-2 border-transparent hover:border-[#00FF88] transition-colors"
          />
        </div>
        <p className="text-white text-xs font-medium text-center truncate w-full">
          {artist.name}
        </p>
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
          "relative overflow-hidden rounded-2xl cursor-pointer flex-shrink-0 w-36 h-44",
          className
        )}
      >
        <img
          src={getProxiedImageUrl(artist.cover)}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-semibold text-sm truncate">{artist.name}</p>
          {artist.subscribers && (
            <p className="text-gray-300 text-xs">{artist.subscribers} subscriber</p>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors",
        className
      )}
    >
      <img
        src={getProxiedImageUrl(artist.cover)}
        alt={artist.name}
        className="w-14 h-14 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{artist.name}</p>
        {artist.subscribers && (
          <p className="text-sm text-gray-400">{artist.subscribers} subscriber</p>
        )}
      </div>
    </motion.div>
  );
}