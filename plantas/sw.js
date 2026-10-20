// Guarda la app en el móvil para abrirla sin conexión. Solo toca peticiones GET del propio sitio;
// nunca las del servicio de identificación. Al cambiar los ficheros, sube VERSION.
const VERSION = "mis-plantas-v2";
const SHELL = [
  "./", "index.html", "manifest.webmanifest", "css/app.css",
  "icons/icon.svg", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "js/main.js", "js/router.js", "js/species.js", "js/schedule.js", "js/calendar.js", "js/identify.js", "js/backup.js",
  "js/image.js", "js/garden.js", "js/notify.js", "js/store-db.js", "js/store-idb.js",
  "js/ui/dom.js", "js/ui/common.js", "js/ui/home.js", "js/ui/plant.js", "js/ui/edit.js", "js/ui/identify.js", "js/ui/settings.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la red (para recibir mejoras) y, sin conexión, la copia guardada.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(async () => (await caches.match(req)) ?? (req.mode === "navigate" ? caches.match("index.html") : Response.error())));
});
