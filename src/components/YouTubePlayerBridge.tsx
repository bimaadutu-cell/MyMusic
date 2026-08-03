"use client";

import { useEffect, useId, useRef, useState } from "react";

type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => YTPlayerState;
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (options: { videoId: string; startSeconds?: number }) => void;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    elementId: string,
    options: {
      width: string | number;
      height: string | number;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: () => void;
        onStateChange: (event: { data: YTPlayerState }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: {
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
    __mymusikYTReady?: Promise<YTNamespace>;
  }
}

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("Window unavailable"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window.__mymusikYTReady) return window.__mymusikYTReady;

  window.__mymusikYTReady = new Promise<YTNamespace>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("Pemutar resmi gagal dimuat"));
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => reject(new Error("Script pemutar resmi gagal dimuat"));
      document.head.appendChild(script);
    }
  });

  return window.__mymusikYTReady;
}

type YouTubePlayerBridgeProps = {
  videoId: string;
  isPlaying: boolean;
  volume: number;
  seekTo: number;
  seekVersion: number;
  startAt?: number;
  onProgress: (position: number, duration: number) => void;
  onEnded: () => void;
  onPlayStateChange: (playing: boolean) => void;
  onError: (message: string) => void;
};

export function YouTubePlayerBridge({
  videoId,
  isPlaying,
  volume,
  seekTo,
  seekVersion,
  startAt = 0,
  onProgress,
  onEnded,
  onPlayStateChange,
  onError,
}: YouTubePlayerBridgeProps) {
  const reactId = useId();
  const elementId = `mymusik-youtube-${reactId.replaceAll(":", "")}`;
  const playerRef = useRef<YTPlayer | null>(null);
  const latestVideoRef = useRef(videoId);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(elementId, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              setReady(true);
              playerRef.current?.setVolume(volume);
              if (startAt > 2) playerRef.current?.seekTo(startAt, true);
              if (isPlaying) playerRef.current?.playVideo();
            },
            onStateChange: (event) => {
              if (event.data === 0) onEnded();
              if (event.data === 1) onPlayStateChange(true);
              if (event.data === 2) onPlayStateChange(false);
            },
            onError: (event) => {
              onPlayStateChange(false);
              onError(`Pemutar resmi tidak dapat memutar track ini. Kode error: ${event.data}`);
            },
          },
        });
      })
      .catch((error: unknown) => {
        onError(error instanceof Error ? error.message : "Pemutar resmi gagal dimuat");
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    if (!ready || !playerRef.current || latestVideoRef.current === videoId) return;
    latestVideoRef.current = videoId;
    if (isPlaying) playerRef.current.loadVideoById({ videoId, startSeconds: 0 });
    else playerRef.current.cueVideoById({ videoId, startSeconds: 0 });
  }, [isPlaying, ready, videoId]);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    if (isPlaying) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [isPlaying, ready]);

  useEffect(() => {
    if (!ready || !playerRef.current) return;
    playerRef.current.setVolume(Math.max(0, Math.min(100, volume)));
  }, [ready, volume]);

  useEffect(() => {
    if (!ready || !playerRef.current || seekVersion === 0) return;
    playerRef.current.seekTo(Math.max(0, seekTo), true);
    if (isPlaying) playerRef.current.playVideo();
  }, [isPlaying, ready, seekTo, seekVersion]);

  useEffect(() => {
    if (!ready) return;
    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      if (Number.isFinite(currentTime) && Number.isFinite(duration)) onProgress(Math.floor(currentTime), Math.floor(duration));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [onProgress, ready]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-300/20 bg-black shadow-[0_0_30px_rgba(0,255,136,0.16)]">
      <div id={elementId} className="aspect-video w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">
        Pemutar resmi aktif
      </div>
    </div>
  );
}
