import { useEffect, useRef, useCallback } from 'react';
import { useMusicStore } from '@/store/useMusicStore';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    nextSong,
    repeatMode,
  } = useMusicStore();

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    // Enable background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        audio.play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Handle previous
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextSong();
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [nextSong]);

  // Handle song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Set audio source
    if (currentSong.videoId) {
      // Use a reliable audio stream service
      audio.src = `https://yt.lemnoslife.com/videos?part=snippet&id=${currentSong.videoId}`;
    }

    // Update media session metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album,
        artwork: [
          { src: currentSong.cover, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    }

    if (isPlaying) {
      audio.play().catch((error) => {
        console.log('Autoplay prevented:', error);
      });
    }
  }, [currentSong, isPlaying]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.log('Play error:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, nextSong, setCurrentTime, setDuration]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, [setCurrentTime]);

  return { audioRef, seek };
}