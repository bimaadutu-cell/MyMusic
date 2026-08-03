"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultAdminSettings, type AdminSettings } from "@/lib/music-data";

const loadSettings = (): AdminSettings => {
  if (typeof window === "undefined") return defaultAdminSettings;
  try {
    const raw = localStorage.getItem("mymusik-admin-settings");
    return raw ? ({ ...defaultAdminSettings, ...JSON.parse(raw) } as AdminSettings) : defaultAdminSettings;
  } catch {
    return defaultAdminSettings;
  }
};

export default function AdminPanelPage() {
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [categoryDraft, setCategoryDraft] = useState(defaultAdminSettings.categories.join(", "));
  const [status, setStatus] = useState("Siap mengelola MyMusik.");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    setCategoryDraft(saved.categories.join(", "));
  }, []);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    const next: AdminSettings = {
      ...settings,
      categories: categoryDraft.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 32),
    };
    try {
      const response = await fetch("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const payload = (await response.json()) as { settings?: AdminSettings; error?: string };
      if (!response.ok || !payload.settings) throw new Error(payload.error ?? "Gagal menyimpan");
      localStorage.setItem("mymusik-admin-settings", JSON.stringify(payload.settings));
      setSettings(payload.settings);
      setStatus("Pengaturan website berhasil disimpan dan tervalidasi API.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    localStorage.removeItem("mymusik-admin-settings");
    setSettings(defaultAdminSettings);
    setCategoryDraft(defaultAdminSettings.categories.join(", "));
    setStatus("Pengaturan dikembalikan ke default.");
  };

  return (
    <main className="min-h-dvh bg-[#030303] px-4 py-8 text-white sm:px-6">
      <section className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 rounded-full bg-[#121212] px-4 py-2.5">
            <Image src="/icons/mymusik-logo.svg" width={38} height={38} alt="MyMusik" className="rounded-full" />
            <span className="font-semibold">MyMusik Admin</span>
          </Link>
          <div className="flex gap-2">
            <button onClick={reset} className="rounded-full bg-[#272727] px-5 py-2.5 text-sm font-semibold">Reset</button>
            <button onClick={save} disabled={saving} className="rounded-full bg-[#ff0000] px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
              {saving ? "Menyimpan..." : "Simpan Settings"}
            </button>
          </div>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-[#121212] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-red-400">Control Center</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Admin Panel</h1>
            <p className="mt-3 max-w-2xl text-zinc-400">Kelola banner, playlist pilihan, kategori, informasi developer, tema, dan pengaturan website.</p>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <Field label="Judul Banner">
                <input value={settings.bannerTitle} onChange={(event) => update("bannerTitle", event.target.value)} className="admin-input" />
              </Field>
              <Field label="Playlist Pilihan">
                <input value={settings.featuredPlaylist} onChange={(event) => update("featuredPlaylist", event.target.value)} className="admin-input" />
              </Field>
              <Field label="Informasi Developer">
                <input value={settings.developerName} onChange={(event) => update("developerName", event.target.value)} className="admin-input" />
              </Field>
              <Field label="Tema">
                <select value={settings.theme} onChange={(event) => update("theme", event.target.value as AdminSettings["theme"])} className="admin-input">
                  <option value="neon">Dark Premium</option>
                  <option value="emerald">Classic Red</option>
                  <option value="cyber">Midnight</option>
                </select>
              </Field>
              <Field label="Subjudul Banner">
                <textarea value={settings.bannerSubtitle} onChange={(event) => update("bannerSubtitle", event.target.value)} className="admin-input min-h-28" />
              </Field>
              <Field label="Kategori / Genre">
                <textarea value={categoryDraft} onChange={(event) => setCategoryDraft(event.target.value)} className="admin-input min-h-28" />
              </Field>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl bg-[#121212] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">Live Preview</p>
              <div className="mt-4 rounded-2xl bg-[#4a1d24] p-5">
                <h2 className="text-2xl font-bold">{settings.bannerTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-200">{settings.bannerSubtitle}</p>
                <p className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-black">{settings.featuredPlaylist}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-[#1f1414] p-5 text-sm leading-7 text-zinc-200">Status: {status}</div>
            <div className="rounded-3xl bg-[#121212] p-5 text-sm leading-7 text-zinc-400">
              Keamanan aktif: sanitization API, rate limit, CSP via Next headers, preferensi lokal, dan fallback anti-crash.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-300">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
