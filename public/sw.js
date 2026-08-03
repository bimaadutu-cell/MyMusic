const CACHE_VERSION = "mymusik-v3.0.0-offline-app";
const APP_SHELL = [
  "/",
  "/about",
  "/admin",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/mymusik-logo.png",
  "/images/developer-bimzofficial.png",
  "/images/mymusik-og.png",
  "/images/offline-neon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const shell = await cache.match("/");
      if (shell) return shell;
      return cache.match("/offline.html");
    }
    throw new Error("Offline and no cache available");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.hostname.includes("youtube.com") || url.hostname.includes("googleapis") || url.hostname.includes("lrclib") || url.hostname.includes("mymemory")) return;

  if (request.mode === "navigate" || url.pathname.startsWith("/api/catalog")) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("sync", (event) => {
  if (event.tag === "mymusik-background-sync") {
    event.waitUntil(Promise.resolve());
  }
});
