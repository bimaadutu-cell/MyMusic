"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#030303] px-4 text-white">
      <section className="max-w-md rounded-3xl bg-[#121212] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">Error Boundary</p>
        <h1 className="mt-3 text-3xl font-bold">Sistem tetap aman</h1>
        <p className="mt-3 text-zinc-400">Terjadi gangguan sementara. Klik tombol di bawah untuk memuat ulang.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-[#ff0000] px-6 py-3 font-semibold">Coba Lagi</button>
      </section>
    </main>
  );
}
