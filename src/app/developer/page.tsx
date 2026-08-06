'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Send, ExternalLink, Code, Heart } from 'lucide-react';
import InstagramIcon from '@/components/InstagramIcon';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default function DeveloperPage() {
  const router = useRouter();

  const handleWhatsApp = () => {
    window.open('https://wa.me/6283115955196', '_blank');
  };

  const handleTelegram = () => {
    window.open('https://t.me/b1mxzstore', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/bim09837', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md safe-area-top">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Developer</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pt-4">
        {/* Developer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/20 via-[#00CC6A]/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative p-8 text-center">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-32 h-32 mx-auto mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-full blur-xl opacity-50" />
              <div className="relative w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-full flex items-center justify-center border-2 border-[#00FF88]/30">
                <Code className="w-12 h-12 text-[#00FF88]" />
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00FF88] rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-black fill-black" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-2"
            >
              BimzOfficial
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-6"
            >
              Full Stack Developer & Music Enthusiast
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 mb-8"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00FF88]">MyMusik</p>
                <p className="text-xs text-gray-500">Project</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00FF88]">2024</p>
                <p className="text-xs text-gray-500">Since</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00FF88]">∞</p>
                <p className="text-xs text-gray-500">Passion</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold mb-3">Tentang Developer</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Halo! Saya BimzOfficial, developer di balik aplikasi MyMusik ini. 
            Saya membangun aplikasi ini dengan passion untuk memberikan pengalaman 
            streaming musik terbaik bagi semua orang. Jika Anda memiliki pertanyaan 
            atau saran, jangan ragu untuk menghubungi saya!
          </p>
        </motion.section>

        {/* Contact Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold mb-4">Hubungi Saya</h3>
          
          <div className="space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-gray-500">+62 831-1595-5196</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegram}
              className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Telegram</p>
                <p className="text-sm text-gray-500">@b1mxzstore</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagram}
              className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group"
            >
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <InstagramIcon className="w-6 h-6 text-pink-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-gray-500">@bim09837</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </motion.section>

        {/* Version Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-gray-600">MyMusik v1.0.0</p>
          <p className="text-xs text-gray-600">Built with Next.js & Tailwind CSS</p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}