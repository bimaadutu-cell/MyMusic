export type MusicItem = {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  duration: string;
  seconds: number;
  year: number;
  genre: string;
  mood: string;
  youtubeId: string;
  youtubeUrl: string;
  sectionTags: string[];
  color: string;
  description: string;
  source: "Official Stream";
  lyricsAvailable: boolean;
  views?: string;
};

export type PlaylistItem = {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: string[];
  accent: string;
};

export type ArtistItem = {
  id: string;
  name: string;
  genre: string;
  monthlyListeners: string;
  image: string;
};

export type AdminSettings = {
  bannerTitle: string;
  bannerSubtitle: string;
  featuredPlaylist: string;
  theme: "neon" | "emerald" | "cyber";
  developerName: string;
  categories: string[];
};

const coverFromId = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const urlFromId = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const genres = [
  "Pop",
  "Rock",
  "Dangdut",
  "EDM",
  "Jazz",
  "Hip Hop",
  "Lo-fi",
  "Religi",
  "K-Pop",
  "Indie",
  "Acoustic",
  "Classical",
  "R&B",
  "Metal",
  "Reggae",
  "Anime",
  "Podcast",
];

const makeTrack = (item: Omit<MusicItem, "cover" | "youtubeUrl" | "source">): MusicItem => ({
  ...item,
  cover: coverFromId(item.youtubeId),
  youtubeUrl: urlFromId(item.youtubeId),
  source: "Official Stream",
});

