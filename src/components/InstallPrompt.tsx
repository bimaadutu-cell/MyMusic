'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Music } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('install-prompt-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      if (!dismissed || Date.now() - dismissedTime > oneWeek) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('mymusik-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#121212] rounded-2xl p-5 border border-[#00FF88]/20 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00FF88] to-[#00CC6A] rounded-xl flex items-center justify-center flex-shrink-0">
                <Music className="w-7 h-7 text-black" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-lg mb-1">Install MyMusik</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Dengarkan musik langsung dari Home Screen dengan performa lebih cepat.
                </p>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleInstall}
                className="flex-1 bg-[#00FF88] hover:bg-[#00CC6A] text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Install Sekarang
              </button>
              <button
                onClick={handleDismiss}
                className="px-5 py-3 text-gray-400 hover:text-white font-medium transition-colors"
              >
                Nanti
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}