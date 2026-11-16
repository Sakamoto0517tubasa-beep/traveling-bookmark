// KOR 簡易Service Worker（アプリの表示を速く・電波が弱くても開けるように）
const CACHE = "kor-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add("/")));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // 同一オリジンのみ対象（Supabase / Google / Open-Meteo 等は常にネットワーク）
  if (url.origin !== self.location.origin) return;

  // ページ(HTML)はネット優先（デプロイ後も最新に）、失敗時キャッシュ
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/"))),
    );
    return;
  }

  // 静的アセット（JS/CSS/画像）はキャッシュ優先
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        }),
    ),
  );
});