export const musicCatalog: MusicItem[] = [
  makeTrack({
    id: "sency-dia-tenxi",
    title: "SENCY",
    artist: "dia & Tenxi",
    album: "INI DIA - EP",
    duration: "2:33",
    seconds: 153,
    year: 2025,
    genre: "Pop",
    mood: "Viral",
    youtubeId: "nhH4Oaggf1k",
    sectionTags: ["Viral Now", "Top Indonesia", "Lagu Terbaru", "Rekomendasi"],
    color: "#00FF88",
    description: "Single pop viral dengan energi ringan untuk feed harian.",
    lyricsAvailable: false,
    views: "Viral",
  }),
  makeTrack({
    id: "mejikuhibiniu-tenxi-suisei-jemsii",
    title: "mejikuhibiniu",
    artist: "Tenxi, suisei & Jemsii",
    album: "mejikuhibiniu - Single",
    duration: "3:16",
    seconds: 196,
    year: 2025,
    genre: "Hip Hop",
    mood: "Hipdut",
    youtubeId: "aIWpGeXMfrI",
    sectionTags: ["Viral Now", "Top Indonesia", "Lagu Terbaru", "Genre"],
    color: "#18ff9b",
    description: "Track hip hop Indonesia yang ramai dipakai di konten pendek.",
    lyricsAvailable: false,
    views: "Viral",
  }),
  makeTrack({
    id: "astaga-bercanda-akbar-mingse",
    title: "Astaga Bercanda",
    artist: "Akbar Chalay & Mingse",
    album: "Astaga Bercanda - Single",
    duration: "2:46",
    seconds: 166,
    year: 2026,
    genre: "Pop",
    mood: "Viral",
    youtubeId: "9kY-IMgL3Kc",
    sectionTags: ["Viral Now", "Top Indonesia", "Lagu Terbaru", "Rekomendasi"],
    color: "#00df76",
    description: "Lagu viral Indonesia dengan hook yang mudah menempel.",
    lyricsAvailable: false,
    views: "Viral",
  }),
  makeTrack({
    id: "garam-madu-tenxi-naykilla-jemsii",
    title: "Garam & Madu (Sakit Dadaku)",
    artist: "Tenxi, Naykilla & Jemsii",
    album: "Garam & Madu - Single",
    duration: "3:04",
    seconds: 184,
    year: 2024,
    genre: "Hip Hop",
    mood: "Hipdut",
    youtubeId: "JlUAunK6gPw",
    sectionTags: ["Viral Now", "Top Indonesia", "Favorite", "Continue Listening"],
    color: "#25ffa6",
    description: "Perpaduan hip hop dan dangdut modern yang mendominasi tren lokal.",
    lyricsAvailable: false,
    views: "Viral",
  }),
  makeTrack({
    id: "faded-alan-walker",
    title: "Faded",
    artist: "Alan Walker",
    album: "Different World",
    duration: "3:33",
    seconds: 213,
    year: 2015,
    genre: "EDM",
    mood: "Epic",
    youtubeId: "60ItHLz5WEA",
    sectionTags: ["Top Global", "Rekomendasi", "Continue Listening"],
    color: "#00FF88",
    description: "Electronic anthem global untuk nuansa digital neon.",
    lyricsAvailable: false,
    views: "3B+",
  }),
  makeTrack({
    id: "blinding-lights-weeknd",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "4:22",
    seconds: 262,
    year: 2019,
    genre: "Pop",
    mood: "Night Drive",
    youtubeId: "4NRXx6U8ABQ",
    sectionTags: ["Top Global", "Trending", "Continue Listening"],
    color: "#00e078",
    description: "Synth-pop modern untuk mode perjalanan malam.",
    lyricsAvailable: false,
    views: "1B+",
  }),
  makeTrack({
    id: "shape-of-you-ed-sheeran",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    duration: "4:24",
    seconds: 264,
    year: 2017,
    genre: "R&B",
    mood: "Groove",
    youtubeId: "JGwWNGJdvx8",
    sectionTags: ["Top Global", "Favorite", "Trending"],
    color: "#00ffb3",
    description: "Pop-R&B global dengan groove yang kuat.",
    lyricsAvailable: false,
    views: "6B+",
  }),
  makeTrack({
    id: "dynamite-bts",
    title: "Dynamite",
    artist: "BTS",
    album: "BE",
    duration: "3:43",
    seconds: 223,
    year: 2020,
    genre: "K-Pop",
    mood: "Bright",
    youtubeId: "gdZLi9oWNZg",
    sectionTags: ["Top Global", "Top Artist", "K-Pop"],
    color: "#19ff96",
    description: "K-pop global dengan energi panggung cerah.",
    lyricsAvailable: false,
    views: "1B+",
  }),
  makeTrack({
    id: "ddu-du-blackpink",
    title: "DDU-DU DDU-DU",
    artist: "BLACKPINK",
    album: "Square Up",
    duration: "3:36",
    seconds: 216,
    year: 2018,
    genre: "K-Pop",
    mood: "Power",
    youtubeId: "IHNzOHi8sJs",
    sectionTags: ["Top Global", "Top Artist", "K-Pop"],
    color: "#2cffaa",
    description: "K-pop anthem dengan visual dan hook ikonik.",
    lyricsAvailable: false,
    views: "2B+",
  }),
  makeTrack({
    id: "yoasobi-idol",
    title: "Idol",
    artist: "YOASOBI",
    album: "Oshi no Ko Opening Theme",
    duration: "3:46",
    seconds: 226,
    year: 2023,
    genre: "Anime",
    mood: "Hyperpop",
    youtubeId: "ZRtdQ81jPUQ",
    sectionTags: ["Top Global", "Anime", "Lagu Terbaru"],
    color: "#00c46a",
    description: "J-pop/anime populer dengan produksi cepat dan detail.",
    lyricsAvailable: false,
    views: "600M+",
  }),
  makeTrack({
    id: "believer-imagine-dragons",
    title: "Believer",
    artist: "Imagine Dragons",
    album: "Evolve",
    duration: "3:37",
    seconds: 217,
    year: 2017,
    genre: "Rock",
    mood: "Energy",
    youtubeId: "7wtfhZwyrcc",
    sectionTags: ["Top Global", "Rock", "Trending"],
    color: "#39ff14",
    description: "Rock modern bertenaga untuk boost aktivitas.",
    lyricsAvailable: false,
    views: "2B+",
  }),
  makeTrack({
    id: "yellow-coldplay",
    title: "Yellow",
    artist: "Coldplay",
    album: "Parachutes",
    duration: "4:33",
    seconds: 273,
    year: 2000,
    genre: "Indie",
    mood: "Dreamy",
    youtubeId: "yKNxeF4KMsY",
    sectionTags: ["Album Terbaru", "Rekomendasi", "Indie"],
    color: "#00bf68",
    description: "Indie rock klasik untuk suasana tenang.",
    lyricsAvailable: false,
    views: "1B+",
  }),
  makeTrack({
    id: "numb-linkin-park",
    title: "Numb",
    artist: "Linkin Park",
    album: "Meteora",
    duration: "3:07",
    seconds: 187,
    year: 2003,
    genre: "Metal",
    mood: "Intense",
    youtubeId: "kXYiU_JCYtU",
    sectionTags: ["Top Global", "Metal", "Continue Listening"],
    color: "#00FF88",
    description: "Rock/metal alternatif dengan energi kuat.",
    lyricsAvailable: false,
    views: "2B+",
  }),
  makeTrack({
    id: "alone-marshmello",
    title: "Alone",
    artist: "Marshmello",
    album: "Alone",
    duration: "3:20",
    seconds: 200,
    year: 2016,
    genre: "EDM",
    mood: "Workout",
    youtubeId: "ALZHF5UqnU4",
    sectionTags: ["EDM", "Playlist Pilihan", "Trending"],
    color: "#00FF88",
    description: "EDM populer untuk latihan dan gaming.",
    lyricsAvailable: false,
    views: "2B+",
  }),
  makeTrack({
    id: "lofi-girl-radio",
    title: "lofi hip hop radio - beats to relax/study to",
    artist: "Lofi Girl",
    album: "Live Radio",
    duration: "Live",
    seconds: 600,
    year: 2026,
    genre: "Lo-fi",
    mood: "Focus",
    youtubeId: "jfKfPfyJRdk",
    sectionTags: ["Lo-fi", "Recently Played", "Continue Listening"],
    color: "#00FF88",
    description: "Radio fokus untuk belajar, bekerja, dan membaca.",
    lyricsAvailable: false,
    views: "Live",
  }),
];

