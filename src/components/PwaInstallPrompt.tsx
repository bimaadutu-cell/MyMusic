"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt({ onToast }: { onToast?: (message: string) => void }) {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIosHint, setIsIosHint] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("mymusik-install-dismissed");
    const installed = window.matchMedia("(display-mode: standalone)").matches;
    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    if (isiOS && !installed && dismissed !== "true") {
      const timer = window.setTimeout(() => {
        setIsIosHint(true);
        setVisible(true);
      }, 3200);
      return () => window.clearTimeout(timer);
    }

    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      if (dismissed !== "true") {
        setEvent(installEvent as BeforeInstallPromptEvent);
        window.setTimeout(() => setVisible(true), 3200);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (isIosHint) {
      onToast?.("iOS: tap Share lalu Add to Home Screen.");
      setVisible(false);
      return;
    }
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    onToast?.(choice.outcome === "accepted" ? "MyMusik berhasil dipasang." : "Install dibatalkan.");
    setVisible(false);
    setEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem("mymusik-install-dismissed", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-x-4 bottom-36 z-[70] mx-auto max-w-md rounded-2xl bg-[#212121] p-5 shadow-2xl"
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
        >
          <div className="flex gap-4">
            <Image src="/icons/mymusik-logo.svg" width={52} height={52} alt="MyMusik" className="rounded-full" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Install MyMusik</h2>
              <p className="mt-1 text-sm leading-6 text-zinc-300">Dengarkan musik langsung dari Home Screen dengan performa lebih cepat.</p>
              {isIosHint ? <p className="mt-2 text-xs text-zinc-400">iOS: gunakan menu Share → Add to Home Screen.</p> : null}
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button onClick={dismiss} className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300">Nanti Saja</button>
            <button onClick={install} className="rounded-full bg-[#ff0000] px-5 py-2 text-sm font-semibold text-white">Install Sekarang</button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
