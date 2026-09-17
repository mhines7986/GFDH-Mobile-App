const CACHE_NAME = "gfdh-game-v3";
const APP_SHELL = [
    "./",
    "./index.html",
    "./history.html",
    "./settings.html",
    "./style.css",
    "./manifest-dh.json",
    "./icon.svg",
    "./devil-icon-192.png",
    "./devil-icon-512.png",
    "./devil-apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const isAppPage = event.request.mode === "navigate" ||
        ["index.html", "history.html", "settings.html", "style.css"].some((file) => event.request.url.endsWith(file));

    if (isAppPage) {
        event.respondWith(
            fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return response;
        }))
    );
});
