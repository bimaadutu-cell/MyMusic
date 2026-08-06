import { Song, Artist, Album, SearchResult } from '@/types';

export type { Song, Artist, Album, SearchResult };

// Simulasi database lagu - dalam produksi sebenarnya akan menggunakan API nyata
export const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Astaga Bercanda',
    artist: 'Akbar Chalay & Mingse',
    album: 'Astaga Bercanda',
    cover: 'https://i.ytimg.com/vi/9qwmR23f3m4/maxresdefault.jpg',
    duration: '2:46',
    durationSeconds: 166,
    year: '2024',
    genre: 'Pop',
    views: '16000000',
    videoId: '9qwmR23f3m4',
    lyrics: [
      { time: 0, text: "Pusing tujuh keliling, ya, aku harus bersaing" },
      { time: 4, text: "'Tuk dapatkan kamu, ku siap bertanding" },
      { time: 8, text: "Muka, enggak kalah saing" },
      { time: 12, text: "Untuk humor, aku winning" },
      { time: 16, text: "Buat kamu senyum, sering" },
      { time: 20, text: "Tahu kamu paling penting" },
      { time: 24, text: "Kalau bisa sekarang saja" },
      { time: 28, text: "Ku tahu semua yang kausuka" },
      { time: 32, text: "Untuk apa terus dengannya?" },
      { time: 36, text: "Karena se-" },
      { time: 40, text: "Semua-mua yang aku mau" },
      { time: 44, text: "Ada padamu, kok bisa gitu?" },
      { time: 48, text: "A-aduh, pusing kepala, ci-cinta segitiga" },
      { time: 52, text: "Ku mau-mau aja jadi yang kedua" },
      { time: 56, text: "Eh, astaga, bercanda" },
      { time: 60, text: "Aku tunggu aja jadi yang pertama" },
      { time: 64, text: "Astaga, bercanda" },
    ]
  },
  {
    id: '2',
    title: 'Bergema Sampai Selamanya',
    artist: 'Nadhif Basalamah',
    album: 'Bergema Sampai Selamanya',
    cover: 'https://i.ytimg.com/vi/3rI37Cux_Pc/maxresdefault.jpg',
    duration: '4:12',
    durationSeconds: 252,
    year: '2023',
    genre: 'Pop',
    views: '201000000',
    videoId: '3rI37Cux_Pc',
    lyrics: [
      { time: 0, text: "Senyummu bagai sinar mentari pagi" },
      { time: 5, text: "Hangatkan hatiku yang terdiam membeku" },
      { time: 10, text: "Suaramu bagai alunan melodi" },
      { time: 15, text: "Tenangkan batiniku yang resah dan gelisah" },
      { time: 20, text: "Bergema sampai selamanya" },
      { time: 25, text: "Cintaku padamu takkan pernah sirna" },
      { time: 30, text: "Bergema sampai selamanya" },
      { time: 35, text: "Kau dan aku selamanya" },
    ]
  },
  {
    id: '3',
    title: 'Sesi Potret',
    artist: 'enau & Ari Lesmana',
    album: 'Sesi Potret',
    cover: 'https://i.ytimg.com/vi/S1v7rSNoF9Y/maxresdefault.jpg',
    duration: '3:45',
    durationSeconds: 225,
    year: '2024',
    genre: 'Indie',
    views: '166000000',
    videoId: 'S1v7rSNoF9Y',
    lyrics: [
      { time: 0, text: "Kita berdua tersesat dalam waktu" },
      { time: 5, text: "Merekam jejak dalam bingkai biru" },
      { time: 10, text: "Sesi potret kenangan yang indah" },
      { time: 15, text: "Antara kau dan aku" },
      { time: 20, text: "Momen ini abadi selamanya" },
      { time: 25, text: "Tersimpan dalam lubuk hati" },
    ]
  },
  {
    id: '4',
    title: 'Sorry',
    artist: 'Justin Bieber',
    album: 'Purpose',
    cover: 'https://i.ytimg.com/vi/fRh_vgS2dFE/maxresdefault.jpg',
    duration: '3:20',
    durationSeconds: 200,
    year: '2015',
    genre: 'Pop',
    views: '3700000000',
    videoId: 'fRh_vgS2dFE',
    lyrics: [
      { time: 0, text: "You gotta go and get angry at all of my honesty" },
      { time: 4, text: "You know I try but I don't do too well with apologies" },
      { time: 8, text: "I hope I don't run out of time, can someone call a referee?" },
      { time: 12, text: "Cause I just need one more shot at forgiveness" },
      { time: 16, text: "I know you know that I made those mistakes maybe once or twice" },
      { time: 20, text: "By once or twice I mean maybe a couple of hundred times" },
      { time: 24, text: "So let me, oh let me redeem, oh redeem, oh myself tonight" },
      { time: 28, text: "Cause I just need one more shot at second chances" },
      { time: 32, text: "Yeah, is it too late now to say sorry?" },
      { time: 36, text: "Cause I'm missing more than just your body" },
      { time: 40, text: "Is it too late now to say sorry?" },
      { time: 44, text: "Yeah I know that I let you down" },
      { time: 48, text: "Is it too late to say I'm sorry now?" },
    ]
  },
  {
    id: '5',
    title: 'Love Yourself',
    artist: 'Justin Bieber',
    album: 'Purpose',
    cover: 'https://i.ytimg.com/vi/oyEuk8j8imI/maxresdefault.jpg',
    duration: '3:53',
    durationSeconds: 233,
    year: '2015',
    genre: 'Pop',
    views: '1800000000',
    videoId: 'oyEuk8j8imI',
  },
  {
    id: '6',
    title: 'Penyangkalan',
    artist: 'for Revenge',
    album: 'Penyangkalan',
    cover: 'https://i.ytimg.com/vi/8T9Cq6Lq2m8/maxresdefault.jpg',
    duration: '4:05',
    durationSeconds: 245,
    year: '2023',
    genre: 'Rock',
    views: '80000000',
    videoId: '8T9Cq6Lq2m8',
    lyrics: [
      { time: 0, text: "Ku ingin lari dari kenyataan" },
      { time: 5, text: "Menyangkal semua yang terjadi" },
      { time: 10, text: "Tapi rasa ini tak bisa bohong" },
      { time: 15, text: "Cinta yang telah hilang" },
    ]
  },
  {
    id: '7',
    title: 'Utara - Selatan',
    artist: 'UNGU',
    album: 'Timeless',
    cover: 'https://i.ytimg.com/vi/8kzjT9X3z3o/maxresdefault.jpg',
    duration: '4:20',
    durationSeconds: 260,
    year: '2022',
    genre: 'Pop Rock',
    views: '264000000',
    videoId: '8kzjT9X3z3o',
  },
  {
    id: '8',
    title: 'Sudah Tahu Tuhan Kita Berbeda',
    artist: 'enau & Momo',
    album: 'Sudah Tahu',
    cover: 'https://i.ytimg.com/vi/5Ia1i8t9d3E/maxresdefault.jpg',
    duration: '3:30',
    durationSeconds: 210,
    year: '2023',
    genre: 'Indie',
    views: '110000000',
    videoId: '5Ia1i8t9d3E',
  },
  {
    id: '9',
    title: 'Aku Harus Pergi',
    artist: 'Whisnu Santika & Ari Lesmana',
    album: 'Aku Harus Pergi',
    cover: 'https://i.ytimg.com/vi/3q7o1X4r8zY/maxresdefault.jpg',
    duration: '3:55',
    durationSeconds: 235,
    year: '2023',
    genre: 'Pop',
    views: '8400000',
    videoId: '3q7o1X4r8zY',
  },
  {
    id: '10',
    title: 'Peaches',
    artist: 'Justin Bieber ft. Daniel Caesar, Giveon',
    album: 'Justice',
    cover: 'https://i.ytimg.com/vi/tQ0yjYUFKAE/maxresdefault.jpg',
    duration: '3:18',
    durationSeconds: 198,
    year: '2021',
    genre: 'R&B',
    views: '900000000',
    videoId: 'tQ0yjYUFKAE',
  },
  {
    id: '11',
    title: 'Ghost',
    artist: 'Justin Bieber',
    album: 'Justice',
    cover: 'https://i.ytimg.com/vi/Fp8msa5uYsc/maxresdefault.jpg',
    duration: '2:33',
    durationSeconds: 153,
    year: '2021',
    genre: 'Pop',
    views: '800000000',
    videoId: 'Fp8msa5uYsc',
  },
  {
    id: '12',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'F*CK LOVE 3',
    cover: 'https://i.ytimg.com/vi/kTJczUoc26U/maxresdefault.jpg',
    duration: '2:21',
    durationSeconds: 141,
    year: '2021',
    genre: 'Pop',
    views: '1000000000',
    videoId: 'kTJczUoc26U',
  },
  {
    id: '13',
    title: 'Jangan Pergi Dulu',
    artist: 'Tiara Andini',
    album: 'Tiara Andini',
    cover: 'https://i.ytimg.com/vi/4f4z4f4z4f4/maxresdefault.jpg',
    duration: '3:45',
    durationSeconds: 225,
    year: '2023',
    genre: 'Pop',
    views: '50000000',
    videoId: '4f4z4f4z4f4',
  },
  {
    id: '14',
    title: 'Tak Ingin Usai',
    artist: 'Keisya Levronka',
    album: 'Tak Ingin Usai',
    cover: 'https://i.ytimg.com/vi/5f5z5f5z5f5/maxresdefault.jpg',
    duration: '4:10',
    durationSeconds: 250,
    year: '2022',
    genre: 'Pop',
    views: '180000000',
    videoId: '5f5z5f5z5f5',
  },
  {
    id: '15',
    title: 'Kutunggu Kau Putus',
    artist: 'Sheryl Sheinafia',
    album: 'Kutunggu Kau Putus',
    cover: 'https://i.ytimg.com/vi/6g6z6g6z6g6/maxresdefault.jpg',
    duration: '3:30',
    durationSeconds: 210,
    year: '2023',
    genre: 'Pop',
    views: '75000000',
    videoId: '6g6z6g6z6g6',
  },
];

