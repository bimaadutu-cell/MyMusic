const CACHE_NAME = "mymusik-v5";
const ASSETS = ["/", "/logo.png", "/dev-logo.jpg", "/manifest.json"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Jangan pernah cache audio stream agar latar belakang tidak terganggu memori cache
  if (url.pathname.startsWith('/api/stream')) return;

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open('mymusik-api').then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then(res => res || new Response("[]", { headers: { "Content-Type": "application/json" } })))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then((r) => {
        return r || fetch(e.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        }).catch(() => caches.match("/"));
      })
    );
  }
});
