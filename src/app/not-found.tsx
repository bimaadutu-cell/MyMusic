import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#030303] px-4 text-white">
      <section className="max-w-md rounded-3xl bg-[#121212] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">404</p>
        <h1 className="mt-3 text-4xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="mt-3 text-zinc-400">Rute yang kamu buka tidak tersedia di MyMusik.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#ff0000] px-6 py-3 font-semibold">Kembali Home</Link>
      </section>
    </main>
  );
}