export const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Justin Bieber',
    cover: 'https://i.ytimg.com/vi/fRh_vgS2dFE/maxresdefault.jpg',
    subscribers: '72,5 jt',
    description: 'Justin Drew Bieber adalah penyanyi dan penulis lagu berkebangsaan Kanada.',
    topSongs: mockSongs.filter(s => s.artist.includes('Justin Bieber')).slice(0, 5),
  },
  {
    id: '2',
    name: 'Nadhif Basalamah',
    cover: 'https://i.ytimg.com/vi/3rI37Cux_Pc/maxresdefault.jpg',
    subscribers: '5,2 jt',
    description: 'Nadhif Basalamah adalah penyanyi Indonesia yang dikenal dengan lagu-lagu religi dan pop.',
    topSongs: mockSongs.filter(s => s.artist === 'Nadhif Basalamah'),
  },
  {
    id: '3',
    name: 'Ari Lesmana',
    cover: 'https://i.ytimg.com/vi/S1v7rSNoF9Y/maxresdefault.jpg',
    subscribers: '3,28 jt',
    description: 'Ari Lesmana adalah musisi Indonesia yang merupakan vokalis dari band Sunset.',
    topSongs: mockSongs.filter(s => s.artist.includes('Ari Lesmana')),
  },
  {
    id: '4',
    name: 'Akbar Chalay',
    cover: 'https://i.ytimg.com/vi/9qwmR23f3m4/maxresdefault.jpg',
    subscribers: '2,1 jt',
    description: 'Akbar Chalay adalah penyanyi dan konten kreator Indonesia.',
    topSongs: mockSongs.filter(s => s.artist.includes('Akbar Chalay')),
  },
  {
    id: '5',
    name: 'UNGU',
    cover: 'https://i.ytimg.com/vi/8kzjT9X3z3o/maxresdefault.jpg',
    subscribers: '8,5 jt',
    description: 'Ungu adalah grup musik rock Indonesia yang formed pada tahun 1996.',
    topSongs: mockSongs.filter(s => s.artist === 'UNGU'),
  },
  {
    id: '6',
    name: 'for Revenge',
    cover: 'https://i.ytimg.com/vi/8T9Cq6Lq2m8/maxresdefault.jpg',
    subscribers: '1,8 jt',
    description: 'for Revenge adalah band rock asal Indonesia.',
    topSongs: mockSongs.filter(s => s.artist === 'for Revenge'),
  },
];

