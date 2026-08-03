import type { Metadata } from "next";
import Link from "next/link";
import { DevPhoto } from "@/components/DevPhoto";

export const metadata: Metadata = {
  title: "About Developer | MyMusik",
  description: "Profil BimzOfficial, developer MyMusik PWA premium.",
};

export default function AboutDeveloperPage() {
  return (
    <main className="min-h-dvh bg-[#030303] px-4 py-8 text-white sm:px-6">
      <section className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="mx-auto w-full max-w-sm">
          <DevPhoto />
        </div>
        <div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#272727] px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-[#3a3a3a]">
            ← Kembali ke MyMusik
          </Link>
          <p className="mt-8 inline-flex rounded-full bg-[#272727] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300">
            Developed by
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">BimzOfficial</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            MyMusik dibuat sebagai Progressive Web App musik premium dengan struktur modern, pencarian lagu lengkap, player resmi di dalam web, dan pengalaman installable di Android maupun iOS.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Info label="Nama" value="BimzOfficial" />
            <Info label="WhatsApp" value="6283115955196" />
            <Info label="Telegram" value="@b1mxzstore" />
            <Info label="Instagram" value="bim_bim" />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://wa.me/6283115955196" target="_blank" rel="noreferrer" className="rounded-full bg-[#ff0000] px-6 py-3 font-semibold text-white transition hover:brightness-110">
              Chat WhatsApp
            </a>
            <a href="https://t.me/b1mxzstore" target="_blank" rel="noreferrer" className="rounded-full bg-[#272727] px-6 py-3 font-semibold text-white transition hover:bg-[#3a3a3a]">
              Telegram
            </a>
            <a href="https://www.instagram.com/bim09837?igsh=MWlibHdxZDJ1NmltOQ==" target="_blank" rel="noreferrer" className="rounded-full bg-[#272727] px-6 py-3 font-semibold text-white transition hover:bg-[#3a3a3a]">
              Instagram
            </a>
          </div>
          <div className="mt-8 rounded-2xl bg-[#121212] p-5 text-sm leading-7 text-zinc-400">
            Mau jadi APK? Setelah deploy, bungkus web ini menjadi APK Android lewat{" "}
            <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="font-semibold text-white underline">
              PWABuilder
            </a>{" "}
            atau install langsung sebagai PWA dari menu browser.
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#121212] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold">{value}</p>
    </div>
  );
}
