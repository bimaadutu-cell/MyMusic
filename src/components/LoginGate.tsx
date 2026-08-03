"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { musicCatalog } from "@/lib/music-data";

export type AuthUser = { name: string; email: string; since?: number };

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: string; auto_select?: boolean }) => void;
          prompt: () => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.7 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5Z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5Z" />
    <path fill="#FBBC05" d="M10.5 28.6a14.5 14.5 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2Z" />
    <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48Z" />
  </svg>
);

export function LoginGate({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [accounts, setAccounts] = useState<AuthUser[]>([]);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [gisReady, setGisReady] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const standalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    try {
      setAccounts(JSON.parse(localStorage.getItem("mymusik-google-accounts") ?? "[]") as AuthUser[]);
    } catch {
      setAccounts([]);
    }
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "mymusik-auth" && event.data.user) onLogin(event.data.user as AuthUser);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "mymusik-auth" && event.newValue) {
        try {
          onLogin(JSON.parse(event.newValue) as AuthUser);
        } catch {
          /* abaikan */
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
    };
  }, [onLogin]);

  useEffect(() => {
    if (!clientId) return;
    const handleCredential = (response: { credential: string }) => {
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1])) as { name?: string; email?: string };
        if (payload.email) onLogin({ name: payload.name ?? payload.email.split("@")[0], email: payload.email, since: Date.now() });
      } catch {
        setChooserOpen(true);
      }
    };
    const ready = () => {
      window.google?.accounts?.id?.initialize({ client_id: clientId, callback: handleCredential, ux_mode: "popup", auto_select: false });
      setGisReady(true);
      if (buttonRef.current) {
        window.google?.accounts?.id?.renderButton(buttonRef.current, { theme: "filled_black", size: "large", shape: "pill", width: 320, text: "continue_with" });
      }
      try {
        window.google?.accounts?.id?.prompt();
      } catch {
        /* one tap tidak tersedia */
      }
    };
    if (window.google?.accounts?.id) {
      ready();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = ready;
    script.onerror = () => setGisReady(false);
    document.head.appendChild(script);
  }, [clientId, onLogin]);

  const saveAccount = (user: AuthUser) => {
    const withSince = { ...user, since: Date.now() };
    const merged = [withSince, ...accounts.filter((account) => account.email !== user.email)];
    localStorage.setItem("mymusik-google-accounts", JSON.stringify(merged));
    setAccounts(merged);
    onLogin(withSince);
  };

  const continueGoogle = () => {
    if (gisReady && clientId) {
      window.google?.accounts?.id?.prompt();
      return;
    }
    setChooserOpen(true);
  };

  const covers = [...musicCatalog, ...musicCatalog];

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-hidden bg-[#030303] px-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-glowpulse absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ff0000]/25 blur-3xl" />
        <div className="absolute left-0 right-0 top-10 opacity-40">
          <div className="animate-marquee flex w-max gap-3">
            {covers.map((track, index) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={`a-${track.id}-${index}`} src={track.cover} alt="" className={`h-20 w-20 shrink-0 rounded-xl object-cover ${index % 2 ? "rotate-3" : "-rotate-3"}`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-10 left-0 right-0 opacity-40">
          <div className="animate-marquee flex w-max gap-3" style={{ animationDirection: "reverse", animationDuration: "32s" }}>
            {covers.map((track, index) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={`b-${track.id}-${index}`} src={track.cover} alt="" className={`h-20 w-20 shrink-0 rounded-xl object-cover ${index % 2 ? "-rotate-3" : "rotate-3"}`} />
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[#030303]/70" />
      </div>

      <motion.div initial={{ opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 26 }} className="relative w-full max-w-sm">
        <div className="animate-floaty mx-auto w-fit">
          <Image src="/icons/mymusik-logo.png" width={96} height={96} priority alt="MyMusik" className="rounded-full shadow-[0_0_60px_rgba(255,0,0,0.5)]" />
        </div>
        <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-white">MyMusik</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Streaming Musik Modern • Developed by BimzOfficial</p>

        <div className="mt-8 flex justify-center">
          <div ref={buttonRef} className="hidden data-[ready]:block" data-ready={gisReady ? "" : undefined} />
        </div>
        <button onClick={continueGoogle} className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 font-semibold text-zinc-800 shadow-lg transition hover:bg-zinc-100">
          <GoogleMark />
          Lanjutkan dengan Google
        </button>
        <p className="mt-4 text-center text-[11px] leading-5 text-zinc-500">
          {standalone ? "Mode aplikasi: akun Google perangkat dipilih di dalam aplikasi tanpa membuka browser." : "Akun Google asli di perangkat ini akan ditampilkan untuk dipilih."}
        </p>
      </motion.div>

      {chooserOpen ? (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-5 backdrop-blur">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm rounded-3xl bg-white p-6 text-zinc-800 shadow-2xl">
            <div className="flex items-center gap-2">
              <GoogleMark />
              <span className="text-lg font-medium">Pilih akun</span>
            </div>
            <p className="mt-1 text-sm text-zinc-600">untuk melanjutkan ke MyMusik</p>
            <div className="mt-4 space-y-1">
              {accounts.map((account) => (
                <button key={account.email} onClick={() => saveAccount(account)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-zinc-100">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff0000] text-sm font-bold text-white">{account.name[0]?.toUpperCase()}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium capitalize">{account.name}</span>
                    <span className="block truncate text-xs text-zinc-500">{account.email}</span>
                  </span>
                </button>
              ))}
              {adding ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const clean = newEmail.trim().toLowerCase();
                    if (!clean.includes("@")) return;
                    saveAccount({ name: clean.split("@")[0].replace(/[._]/g, " "), email: clean });
                  }}
                  className="rounded-xl border border-zinc-200 p-3"
                >
                  <input autoFocus value={newEmail} onChange={(event) => setNewEmail(event.target.value)} type="email" placeholder="akun@gmail.com" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-[#4285F4]" />
                  <button className="mt-2 w-full rounded-lg bg-[#1a73e8] py-2 text-sm font-semibold text-white">Lanjutkan</button>
                </form>
              ) : (
                <button onClick={() => setAdding(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#1a73e8] transition hover:bg-zinc-100">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 text-lg text-zinc-500">+</span>
                  Gunakan akun lain
                </button>
              )}
            </div>
            <button onClick={() => setChooserOpen(false)} className="mt-4 w-full rounded-xl py-2 text-sm font-medium text-zinc-500">Batal</button>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