export function searchSongs(query: string): SearchResult {
  const lowerQuery = query.toLowerCase();
  
  const songs = mockSongs.filter(s => 
    s.title.toLowerCase().includes(lowerQuery) ||
    s.artist.toLowerCase().includes(lowerQuery) ||
    s.album.toLowerCase().includes(lowerQuery)
  );
  
  const artists = mockArtists.filter(a => 
    a.name.toLowerCase().includes(lowerQuery)
  );
  
  return {
    songs,
    artists,
    albums: [],
    playlists: []
  };
}

export function getSongById(id: string): Song | undefined {
  return mockSongs.find(s => s.id === id);
}

export function getArtistById(id: string): Artist | undefined {
  return mockArtists.find(a => a.id === id);
}

export function getSongsByGenre(genre: string): Song[] {
  return mockSongs.filter(s => s.genre === genre);
}

export function getTrendingSongs(): Song[] {
  return [...mockSongs].sort((a, b) => {
    const viewsA = parseInt(a.views || '0');
    const viewsB = parseInt(b.views || '0');
    return viewsB - viewsA;
  }).slice(0, 10);
}

export function getNewReleases(): Song[] {
  return [...mockSongs]
    .filter(s => parseInt(s.year || '0') >= 2023)
    .slice(0, 10);
}

