'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Play, Search, Library, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Beranda', href: '/home' },
  { icon: Play, label: 'Sampel', href: '/sample' },
  { icon: Search, label: 'Telusuri', href: '/search' },
  { icon: Library, label: 'Koleksi', href: '/library' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [showDeveloper, setShowDeveloper] = useState(false);
  const [musicCount, setMusicCount] = useState(0);

  const handleDeveloperClick = () => {
    setMusicCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setShowDeveloper(true);
        return 0;
      }
      return newCount;
    });
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]/95 backdrop-blur-lg border-t border-white/5 safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center py-2 px-4 min-w-[64px]"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "relative",
                    isActive ? "text-[#00FF88]" : "text-gray-400"
                  )}
                >
                  <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF88] rounded-full"
                    />
                  )}
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-1",
                  isActive ? "text-[#00FF88] font-medium" : "text-gray-400"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Developer Tab - Hidden Feature */}
          <button
            onClick={handleDeveloperClick}
            className={cn(
              "flex flex-col items-center py-2 px-4 min-w-[64px]",
              pathname === '/developer' ? "text-[#00FF88]" : "text-gray-400"
            )}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] mt-1">Developer</span>
          </button>
        </div>
      </nav>

      {/* Developer Panel */}
      {showDeveloper && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6"
        >
          <div className="bg-[#121212] rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold text-[#00FF88] mb-4">Developer Panel</h2>
            <p className="text-gray-400 mb-4 text-sm">Pilih sumber musik:</p>
            <div className="space-y-3">
              <button
                onClick={() => { localStorage.setItem('mymusik-source', 'default'); setShowDeveloper(false); }}
                className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
              >
                <span className="text-white font-medium">Default</span>
                <p className="text-xs text-gray-500">Sumber musik bawaan</p>
              </button>
              <button
                onClick={() => { localStorage.setItem('mymusik-source', 'gootube'); setShowDeveloper(false); }}
                className="w-full p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-colors"
              >
                <span className="text-white font-medium">GoTube Music</span>
                <p className="text-xs text-gray-500">Sumber musik alternatif</p>
              </button>
            </div>
            <button
              onClick={() => setShowDeveloper(false)}
              className="w-full mt-4 py-3 text-gray-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}