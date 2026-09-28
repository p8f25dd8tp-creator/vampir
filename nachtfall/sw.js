/* Nachtfall Service Worker — macht das Spiel offline spielbar.
   Die CACHE-Version wird von build.js automatisch gesetzt. */
const CACHE = 'nachtfall-e607af1ac8';
const ASSETS = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './fonts/cinzel.woff2', './fonts/cormorant-700.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './src/00-core.js', './src/01-artkit.js', './src/02-heroes.js', './src/03-enemies-art.js', './src/04-world-art.js',
  './src/05-data.js', './src/06-fx.js', './src/07-abilities.js', './src/08-enemies.js', './src/09-game.js',
  './src/10-render.js', './src/11-ui.js', './src/12-main.js', './src/13-finn.js', './src/14-story-art.js', './src/15-story.js', './src/16-story-ui.js', './src/17-companions.js', './src/18-bible.js', './src/19-draco.js', './src/20-ulti.js', './src/21-finn-arcade.js', './src/22-helden.js', './src/23-helden2.js', './src/24-kampagne.js'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('nachtfall-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Netz zuerst (damit Updates sofort ankommen), Cache als Rueckfall fuer offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
  );
});