export function getQuickPicks(): Song[] {
  return shuffleArray(mockSongs).slice(0, 4);
}

export function getMoodCategories() {
  return [
    { id: 'relax', name: 'Bersantai', color: '#4A90D9' },
    { id: 'happy', name: 'Senang', color: '#F4D03F' },
    { id: 'sad', name: 'Sedih', color: '#7D3C98' },
    { id: 'romance', name: 'Romansa', color: '#E74C3C' },
    { id: 'travel', name: 'Perjalanan', color: '#1ABC9C' },
    { id: 'energy', name: 'Mengisi Energi', color: '#E67E22' },
  ];
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Translation function (simulation)
export function translateLyric(text: string, targetLang: string): string {
  // This is a simulation - in real app would use translation API
  const translations: Record<string, Record<string, string>> = {
    'en': {
      'You gotta go and get angry at all of my honesty': 'Kau harus pergi dan marah pada semua kejujuranku',
      'You know I try but I don\'t do too well with apologies': 'Kau tahu aku mencoba tapi aku tidak terlalu baik dengan permintaan maaf',
      'I hope I don\'t run out of time': 'Aku harap aku tidak kehabisan waktu',
      'can someone call a referee?': 'bisakah seseorang memanggil wasit?',
      'Cause I just need one more shot at forgiveness': 'Karena aku hanya butuh satu kesempatan lagi untuk dimaafkan',
    },
    'id': {
      'Pusing tujuh keliling': 'Dizzy going around seven times',
      'aku harus bersaing': 'I have to compete',
      'Buat kamu senyum': 'Make you smile',
    }
  };
  
  return translations[targetLang]?.[text] || `[${targetLang}] ${text}`;
}