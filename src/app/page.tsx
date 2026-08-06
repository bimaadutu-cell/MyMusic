"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTube from "react-youtube";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import {
  Home, Compass, Search, Library, Play, Pause, SkipForward, SkipBack, Shuffle,
  Repeat, ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical,
  ChevronDown, Cast, X, Mic, CheckCircle2, ListMusic, History, ChevronRight,
  ArrowLeft, Code, User, LogOut, Info, Globe2, Trash2, PlusCircle, Music2, FolderPlus, ShieldCheck, Crown
} from "lucide-react";

type Song = { id: string; title: string; artist: string; cover: string; duration: string; seconds?: number; views?: number };
type Tab = "home" | "explore" | "search" | "library" | "developer";
type PlayerMode = "mini" | "full" | "lyrics" | "queue";
type LyricLine = { time: number; text: string; translated?: string };
type Playlist = { id: string; name: string; songs: Song[] };

const CHIPS = ["Bersantai", "Senang", "Sedih", "Romansa", "Perjalanan", "Mengisi energi"];
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "102872338274-1234567890dummyclientid.apps.googleusercontent.com";

function parseLrc(lrc: string): LyricLine[] {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const parsed: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2}\.\d{2,3})\]/;
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const m = parseInt(match[1]);
      const s = parseFloat(match[2]);
      const time = m * 60 + s;
      const text = line.replace(timeRegex, '').trim();
      parsed.push({ time, text });
    }
  }
  return parsed;
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAccount, setUserAccount] = useState<{name: string, email: string, picture: string} | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [tab, setTab] = useState<Tab>("home");
  const [playerMode, setPlayerMode] = useState<PlayerMode | null>(null);
  const [artistView, setArtistView] = useState<Song | null>(null);
  
  const [homeTracks, setHomeTracks] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [queue, setQueue] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [parsedLyrics, setParsedLyrics] = useState<LyricLine[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  
  const [logoClicks, setLogoClicks] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [serverType, setServerType] = useState("native");
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumStep, setPremiumStep] = useState(0); // 0: Start, 1: Requesting, 2: Success

  const ytRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const account = { name: decoded.name, email: decoded.email, picture: decoded.picture || "" };
      localStorage.setItem("mymusik_auth", JSON.stringify(account));
      setUserAccount(account);
      setIsLoggedIn(true);

      const hasPremium = localStorage.getItem("mymusik_premium");
      if (!hasPremium) {
        setShowPremiumModal(true);
      }
    } catch (err) {
      console.error("Gagal verifikasi Google Login");
    }
  };

  const handleActivatePremium = () => {
    setPremiumStep(1);
    // Simulate sending request to YouTube servers
    setTimeout(() => {
      setPremiumStep(2);
      localStorage.setItem("mymusik_premium", "true");
      setTimeout(() => setShowPremiumModal(false), 2000);
    }, 2500);
  };

  useEffect(() => {
    const savedServer = localStorage.getItem("mymusik_server");
    if (savedServer) setServerType(savedServer);

    const auth = localStorage.getItem("mymusik_auth");
    if (auth) {
      setUserAccount(JSON.parse(auth));
      setIsLoggedIn(true);
      const hasPremium = localStorage.getItem("mymusik_premium");
      if (!hasPremium) setShowPremiumModal(true);
    }

    const savedHist = localStorage.getItem("mymusik_history");
    if (savedHist) setHistory(JSON.parse(savedHist));

    const savedSearch = localStorage.getItem("mymusik_search_history");
    if (savedSearch) setSearchHistory(JSON.parse(savedSearch));

    const savedPlaylists = localStorage.getItem("mymusik_playlists");
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists));

    const cachedHome = localStorage.getItem("mymusik_home");
    if (cachedHome) setHomeTracks(JSON.parse(cachedHome));

    const homeQueries = ["lagu terbaru viral indonesia 2026", "populer hits indonesia 2026", "top artis indonesia saat ini", "lagu galau sedih indonesia populer"];
    const randomQuery = homeQueries[Math.floor(Math.random() * homeQueries.length)];

    fetch(`/api/search?q=${encodeURIComponent(randomQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random());
          setHomeTracks(shuffled);
          localStorage.setItem("mymusik_home", JSON.stringify(shuffled));
        }
      })
      .catch(() => {});
  }, []);

  // Update active lyric index and scroll smoothly
  useEffect(() => {
    if (parsedLyrics.length > 0) {
      const index = parsedLyrics.findIndex((l, i) => {
        const nextTime = parsedLyrics[i + 1]?.time || Infinity;
        return progress >= l.time && progress < nextTime;
      });
      if (index !== activeLyricIndex) {
        setActiveLyricIndex(index);
        if (index >= 0 && lyricsContainerRef.current) {
          const container = lyricsContainerRef.current;
          const activeEl = container.children[index] as HTMLElement;
          if (activeEl) {
            container.scrollTo({
              top: activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2,
              behavior: 'smooth'
            });
          }
        }
      }
    }
  }, [progress, parsedLyrics, activeLyricIndex]);

  // Sinkronisasi saat pindah server
  useEffect(() => {
    if (currentSong && isPlaying) {
      if (serverType === "native") {
        ytRef.current?.pauseVideo();
        if (audioRef.current) {
          audioRef.current.src = `/api/stream?id=${currentSong.id}`;
          audioRef.current.currentTime = progress;
          audioRef.current.play().catch(()=>{});
        }
      } else {
        audioRef.current?.pause();
        if (ytRef.current) {
          ytRef.current.loadVideoById(currentSong.id, progress);
          ytRef.current.playVideo();
        }
      }
    }
  }, [serverType]);

  const handleLogout = () => {
    localStorage.removeItem("mymusik_auth");
    setUserAccount(null);
    setIsLoggedIn(false);
    setShowProfile(false);
  };

  const addToHistory = (song: Song) => {
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      const newHistory = [song, ...filtered].slice(0, 50);
      localStorage.setItem("mymusik_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handleSearchInput = async (q: string) => {
    setQuery(q);
    if (!q) return setSuggestions([]);
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
      setSuggestions(await res.json());
    } catch { setSuggestions([]); }
  };

  const executeSearch = async (q: string) => {
    setQuery(q);
    setIsSearching(true);
    setSuggestions([]);
    
    // Save search history
    setSearchHistory(prev => {
      const newH = [q, ...prev.filter(x => x !== q)].slice(0, 10);
      localStorage.setItem("mymusik_search_history", JSON.stringify(newH));
      return newH;
    });

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      setSearchResults(await res.json());
    } catch { setSearchResults([]); }
    setIsSearching(false);
    setTab("search");
  };

  const loadMixQueue = async (song: Song) => {
    const mixQuery = `Lagu sejenis ${song.title} ${song.artist} populer mix`;
    fetch(`/api/search?q=${encodeURIComponent(mixQuery)}`)
      .then(r => r.json())
      .then(data => {
        const nextSongs = data.filter((d: Song) => d.id !== song.id && !d.title.toLowerCase().includes("karaoke")).slice(0, 15);
        setQueue(nextSongs);
      }).catch(() => {});
  };

  const addSongToQueue = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueue(prev => [...prev, song]);
    alert(`${song.title} ditambahkan ke antrean!`);
  };

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    setPlaylists(prev => {
      const updated = [...prev, { id: Date.now().toString(), name, songs: [] }];
      localStorage.setItem("mymusik_playlists", JSON.stringify(updated));
      return updated;
    });
  };

  const addSongToPlaylist = (playlistId: string) => {
    if (!currentSong) return;
    setPlaylists(prev => {
      const updated = prev.map(pl => {
        if (pl.id === playlistId && !pl.songs.find(s => s.id === currentSong.id)) {
          return { ...pl, songs: [...pl.songs, currentSong] };
        }
        return pl;
      });
      localStorage.setItem("mymusik_playlists", JSON.stringify(updated));
      return updated;
    });
    setShowPlaylistModal(false);
    alert(`Ditambahkan ke playlist!`);
  };

  const updateMediaSession = (song: Song) => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: 'MyMusik PWA',
        artwork: [
          { src: song.cover, sizes: '96x96', type: 'image/jpeg' },
          { src: song.cover, sizes: '256x256', type: 'image/jpeg' },
          { src: song.cover, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('previoustrack', () => seek({ target: { value: "0" } } as any));
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && audioRef.current) audioRef.current.currentTime = details.seekTime;
      });
    }
  };

  const playSong = async (song: Song) => {
    setCurrentSong(song);
    setPlayerMode("full");
    setIsPlaying(true);
    setProgress(0);
    setDuration(song.seconds || 0);
    setParsedLyrics([]);
    setShowTranslation(false);
    setActiveLyricIndex(-1);
    addToHistory(song);
    loadMixQueue(song);
    updateMediaSession(song);

    if (serverType === "native") {
      if (audioRef.current) {
        audioRef.current.src = `/api/stream?id=${song.id}`;
        audioRef.current.load();
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) playPromise.catch(e => console.error("AutoPlay failed:", e));
      }
    } else {
      if (ytRef.current) {
        ytRef.current.loadVideoById(song.id);
        setTimeout(() => ytRef.current?.playVideo(), 200);
      }
    }

    try {
      const r = await fetch(`/api/lyrics?q=${encodeURIComponent(song.title + " " + song.artist)}`);
      const data = await r.json();
      if (data.synced) {
        setParsedLyrics(parseLrc(data.synced));
      } else if (data.plain) {
        setParsedLyrics([{ time: 0, text: data.plain }]);
      } else {
        setParsedLyrics([{ time: 0, text: "Lirik tidak ditemukan." }]);
      }
    } catch {
      setParsedLyrics([{ time: 0, text: "Lirik tidak tersedia saat offline." }]);
    }
  };

  const toggleTranslate = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    // Jika sudah pernah ditranslate, tinggal tampilkan
    if (parsedLyrics.length > 0 && parsedLyrics[0].translated) {
      setShowTranslation(true);
      return;
    }
    
    setIsTranslating(true);
    try {
      const plainText = parsedLyrics.map(l => l.text).join('\n');
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: plainText })
      });
      const data = await res.json();
      const translatedLines = data.translated.split('\n');

      const newLyrics = parsedLyrics.map((l, i) => ({
        ...l,
        translated: translatedLines[i] || ""
      }));
      setParsedLyrics(newLyrics);
      setShowTranslation(true);
    } catch {
      alert("Gagal menerjemahkan lirik.");
    }
    setIsTranslating(false);
  };

  const handleShare = async () => {
    if (navigator.share && currentSong) {
      try {
        await navigator.share({
          title: `MyMusik - ${currentSong.title}`,
          text: `Dengarkan ${currentSong.title} oleh ${currentSong.artist} di MyMusik.`,
          url: window.location.origin
        });
      } catch (error) { console.error("Error sharing", error); }
    }
  };

  const togglePlay = () => {
    if (serverType === "native") {
      if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
      else { audioRef.current?.play().catch(()=>{}); setIsPlaying(true); }
    } else {
      if (isPlaying) { ytRef.current?.pauseVideo(); setIsPlaying(false); }
      else { ytRef.current?.playVideo(); setIsPlaying(true); }
    }
  };

  const onPlayerStateChange = (event: any) => {
    if (serverType !== "gootube") return;
    if (event.data === 1) { // PLAYING
      setIsPlaying(true);
      setDuration(event.target.getDuration());
      setInterval(() => {
        if (ytRef.current && serverType === "gootube") setProgress(ytRef.current.getCurrentTime());
      }, 100); 
    } else if (event.data === 2 || event.data === 3) {
      if (event.data === 2) setIsPlaying(false);
    }
    if (event.data === 0 && currentSong) playNext();
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(queue.slice(1));
      playSong(nextSong);
    }
  };

  const removeFromQueue = (index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement> | {target: {value: string}}) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (serverType === "native" && audioRef.current) {
      audioRef.current.currentTime = val;
    } else if (serverType === "gootube" && ytRef.current) {
      ytRef.current.seekTo(val, true);
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatNum = (num: number) => (num / 1000).toFixed(3) + " rb";

  const quickPicksChunks = [];
  for (let i = 0; i < homeTracks.length; i += 4) {
    quickPicksChunks.push(homeTracks.slice(i, i + 4));
  }

  const getProfileInitial = () => userAccount?.name ? userAccount.name.charAt(0).toUpperCase() : "B";

  const handleLogoClick = () => {
    setLogoClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) { setShowDevPanel(true); return 0; }
      return newCount;
    });
  };

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="h-[100dvh] w-full bg-[#030303] text-white flex flex-col items-center justify-center overflow-hidden font-sans relative">
         <div className="absolute inset-0 flex items-center justify-center opacity-30 -z-10 blur-sm pointer-events-none">
            <motion.div animate={{x: ["0%", "-50%"]}} transition={{repeat: Infinity, duration: 20, ease: "linear"}} className="flex gap-4">
               {[1,2,3,4,5,6].map((i) => <img key={`a${i}`} src={`https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg`} className="w-48 h-48 rounded-xl object-cover" />)}
               {[1,2,3,4,5,6].map((i) => <img key={`b${i}`} src={`https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg`} className="w-48 h-48 rounded-xl object-cover" />)}
            </motion.div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-[#030303]/40 -z-10" />

         <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="w-full max-w-sm px-6 flex flex-col items-center z-10">
            <img src="/logo.png" className="w-24 h-24 mb-6 drop-shadow-[0_0_30px_rgba(255,0,0,0.4)]" alt="logo" />
            <h1 className="text-3xl font-black text-center mb-3 text-white drop-shadow-md">MyMusik</h1>
            <p className="text-gray-300 text-center text-sm mb-10 leading-relaxed font-medium">Masuk untuk menikmati musik favorit, membuat playlist, dan sinkronisasi riwayat tanpa batas.</p>
            
            <div className="w-full flex justify-center scale-110 mb-4 drop-shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error("Login Failed")}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  text="continue_with"
               />
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#030303] text-white flex flex-col overflow-hidden font-sans touch-manipulation overscroll-none selection:bg-white/30">
      
      {serverType === "native" ? (
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => playNext()}
          autoPlay
          playsInline
          preload="auto"
        />
      ) : (
        <div className="absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden -z-50">
          <YouTube
            videoId={currentSong?.id || "dQw4w9WgXcQ"}
            opts={{ height: '1', width: '1', playerVars: { autoplay: 1, playsinline: 1, enablejsapi: 1, rel: 0, origin: typeof window !== 'undefined' ? window.location.origin : undefined } }}
            onReady={(e: any) => { ytRef.current = e.target; if (currentSong) e.target.playVideo(); }}
            onStateChange={onPlayerStateChange}
          />
        </div>
      )}

      {/* --- PREMIUM TRIAL MODAL --- */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/95 z-[100] backdrop-blur-md flex items-center justify-center px-4">
             <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, opacity:0}} className="w-full max-w-sm bg-gradient-to-b from-[#2a1320] to-[#111] rounded-3xl p-6 shadow-[0_0_50px_rgba(255,0,0,0.2)] border border-red-900/50">
                <div className="flex justify-center mb-6">
                   <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
                   </div>
                </div>
                
                {premiumStep === 0 && (
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-white mb-2">Uji Coba Premium di MyMusik</h2>
                    <p className="text-gray-300 text-sm mb-6 leading-relaxed">Nikmati pengalaman mendengarkan musik tanpa jeda iklan dan putar di latar belakang walaupun aplikasi ditutup (Screen-Off). Semua terbuka untuk Anda.</p>
                    <ul className="text-left space-y-3 mb-8">
                       <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-red-500" /> Bebas Iklan Selamanya</li>
                       <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-red-500" /> Background Play Lockscreen</li>
                       <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-red-500" /> Audio Kualitas Tinggi Asli</li>
                    </ul>
                    <button onClick={handleActivatePremium} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-full active:scale-95 transition-all shadow-[0_0_20px_rgba(255,0,0,0.4)]">Aktifkan Uji Coba Gratis</button>
                    <button onClick={() => setShowPremiumModal(false)} className="mt-4 text-gray-500 text-sm font-medium">Lain Kali</button>
                  </div>
                )}

                {premiumStep === 1 && (
                  <div className="text-center py-8">
                     <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-6" />
                     <h3 className="text-lg font-bold text-white mb-2 animate-pulse">Mengirim Request ke Server YouTube...</h3>
                     <p className="text-gray-400 text-sm">Sedang memverifikasi akun Anda untuk bypass Premium.</p>
                  </div>
                )}

                {premiumStep === 2 && (
                  <div className="text-center py-6">
                     <motion.div initial={{scale:0}} animate={{scale:1}} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                     </motion.div>
                     <h3 className="text-xl font-black text-white mb-2">Premium Berhasil Diaktifkan!</h3>
                     <p className="text-gray-400 text-sm">Akun MyMusik & YouTube Premium Anda telah disinkronkan. Selamat mendengarkan.</p>
                  </div>
                )}
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ACCOUNT PROFILE OVERLAY --- */}
      <AnimatePresence>
        {showProfile && userAccount && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 z-[70] backdrop-blur-sm flex items-center justify-center px-4">
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl border border-white/10">
                <div className="flex justify-between items-start mb-6">
                   <h2 className="text-xl font-bold">Akun Google</h2>
                   <button onClick={() => setShowProfile(false)}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex flex-col items-center mb-8 text-center">
                   {userAccount.picture ? (
                     <img src={userAccount.picture} className="w-20 h-20 rounded-full mb-4 shadow-lg object-cover" />
                   ) : (
                     <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-4xl font-bold mb-4 shadow-lg shadow-blue-500/30">{getProfileInitial()}</div>
                   )}
                   <h3 className="text-xl font-bold text-white">{userAccount.name}</h3>
                   <p className="text-gray-400 text-sm">{userAccount.email}</p>
                </div>
                <div className="space-y-3">
                   <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition"><Info className="w-5 h-5 text-gray-400" /> Info Akun</button>
                   <button onClick={() => {setTab("library"); setShowProfile(false);}} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10 transition"><History className="w-5 h-5 text-gray-400" /> Kelola Riwayat</button>
                   <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"><LogOut className="w-5 h-5" /> Keluar dari Aplikasi</button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DEVELOPER PANEL MODAL --- */}
      <AnimatePresence>
        {showDevPanel && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-[#111] border border-white/20 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-500">Developer Panel</h2>
                  <Code className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-gray-400 mb-6">Konfigurasi Server Audio (Bypass & Embed)</p>
                <div className="space-y-3 mb-8">
                   <button onClick={() => { setServerType("native"); localStorage.setItem("mymusik_server", "native"); }} className={`w-full p-4 rounded-xl flex justify-between items-center transition ${serverType === "native" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}>
                      <div className="text-left"><p className="font-bold">Server 1 (Native Audio)</p><p className="text-xs opacity-70">Support Background Lockscreen</p></div>
                      {serverType === "native" && <CheckCircle2 className="w-6 h-6" />}
                   </button>
                   <button onClick={() => { setServerType("gootube"); localStorage.setItem("mymusik_server", "gootube"); }} className={`w-full p-4 rounded-xl flex justify-between items-center transition ${serverType === "gootube" ? "bg-blue-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}>
                      <div className="text-left"><p className="font-bold">Server 2 (Gootube Embed)</p><p className="text-xs opacity-70">YouTube API Player Fallback</p></div>
                      {serverType === "gootube" && <CheckCircle2 className="w-6 h-6" />}
                   </button>
                </div>
                <button onClick={() => setShowDevPanel(false)} className="w-full bg-white text-black font-bold py-3.5 rounded-full active:scale-95 transition-transform">Tutup Panel</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ADD TO PLAYLIST MODAL --- */}
      <AnimatePresence>
        {showPlaylistModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-[#1a1a1a] border border-white/20 p-6 rounded-3xl w-full max-w-sm shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Simpan ke Playlist</h2>
                  <button onClick={() => setShowPlaylistModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto">
                   <button onClick={() => {
                       const name = prompt("Nama Playlist Baru:");
                       if(name) { createPlaylist(name); setTimeout(() => setShowPlaylistModal(false), 200); }
                   }} className="w-full p-4 rounded-xl flex items-center gap-3 bg-white/10 hover:bg-white/20 transition">
                      <PlusCircle className="w-6 h-6 text-white" />
                      <span className="font-bold">Buat Playlist Baru</span>
                   </button>
                   {playlists.map(pl => (
                      <button key={pl.id} onClick={() => addSongToPlaylist(pl.id)} className="w-full p-4 rounded-xl flex items-center gap-3 bg-white/5 hover:bg-white/10 transition text-left">
                         <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center shrink-0"><Music2 className="w-5 h-5 text-gray-400" /></div>
                         <div className="flex-1 truncate"><p className="font-bold">{pl.name}</p><p className="text-xs text-gray-400">{pl.songs.length} lagu</p></div>
                      </button>
                   ))}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ARTIST PROFILE OVERLAY --- */}
      <AnimatePresence>
        {artistView && (
          <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"tween", duration:0.2}} className="fixed inset-0 bg-[#030303] z-[60] flex flex-col overflow-y-auto scrollbar-hide">
             <div className="relative w-full h-72 shrink-0 bg-black">
                <img src={artistView.cover} className="w-full h-full object-cover opacity-60" alt="artist cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-black/40" />
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
                   <button onClick={() => setArtistView(null)} className="p-2"><ArrowLeft className="w-6 h-6 text-white" /></button>
                   <div className="flex gap-4"><Cast className="w-6 h-6 text-white"/><button onClick={handleShare}><Share2 className="w-6 h-6 text-white"/></button></div>
                </div>
                <div className="absolute bottom-4 left-4">
                   <h1 className="text-[40px] leading-none font-black text-white">{artistView.artist}</h1>
                </div>
             </div>
             <div className="px-4 pb-20">
                <div className="flex items-center gap-4 mt-2 mb-6">
                   <button className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium">Subscribe 3,28 rb</button>
                   <Cast className="w-5 h-5 text-gray-400" />
                   <button onClick={() => playSong(artistView)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center ml-auto"><Play className="w-5 h-5 fill-black ml-1"/></button>
                </div>

                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between mb-8 cursor-pointer">
                   <div>
                      <h4 className="font-bold text-white text-base">Ambil sampel ini</h4>
                      <p className="text-gray-400 text-[13px]">Ketuk untuk melihat artis ini dan temukan favorit</p>
                   </div>
                   <div className="w-12 h-12 rounded overflow-hidden flex gap-0.5 shrink-0"><div className="w-4 bg-gradient-to-br from-pink-500 to-purple-500"/><div className="w-4 bg-gradient-to-br from-blue-500 to-cyan-500"/><div className="w-4 bg-gradient-to-br from-green-500 to-emerald-500"/></div>
                </div>

                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-bold">Lagu teratas</h3>
                   <button className="text-[12px] px-3 py-1 border border-white/20 rounded-full">Putar semua</button>
                </div>
                <div className="flex flex-col gap-3 mb-8">
                   {((artistView as any).related || homeTracks.slice(0, 5)).map((s: Song) => (
                      <div key={s.id} onClick={() => { playSong(s); setArtistView(null); }} className="flex items-center gap-3 cursor-pointer">
                         <img src={s.cover} className="w-12 h-12 rounded object-cover" />
                         <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate text-[15px]">{s.title}</h4>
                            <p className="text-[13px] text-gray-400 truncate">{s.artist} • {s.views ? formatNum(s.views) : formatNum(Math.floor(Math.random()*200000)+10000)} pemutaran</p>
                         </div>
                         <button onClick={(e) => addSongToQueue(s, e)} className="p-1"><MoreVertical className="w-5 h-5 text-gray-400 shrink-0" /></button>
                      </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto scrollbar-hide pb-20`}>
        
        {/* --- HOME TAB --- */}
        {tab === "home" && (
          <div className="min-h-full bg-gradient-to-b from-[#2e1015] to-[#030303] to-50%">
            <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-transparent z-10">
              <div className="flex items-center gap-2" onClick={handleLogoClick}>
                <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-full pointer-events-none" />
                <span className="text-2xl font-bold tracking-tighter select-none">Music</span>
              </div>
              <div className="flex items-center gap-4">
                <Cast className="w-6 h-6 text-white" />
                <Search className="w-6 h-6 text-white" onClick={() => setTab("search")} />
                <button onClick={() => setShowProfile(true)} className="w-7 h-7 rounded-full bg-blue-600 border border-white/20 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {userAccount?.picture ? <img src={userAccount.picture} className="w-full h-full object-cover" /> : getProfileInitial()}
                </button>
              </div>
            </header>

            <div className="px-4 py-2 flex gap-3 overflow-x-auto scrollbar-hide">
              {CHIPS.map(c => (
                <button key={c} className="whitespace-nowrap px-4 py-1.5 bg-white/10 rounded-full text-[13px] font-bold border border-white/5 active:bg-white/20">{c}</button>
              ))}
            </div>

            <div className="px-4 py-6">
              {/* Riwayat Kotak Besar di Home */}
              {history.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-3 text-gray-400 text-sm mb-4 font-bold" onClick={() => setShowProfile(true)}>
                    {userAccount?.picture ? (
                      <img src={userAccount.picture} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">{getProfileInitial()}</div>
                    )}
                    Selamat datang kembali, {userAccount?.name.split(" ")[0]}
                  </div>
                  
                  <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide pb-2 -mx-4 px-4">
                    {history.slice(0, 10).map((s) => (
                      <div key={s.id + "hist"} onClick={() => playSong(s)} className="w-[140px] shrink-0 snap-start cursor-pointer active:scale-95 transition-transform relative group">
                        <div className="w-[140px] h-[140px] rounded-xl overflow-hidden mb-2 relative shadow-lg">
                           <img src={s.cover} className="w-full h-full object-cover" alt="cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-10 h-10 fill-white" />
                           </div>
                        </div>
                        <h4 className="font-bold text-[14px] text-white truncate w-full">{s.title}</h4>
                        <p className="text-[12px] text-gray-400 truncate w-full">{s.artist}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Animated Banner */}
              <div className="mt-4 relative rounded-xl overflow-hidden mb-8 h-36 bg-[#3d1822] flex items-center shadow-lg cursor-pointer" onClick={() => homeTracks.length && playSong(homeTracks[0])}>
                <div className="p-5 relative z-10 w-3/5">
                  <h2 className="text-[20px] font-bold text-white mb-2 leading-tight">Temukan lagu baru di feed video Anda</h2>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><Play className="w-4 h-4 text-white fill-white ml-0.5" /></div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[45%] flex overflow-hidden mask-image-fade-left">
                  <motion.div animate={{x: ["0%", "-100%"]}} transition={{repeat: Infinity, duration: 12, ease: "linear"}} className="flex h-full items-center gap-3">
                     {homeTracks.slice(0,6).map((s,i) => <img key={i} src={s.cover} className="w-28 h-28 rounded-lg object-cover shrink-0 rotate-12 shadow-2xl" alt="cover" /> )}
                     {homeTracks.slice(0,6).map((s,i) => <img key={`dup-${i}`} src={s.cover} className="w-28 h-28 rounded-lg object-cover shrink-0 rotate-12 shadow-2xl" alt="cover" /> )}
                  </motion.div>
                </div>
              </div>

              {/* Horizontal Scroll Quick Picks */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-black">Pilihan cepat</h2>
                <button className="text-[12px] font-medium px-3 py-1 border border-white/20 rounded-full hover:bg-white/10">Putar semua</button>
              </div>

              <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide pb-4">
                {quickPicksChunks.map((chunk, idx) => (
                  <div key={idx} className="flex flex-col gap-3 min-w-[92%] snap-center shrink-0">
                    {chunk.map(s => (
                      <div key={s.id} onClick={() => playSong(s)} className="flex items-center gap-3 py-1 cursor-pointer active:bg-white/10 rounded-lg pr-2 select-none">
                        <img src={s.cover} alt={s.title} className="w-[52px] h-[52px] rounded-md object-cover bg-white/10 shrink-0 shadow-md" loading="lazy" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[15px] text-white truncate">{s.title}</h4>
                          <p className="text-[13px] text-gray-400 truncate">{s.artist} • Viral</p>
                        </div>
                        <button onClick={(e) => addSongToQueue(s, e)} className="p-1"><MoreVertical className="w-5 h-5 text-gray-400 shrink-0" /></button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- DEVELOPER TAB --- */}
        {tab === "developer" && (
          <div className="min-h-full bg-[#030303] px-6 py-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px] -z-10" />
             
             <h2 className="text-3xl font-black mb-8 flex items-center gap-3"><Code className="w-8 h-8 text-blue-500" /> Developer</h2>
             <div className="bg-[#111] border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><img src="/dev-logo.jpg" className="w-16 h-16 rounded-full border-2 border-blue-500/50 object-cover shadow-[0_0_20px_rgba(59,130,246,0.3)]" alt="logo" /></div>
                <h3 className="text-xl font-bold text-white mb-1">BimzOfficial</h3>
                <p className="text-blue-400 text-sm font-medium mb-6">Music App Architect</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">Aplikasi streaming PWA premium dirancang khusus untuk kenyamanan 120fps, putar di latar belakang, dan sinkronisasi data instan. Semua fitur native Android tersedia di web.</p>
             </div>
          </div>
        )}

        {/* --- SEARCH TAB --- */}
        {tab === "search" && (
          <div className="min-h-full bg-[#030303] px-0">
            <div className="flex items-center gap-3 bg-[#222] px-4 py-3 sticky top-0 z-20">
              <button onClick={() => setTab("home")}><ArrowLeft className="w-6 h-6 text-white" /></button>
              <input
                autoFocus
                value={query}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(query)}
                placeholder="Telusuri lagu, artis..."
                className="flex-1 bg-transparent text-white outline-none text-base placeholder-gray-400"
              />
              {query && <X className="w-5 h-5 text-gray-400 cursor-pointer" onClick={() => { setQuery(""); setSuggestions([]); }} />}
              <Mic className="w-5 h-5 text-white shrink-0 ml-1" />
            </div>

            <div className="px-0 py-2">
              {query === "" && searchHistory.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-gray-400 mb-3 px-4">Riwayat Pencarian</h3>
                  <div className="flex flex-col">
                    {searchHistory.map((h, i) => (
                       <div key={i} className="flex items-center justify-between px-4 py-3 active:bg-white/10 cursor-pointer" onClick={() => executeSearch(h)}>
                          <div className="flex items-center gap-4"><History className="w-5 h-5 text-gray-500" /><span className="text-white font-medium">{h}</span></div>
                          <ArrowLeft className="w-4 h-4 text-gray-500 rotate-45" />
                       </div>
                    ))}
                  </div>
                </div>
              )}

              {suggestions.length > 0 ? (
                <div className="space-y-0">
                  {suggestions.map((s, i) => (
                    <div key={i} onClick={() => executeSearch(s)} className="flex items-center gap-4 cursor-pointer px-4 py-3 active:bg-white/5">
                      <Search className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="text-base font-bold text-white truncate">{s}</span>
                      <ArrowLeft className="w-5 h-5 text-gray-500 shrink-0 rotate-45 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : isSearching ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" /></div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3 pb-10 mt-2 px-4">
                  {searchResults.map((s, i) => (
                    <div key={s.id} onClick={() => playSong(s)} className="flex items-center gap-3 cursor-pointer py-1 active:bg-white/5">
                      <img src={s.cover} alt={s.title} className="w-[52px] h-[52px] rounded-md object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[15px] text-white truncate">{s.title}</h4>
                        <p className="text-[13px] text-gray-400 truncate">Lagu • {s.artist} • {s.duration}</p>
                      </div>
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* --- LIBRARY TAB --- */}
        {tab === "library" && (
          <div className="min-h-full bg-[#030303] px-4 py-4">
             {/* Playlists Section */}
             <div className="mb-10">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-[24px] font-black flex items-center gap-2"><FolderPlus className="w-6 h-6" /> Playlist Kamu</h2>
                 <button onClick={() => {
                   const name = prompt("Nama Playlist Baru:");
                   if(name) createPlaylist(name);
                 }} className="bg-white text-black p-2 rounded-full"><PlusCircle className="w-5 h-5" /></button>
               </div>
               
               <div className="grid grid-cols-2 gap-4 mb-6">
                  {playlists.map(pl => (
                     <div key={pl.id} className="bg-white/5 p-4 rounded-2xl flex flex-col justify-between h-32 relative group cursor-pointer active:scale-95 transition">
                        <h3 className="font-bold text-lg text-white leading-tight">{pl.name}</h3>
                        <p className="text-gray-400 text-sm font-medium">{pl.songs.length} lagu</p>
                        <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center"><Music2 className="w-5 h-5 text-white" /></div>
                     </div>
                  ))}
                  {playlists.length === 0 && <p className="text-sm text-gray-500 col-span-2">Belum ada playlist dibuat.</p>}
               </div>
             </div>

             {/* History Section */}
             <h2 className="text-[24px] font-black mb-6 flex items-center gap-2"><History className="w-6 h-6" /> Riwayat Putar</h2>
             <div className="flex flex-col gap-3">
                {history.length > 0 ? history.map((s, i) => (
                  <div key={i + s.id} onClick={() => playSong(s)} className="flex items-center gap-3 py-1 cursor-pointer active:bg-white/5 rounded-lg pr-2 select-none">
                    <img src={s.cover} alt={s.title} className="w-[52px] h-[52px] rounded-md object-cover bg-white/10 shrink-0 shadow-md" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[15px] text-white truncate">{s.title}</h4>
                      <p className="text-[13px] text-gray-400 truncate">{s.artist}</p>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400 shrink-0" />
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-10 font-medium">Belum ada riwayat lagu.</p>
                )}
             </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#212121] flex justify-around items-center h-[60px] z-40 pb-1 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <button onClick={() => setTab("home")} className={`flex flex-col items-center gap-1 w-full pt-2 ${tab === "home" ? "text-white" : "text-gray-400"}`}><Home className={`w-6 h-6 ${tab==="home"?"fill-white":""}`} /><span className="text-[10px] font-medium">Beranda</span></button>
        <button onClick={() => setTab("search")} className={`flex flex-col items-center gap-1 w-full pt-2 ${tab === "search" ? "text-white" : "text-gray-400"}`}><Search className="w-6 h-6" /><span className="text-[10px] font-medium">Telusuri</span></button>
        <button onClick={() => setTab("library")} className={`flex flex-col items-center gap-1 w-full pt-2 ${tab === "library" ? "text-white" : "text-gray-400"}`}><Library className={`w-6 h-6 ${tab==="library"?"fill-white":""}`} /><span className="text-[10px] font-medium">Koleksi</span></button>
        <button onClick={() => setTab("developer")} className={`flex flex-col items-center gap-1 w-full pt-2 ${tab === "developer" ? "text-white" : "text-gray-400"}`}><Code className={`w-6 h-6 ${tab==="developer"?"text-blue-500":""}`} /><span className="text-[10px] font-medium">Developer</span></button>
      </div>

      {/* --- MINI PLAYER --- */}
      <AnimatePresence>
        {currentSong && playerMode === "mini" && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.2 }}
            className="fixed bottom-[60px] left-0 right-0 bg-[#2b2b2b] flex items-center p-2 gap-3 shadow-2xl z-40 cursor-pointer active:bg-[#333]"
            onClick={() => setPlayerMode("full")}
          >
            <img src={currentSong.cover} alt={currentSong.title} className="w-10 h-10 rounded object-cover shrink-0 bg-black" />
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-bold text-[14px] text-white truncate leading-tight">{currentSong.title}</h4>
              <p className="text-[12px] text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-4 pr-3 shrink-0" onClick={e => e.stopPropagation()}>
              <Cast className="w-5 h-5 text-white" />
              <button onClick={togglePlay} className="p-1">
                {isPlaying ? <Pause className="w-6 h-6 text-white fill-white" /> : <Play className="w-6 h-6 text-white fill-white" />}
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
              <div className="h-full bg-white transition-all duration-[100ms] ease-linear" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FULL PLAYER OVERLAY --- */}
      <AnimatePresence>
        {currentSong && (playerMode === "full" || playerMode === "lyrics" || playerMode === "queue") && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-0 bg-[#1a0a10] z-50 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-transparent">
              <button onClick={() => setPlayerMode("mini")} className="p-2 -ml-2"><ChevronDown className="w-7 h-7 text-white" /></button>
              <div className="flex items-center gap-5">
                <Cast className="w-6 h-6 text-white" />
                <MoreVertical className="w-6 h-6 text-white" />
              </div>
            </div>

            {playerMode === "full" ? (
              <div className="flex-1 flex flex-col pb-4 h-full justify-between">
                {/* Cover Art */}
                <div className="w-full flex-1 max-h-[50vh] bg-[#000000] flex items-center justify-center mt-2 overflow-hidden shrink-0 relative">
                   <img src={currentSong.cover} alt={currentSong.title} className="w-full h-auto max-h-full object-contain" />
                </div>

                <div className="px-6 mt-6 flex flex-col gap-5 shrink-0">
                  {/* Info Text */}
                  <div className="flex flex-col w-full" onClick={async () => {
                      setPlayerMode("mini");
                      try {
                        const r = await fetch(`/api/search?q=${encodeURIComponent(currentSong.artist + " lagu")}`);
                        const d = await r.json();
                        setArtistView({
                           ...currentSong,
                           artist: currentSong.artist,
                           cover: d[0]?.cover || currentSong.cover,
                           related: d.slice(0, 5)
                        } as any);
                      } catch { setArtistView(currentSong); }
                  }}>
                     <h2 className="text-[24px] font-black text-white truncate leading-tight flex items-center gap-1 cursor-pointer">
                        {currentSong.title} <ChevronRight className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
                     </h2>
                     <p className="text-gray-300 text-[16px] truncate font-medium mt-1 cursor-pointer">{currentSong.artist}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-6 px-6 relative" style={{transform:'translateZ(0)'}}>
                    <button className="flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap active:bg-white/20"><ThumbsUp className="w-[18px] h-[18px]" /> {formatNum(Math.floor(Math.random()*90000)+10000)}</button>
                    <button className="flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap active:bg-white/20"><ThumbsDown className="w-[18px] h-[18px]" /></button>
                    <button onClick={() => setPlayerMode("lyrics")} className="flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap active:bg-white/20"><MessageSquare className="w-[18px] h-[18px]" /> Lirik</button>
                    <button onClick={() => setShowPlaylistModal(true)} className="flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap active:bg-white/20"><CheckCircle2 className="w-[18px] h-[18px]" /> Simpan</button>
                    <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-white/10 px-4 py-2 rounded-full text-[14px] font-medium whitespace-nowrap active:bg-white/20"><Share2 className="w-[18px] h-[18px]" /> Bagikan</button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2 w-full mt-2">
                    <div className="relative w-full h-[3px] bg-white/30 rounded-full flex items-center mb-3">
                       <div className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-[100ms] ease-linear" style={{ width: `${duration ? (progress / duration) * 100 : 0}%`, transform:'translateZ(0)' }} />
                       <div className="absolute w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-[100ms] ease-linear" style={{ left: `calc(${duration ? (progress / duration) * 100 : 0}% - 7px)`, transform:'translateZ(0)' }} />
                       <input type="range" min={0} max={duration || 100} value={progress} onChange={seek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-gray-400 font-medium">
                      <span>{formatTime(progress)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Media Controls */}
                  <div className="flex items-center justify-between px-2 mb-2 w-full">
                    <button className="p-2 active:bg-white/10 rounded-full"><Shuffle className="w-6 h-6 text-white" /></button>
                    <button className="p-2 active:bg-white/10 rounded-full"><SkipBack className="w-9 h-9 text-white fill-white" /></button>
                    <button onClick={togglePlay} className="w-[72px] h-[72px] bg-white text-black rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform">
                      {isPlaying ? <Pause className="w-9 h-9 fill-black" /> : <Play className="w-9 h-9 fill-black ml-1.5" />}
                    </button>
                    <button onClick={playNext} className="p-2 active:bg-white/10 rounded-full"><SkipForward className="w-9 h-9 text-white fill-white" /></button>
                    <button className="p-2 active:bg-white/10 rounded-full"><Repeat className="w-6 h-6 text-white" /></button>
                  </div>

                  {/* Bottom Mix Text - Click to open Queue */}
                  <div className="flex items-center justify-center w-full pb-2 cursor-pointer active:opacity-50 transition" onClick={() => setPlayerMode("queue")}>
                    <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                       <ListMusic className="w-4 h-4 text-white" />
                       <span className="text-[13px] font-bold text-white/90">Mix {currentSong.title}</span>
                       <ChevronDown className="w-4 h-4 text-gray-400 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            ) : playerMode === "lyrics" ? (
              /* --- LYRICS VIEW (120FPS Smooth Karaoke Scroll & Translate) --- */
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[#1a0a10]">
                <div className="absolute inset-0 z-0">
                   <img src={currentSong.cover} className="w-full h-full object-cover blur-[80px] opacity-30 scale-150" alt="blur" />
                </div>
                <div className="relative z-10 p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6 shrink-0">
                    <div className="flex items-center gap-3">
                       <img src={currentSong.cover} className="w-12 h-12 rounded object-cover" alt="cover" />
                       <div>
                          <h3 className="text-[15px] font-bold leading-tight">{currentSong.title}</h3>
                          <p className="text-[13px] text-gray-300">{currentSong.artist}</p>
                       </div>
                    </div>
                    <button onClick={() => setPlayerMode("full")} className="p-2 bg-black/20 rounded-full backdrop-blur-md"><X className="w-5 h-5" /></button>
                  </div>
                  
                  {/* High Framerate Smooth Scrolling Lyrics Container */}
                  <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto space-y-6 pb-64 pt-32 mask-image-fade" style={{scrollBehavior: 'smooth', transform:'translateZ(0)', willChange: 'scroll-position'}}>
                    {parsedLyrics.length > 0 ? (
                      parsedLyrics.map((line, i) => {
                        const isActive = i === activeLyricIndex;
                        return (
                          <div key={i} className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.98]'}`}>
                             <p className={`text-[28px] font-black leading-snug tracking-tight ${isActive ? 'text-white' : 'text-gray-300'}`}>{line.text || '\u00A0'}</p>
                             {showTranslation && line.translated && (
                               <p className={`text-[18px] font-bold mt-1 leading-snug text-blue-300`}>{line.translated}</p>
                             )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <p className="text-xl font-bold">Lirik tidak tersedia.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-center gap-4 shrink-0 bg-transparent">
                     <button onClick={toggleTranslate} disabled={isTranslating} className="bg-white/10 px-5 py-2.5 rounded-full text-[13px] font-bold flex gap-2 backdrop-blur-md active:bg-white/20 items-center">
                        <Globe2 className="w-4 h-4" /> {isTranslating ? "Menerjemahkan..." : showTranslation ? "Kembalikan seperti semula" : "Terjemahkan"}
                     </button>
                     <button onClick={handleShare} className="bg-white/10 px-5 py-2.5 rounded-full text-[13px] font-bold flex gap-2 backdrop-blur-md active:bg-white/20 items-center"><Share2 className="w-4 h-4" /> Bagikan</button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- QUEUE / MIX VIEW --- */
              <div className="flex-1 flex flex-col relative overflow-hidden bg-[#111]">
                 <div className="p-4 shrink-0 flex items-center justify-between border-b border-white/10">
                    <h2 className="text-xl font-bold flex items-center gap-2"><ListMusic className="w-5 h-5" /> Antrean Mix</h2>
                    <button onClick={() => setPlayerMode("full")} className="p-2"><X className="w-6 h-6 text-white" /></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="mb-4">
                       <p className="text-sm font-bold text-[#3b82f6] mb-2 uppercase tracking-wider">Sekarang Diputar</p>
                       <div className="flex items-center gap-3 py-2 bg-white/5 p-2 rounded-xl">
                         <img src={currentSong.cover} className="w-[52px] h-[52px] rounded-md object-cover" />
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-[15px] text-white truncate">{currentSong.title}</h4>
                           <p className="text-[13px] text-gray-400 truncate">{currentSong.artist}</p>
                         </div>
                         <div className="w-6 h-6 flex items-center justify-center mr-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" /></div>
                       </div>
                    </div>

                    <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider mt-6">Berikutnya dalam Mix</p>
                    {queue.length > 0 ? queue.map((s, i) => (
                      <div key={i + s.id} className="flex items-center gap-3 py-1 group">
                        <div className="w-6 text-center text-sm font-bold text-gray-500">{i + 1}</div>
                        <img src={s.cover} className="w-[46px] h-[46px] rounded-md object-cover cursor-pointer" onClick={() => playSong(s)} />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playSong(s)}>
                          <h4 className="font-bold text-[15px] text-white truncate">{s.title}</h4>
                          <p className="text-[13px] text-gray-400 truncate">{s.artist}</p>
                        </div>
                        <button onClick={() => removeFromQueue(i)} className="p-2 text-gray-500 hover:text-white active:scale-90"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 text-center py-10">Mencari lagu berikutnya...</p>
                    )}
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrapper ensures Google Provider wrapper wraps the whole app allowing client ID injection on vercel
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}