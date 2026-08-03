import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#050505] px-4 text-white">
      <section className="max-w-lg rounded-[2.3rem] border border-emerald-300/20 bg-white/[0.045] p-7 text-center shadow-[0_0_80px_rgba(0,255,136,0.18)] backdrop-blur-2xl">
        <Image src="/images/offline-neon.png" width={420} height={420} alt="MyMusik offline" className="mx-auto rounded-[2rem]" />
        <h1 className="mt-6 text-4xl font-black">MyMusik Offline</h1>
        <p className="mt-3 leading-7 text-zinc-300">Aset aplikasi tersedia lewat cache PWA. Sambungkan internet untuk memuat pemutar resmi dan metadata terbaru.</p>
        <Link href="/" className="mt-6 inline-flex rounded-2xl bg-emerald-300 px-5 py-3 font-black text-black">Kembali Home</Link>
      </section>
    </main>
  );
}
