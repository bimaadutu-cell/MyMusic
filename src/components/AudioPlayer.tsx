'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMusicStore } from '@/store/useMusicStore';
import { getAudioStreamUrl } from '@/lib/youtubeMusicApi';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    currentSong,
    isPlaying,
    volume,
    setCurrentTime,
    setDuration,
    nextSong,
    repeatMode,
    setIsPlaying,
  } = useMusicStore();

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    // Setup media session for background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Implement previous track
      });
      navigator.mediaSession.setActionHandler('nexttrack', nextSong);
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [nextSong, setIsPlaying]);

  // Load audio when song changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const loadAudio = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get audio stream URL
        const streamUrl = await getAudioStreamUrl(currentSong.videoId || currentSong.id);
        
        if (streamUrl) {
          audioRef.current!.src = streamUrl;
          audioRef.current!.load();
          setAudioUrl(streamUrl);
          
          // Update media session metadata
          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: currentSong.title,
              artist: currentSong.artist,
              album: currentSong.album,
              artwork: [
                { src: currentSong.cover, sizes: '96x96', type: 'image/jpeg' },
                { src: currentSong.cover, sizes: '128x128', type: 'image/jpeg' },
                { src: currentSong.cover, sizes: '192x192', type: 'image/jpeg' },
                { src: currentSong.cover, sizes: '256x256', type: 'image/jpeg' },
                { src: currentSong.cover, sizes: '384x384', type: 'image/jpeg' },
                { src: currentSong.cover, sizes: '512x512', type: 'image/jpeg' },
              ],
            });
          }
        } else {
          setError('Audio tidak tersedia');
        }
      } catch (err) {
        console.error('Load audio error:', err);
        setError('Gagal memuat audio');
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [currentSong]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Play error:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl, setIsPlaying]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio event listeners
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
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
      setError('Error memutar audio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as EventListener);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as EventListener);
    };
  }, [repeatMode, nextSong, setCurrentTime, setDuration, setIsPlaying]);

  if (!currentSong) return null;

  return (
    <audio
      ref={audioRef}
      crossOrigin="anonymous"
      style={{ display: 'none' }}
    />
  );
}