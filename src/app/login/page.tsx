'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Disc } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useMusicStore } from '@/store/useMusicStore';

const thumbnails = [
  'https://i.ytimg.com/vi/9qwmR23f3m4/maxresdefault.jpg',
  'https://i.ytimg.com/vi/fRh_vgS2dFE/maxresdefault.jpg',
  'https://i.ytimg.com/vi/3rI37Cux_Pc/maxresdefault.jpg',
  'https://i.ytimg.com/vi/S1v7rSNoF9Y/maxresdefault.jpg',
  'https://i.ytimg.com/vi/8T9Cq6Lq2m8/maxresdefault.jpg',
  'https://i.ytimg.com/vi/tQ0yjYUFKAE/maxresdefault.jpg',
  'https://i.ytimg.com/vi/kTJczUoc26U/maxresdefault.jpg',
  'https://i.ytimg.com/vi/oyEuk8j8imI/maxresdefault.jpg',
];

interface GoogleCredentialResponse {
  credential: string;
}

function LoginContent() {
  const router = useRouter();
  const setUser = useMusicStore(state => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [musicCount, setMusicCount] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);

  const handleMusicClick = useCallback(() => {
    setMusicCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setShowDevPanel(true);
        return 0;
      }
      return newCount;
    });
  }, []);

  const handleSuccess = (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      setUser({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        isPremium: false,
        premiumTrial: true,
      });

      localStorage.setItem('mymusik-token', credentialResponse.credential);
      localStorage.setItem('mymusik-premium-trial', 'true');

      router.push('/home');
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-0 flex gap-4"
          animate={{ x: [0, -800] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...thumbnails, ...thumbnails].map((thumb, i) => (
            <div key={`top-${i}`} className="w-36 h-20 rounded-lg overflow-hidden opacity-15 flex-shrink-0">
              <img src={thumb} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </motion.div>

        <motion.div 
          className="absolute bottom-20 right-0 flex gap-4"
          animate={{ x: [0, 800] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...thumbnails, ...thumbnails].map((thumb, i) => (
            <div key={`bottom-${i}`} className="w-36 h-20 rounded-lg overflow-hidden opacity-15 flex-shrink-0">
              <img src={thumb} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#00FF88]/20">
            <Music className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text">MyMusik</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Streaming Musik Modern</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-2 text-center">Selamat Datang</h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            Login untuk mulai menikmati musik tanpa batas
          </p>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap={false}
              theme="filled_black"
              size="large"
              width="250"
              text="signin_with"
              shape="pill"
            />
          </div>

          <p className="text-xs text-gray-600 text-center mt-6">
            Dengan login, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-600 text-sm">
            Developed by{' '}
            <span 
              onClick={handleMusicClick}
              className="text-[#00FF88] cursor-pointer hover:underline"
            >
              BimzOfficial
            </span>
          </p>
          {musicCount > 0 && musicCount < 7 && (
            <p className="text-xs text-gray-700 mt-1">{7 - musicCount} lagi...</p>
          )}
        </motion.div>
      </div>

      {/* Developer Panel */}
      <AnimatePresence>
        {showDevPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6"
          >
            <div className="bg-[#121212] rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold text-[#00FF88] mb-4">Developer Panel</h2>
              <p className="text-gray-400 mb-4 text-sm">Pilih sumber musik:</p>
              <div className="space-y-3">
                <button
                  onClick={() => { localStorage.setItem('mymusik-source', 'default'); setShowDevPanel(false); }}
                  className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">Default</span>
                  <p className="text-xs text-gray-500">Sumber musik bawaan</p>
                </button>
                <button
                  onClick={() => { localStorage.setItem('mymusik-source', 'gootube'); setShowDevPanel(false); }}
                  className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">GoTube Music</span>
                  <p className="text-xs text-gray-500">Sumber musik alternatif</p>
                </button>
              </div>
              <button
                onClick={() => setShowDevPanel(false)}
                className="w-full mt-4 py-3 text-gray-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Disc className="w-12 h-12 text-[#00FF88]" />
              </motion.div>
              <p className="text-gray-400 mt-4">Masuk...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="31737731016-a1ed3n5ok7c2ejjadtd2f3i9omo0uvp5.apps.googleusercontent.com">
      <LoginContent />
    </GoogleOAuthProvider>
  );
}