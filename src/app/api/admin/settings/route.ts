import { NextRequest, NextResponse } from "next/server";
import { defaultAdminSettings, genres, type AdminSettings } from "@/lib/music-data";

const requestWindow = new Map<string, { count: number; resetAt: number }>();

const cleanText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.replace(/[<>"'`;{}]/g, "").trim().slice(0, 140) || fallback : fallback;

const cleanCategories = (value: unknown) => {
  if (!Array.isArray(value)) return genres;
  const cleaned = value
    .map((item) => cleanText(item))
    .filter(Boolean)
    .slice(0, 32);
  return cleaned.length ? cleaned : genres;
};

function limited(ip: string) {
  const now = Date.now();
  const current = requestWindow.get(ip);
  if (!current || current.resetAt < now) {
    requestWindow.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 30;
}

export async function GET() {
  return NextResponse.json({ settings: defaultAdminSettings });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Rate limit admin aktif. Tunggu sebentar." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as Partial<AdminSettings> | null;
  if (!body) {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const theme = body.theme === "emerald" || body.theme === "cyber" || body.theme === "neon" ? body.theme : "neon";
  const settings: AdminSettings = {
    bannerTitle: cleanText(body.bannerTitle, defaultAdminSettings.bannerTitle),
    bannerSubtitle: cleanText(body.bannerSubtitle, defaultAdminSettings.bannerSubtitle),
    featuredPlaylist: cleanText(body.featuredPlaylist, defaultAdminSettings.featuredPlaylist),
    theme,
    developerName: cleanText(body.developerName, defaultAdminSettings.developerName),
    categories: cleanCategories(body.categories),
  };

  return NextResponse.json({ ok: true, settings });
}