export const featuredPlaylists: PlaylistItem[] = [
  {
    id: "viral-indo-2026",
    name: "Viral Indonesia",
    description: "SENCY, mejikuhibiniu, Astaga Bercanda, dan tren hipdut terbaru.",
    cover: musicCatalog[0].cover,
    tracks: ["sency-dia-tenxi", "mejikuhibiniu-tenxi-suisei-jemsii", "astaga-bercanda-akbar-mingse", "garam-madu-tenxi-naykilla-jemsii"],
    accent: "#00FF88",
  },
  {
    id: "global-clean",
    name: "Global Stream",
    description: "Hits internasional rapi untuk mood harian.",
    cover: musicCatalog[5].cover,
    tracks: ["faded-alan-walker", "blinding-lights-weeknd", "shape-of-you-ed-sheeran", "believer-imagine-dragons"],
    accent: "#25ffa6",
  },
  {
    id: "kpop-anime-stage",
    name: "K-Pop & Anime",
    description: "Artist stage, anime pop, dan energi visual modern.",
    cover: musicCatalog[7].cover,
    tracks: ["dynamite-bts", "ddu-du-blackpink", "yoasobi-idol"],
    accent: "#19ff96",
  },
  {
    id: "focus-night",
    name: "Focus Night",
    description: "Lo-fi, indie, dan EDM ringan untuk fokus malam.",
    cover: musicCatalog[14].cover,
    tracks: ["lofi-girl-radio", "yellow-coldplay", "alone-marshmello", "numb-linkin-park"],
    accent: "#00bf68",
  },
];

export const topArtists: ArtistItem[] = [
  { id: "tenxi", name: "Tenxi", genre: "Hip Hop / Hipdut", monthlyListeners: "Trend naik", image: musicCatalog[1].cover },
  { id: "naykilla", name: "Naykilla", genre: "Hipdut / Pop", monthlyListeners: "Trend naik", image: musicCatalog[3].cover },
  { id: "dia", name: "dia", genre: "Pop", monthlyListeners: "Viral", image: musicCatalog[0].cover },
  { id: "bts", name: "BTS", genre: "K-Pop", monthlyListeners: "Global", image: musicCatalog[7].cover },
  { id: "yoasobi", name: "YOASOBI", genre: "Anime / J-Pop", monthlyListeners: "Global", image: musicCatalog[9].cover },
  { id: "the-weeknd", name: "The Weeknd", genre: "Pop / R&B", monthlyListeners: "Global", image: musicCatalog[5].cover },
];

export const defaultAdminSettings: AdminSettings = {
  bannerTitle: "MyMusik Premium Stream",
  bannerSubtitle: "Struktur baru yang rapi, pencarian cepat, rak artis modern, dan pemutar resmi di dalam web tanpa membuka tab lain.",
  featuredPlaylist: "Viral Indonesia",
  theme: "neon",
  developerName: "BimzOfficial",
  categories: genres,
};

export const getTracksByTag = (tag: string) => musicCatalog.filter((track) => track.sectionTags.includes(tag) || track.genre === tag);

export const searchCatalog = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return musicCatalog;
  return musicCatalog.filter((track) =>
    [track.title, track.artist, track.album, track.genre, track.mood, track.description, ...track.sectionTags]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
};
