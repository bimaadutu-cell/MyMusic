'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';

export default function RootPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('mymusik-token');
    
    if (!showSplash) {
      if (token) {
        router.push('/home');
      } else {
        router.push('/login');
      }
    }
  }, [showSplash, router]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF88]" />
    </div>
  );
}